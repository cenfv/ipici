import React, { useState } from "react";
import { ScrollView, View, StyleSheet, ImageBackground, Text } from "react-native";
import {
  TextInput,
  Button,
  Title,
  HelperText,
  Divider,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from "../../service/user/userService";
import { User } from "../../service/user/types";
import moment from "moment";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  street: string;
  number: number;
  neighborhood: string;
  complement?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

const schema = Yup.object().shape({
  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  firstName: Yup.string().required("Nome é obrigatório"),
  lastName: Yup.string().required("Sobrenome é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  birthDate: Yup.string()
    .required("Data de nascimento é obrigatória")
    .test("is-valid-date", "Data de nascimento inválida", (value) =>
      moment(value, "DD/MM/YYYY", true).isValid()
    ), 
  street: Yup.string().required("Rua é obrigatória"),
  number: Yup.number().required("Número é obrigatório"),
  neighborhood: Yup.string().required("Bairro é obrigatório"),
  complement: Yup.string().nullable(),
  city: Yup.string().required("Cidade é obrigatória"),
  state: Yup.string().required("Estado é obrigatório"),
  zipCode: Yup.string().required("CEP é obrigatório"),
  country: Yup.string().required("País é obrigatório"),
});

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D+/g, "");
    let formattedDate = cleaned;

    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formattedDate = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length >= 5) {
      formattedDate = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    return formattedDate;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setMessage(null);

    const birthDateFormatted = moment(data.birthDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    const userData = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      birth_date: birthDateFormatted,
      address: {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        complement: data.complement,
        city: data.city,
        state: data.state,
        zip_code: parseInt(data.zipCode, 10),
        country: parseInt(data.country, 10),
      },
    };

    try {
      await register(userData as User);
      setMessage({ type: 'success', text: 'Um email com instruções para redefinir sua senha foi enviado para o endereço informado.' });
      setTimeout(() => {
        router.push('/');
      }, 5000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Falha ao registrar usuário. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background_dot.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Title style={styles.title}>Criar Conta</Title>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="E-mail"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  theme={{ colors: { primary: "#1B68AC" } }}
                  dense
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Nome"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  theme={{ colors: { primary: "#1B68AC" } }}
                  dense
                />
                <HelperText type="error" visible={!!errors.firstName}>
                  {errors.firstName?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Sobrenome"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  theme={{ colors: { primary: "#1B68AC" } }}
                  dense
                />
                <HelperText type="error" visible={!!errors.lastName}>
                  {errors.lastName?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Telefone"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  mode="outlined"
                  keyboardType="phone-pad"
                  theme={{ colors: { primary: "#1B68AC" } }}
                  dense
                />
                <HelperText type="error" visible={!!errors.phone}>
                  {errors.phone?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Data de Nascimento"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatBirthDate(text))}
                  value={value}
                  mode="outlined"
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  theme={{ colors: { primary: "#1B68AC" } }}
                  dense
                />
                <HelperText type="error" visible={!!errors.birthDate}>
                  {errors.birthDate?.message}
                </HelperText>
              </View>
            )}
          />

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Endereço</Title>

          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Rua"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.street}>
            {errors.street?.message}
          </HelperText>

          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Número"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ? value.toString() : ""}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.number}>
            {errors.number?.message}
          </HelperText>

          <Controller
            control={control}
            name="complement"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Complemento"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ""}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.complement}>
            {errors.complement?.message}
          </HelperText>

          <Controller
            control={control}
            name="neighborhood"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Bairro"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.neighborhood}>
            {errors.neighborhood?.message}
          </HelperText>

          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Cidade"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.city}>
            {errors.city?.message}
          </HelperText>

          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Estado"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.state}>
            {errors.state?.message}
          </HelperText>

          <Controller
            control={control}
            name="zipCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="CEP"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                keyboardType="numeric"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.zipCode}>
            {errors.zipCode?.message}
          </HelperText>

          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="País"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                theme={{ colors: { primary: "#1B68AC" } }}
                dense
              />
            )}
          />
          <HelperText type="error" visible={!!errors.country}>
            {errors.country?.message}
          </HelperText>
          {message && (
            <Text style={[styles.message, message.type === 'error' ? styles.errorText : styles.successText]}>
              {message.text}
            </Text>
          )}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            buttonColor="#1B68AC"
            loading={loading}
          >
            Cadastrar
          </Button>
         
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1B68AC",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#1B68AC",
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
  },
  successText: {
    color: 'green',
  },
  divider: {
    marginVertical: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
  },
});
