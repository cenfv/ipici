from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.db import transaction, models
from django.contrib.admin.models import LogEntry
from audit.models import AuditLog


IGNORED_MODELS = (AuditLog, LogEntry)


def should_log_model(model):
    return not issubclass(model, IGNORED_MODELS)


def create_log(action, user, instance, changes=None):
    if not should_log_model(instance.__class__):
        return

    AuditLog.objects.create(
        action=action,
        user=user,
        content_type=ContentType.objects.get_for_model(instance.__class__),
        object_id=str(instance.pk),
        object_repr=str(instance),
        changes=changes
    )


def get_change_message(old_instance, new_instance):
    if not old_instance:
        return None

    changes = {}
    for field in new_instance._meta.fields:
        field_name = field.name
        if field_name in ['created_at', 'updated_at']:
            continue

        old_value = getattr(old_instance, field_name)
        new_value = getattr(new_instance, field_name)

        if isinstance(field, models.ForeignKey):
            old_value = str(old_value) if old_value else None
            new_value = str(new_value) if new_value else None

        if old_value != new_value:
            changes[field_name] = {
                'old': old_value,
                'new': new_value
            }

    return changes if changes else None


@receiver(pre_save)
def log_pre_save(sender, instance, **kwargs):

    if not should_log_model(sender):
        return

    if instance.pk:
        try:
            instance._pre_save_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._pre_save_instance = None


@receiver(post_save)
def log_post_save(sender, instance, created, **kwargs):

    if not should_log_model(sender):
        return

    def _do_log():
        try:
            user = getattr(instance, '_current_user', None)

            changes = None
            if not created:
                changes = get_change_message(
                    getattr(instance, '_pre_save_instance', None),
                    instance
                )

            if created or changes:
                create_log(
                    action='CREATE' if created else 'UPDATE',
                    user=user,
                    instance=instance,
                    changes=changes
                )
        except Exception as e:
            print(f"Erro ao criar log: {e}")

    transaction.on_commit(_do_log)


@receiver(pre_delete)
def log_deletion(sender, instance, **kwargs):
    if not should_log_model(sender):
        return

    def _do_delete_log():
        try:
            user = getattr(instance, '_current_user', None)
            create_log(
                action='DELETE',
                user=user,
                instance=instance
            )
        except Exception as e:
            print(f"Erro ao criar log de deleção: {e}")

    transaction.on_commit(_do_delete_log)