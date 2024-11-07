import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { reportProblem } from '../../service/device/deviceService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const ReportProblemScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { device, token } = route.params as { device: number, token: string };

  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await reportProblem(token, {
        device,
        description,
        image,
        status: 'RELATADO',
      });
      Alert.alert('Sucesso', 'Problema relatado com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível relatar o problema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Relatar Problema</Text>
      
      <Text style={styles.label}>Descrição do Problema</Text>
      <TextInput
        style={styles.input}
        placeholder="Descreva o problema..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Adicionar Imagem</Text>
      <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
        <FontAwesome name="camera" size={16} color="#fff" style={styles.icon} />
        <Text style={styles.imagePickerButtonText}>Escolher Imagem</Text>
      </TouchableOpacity>


      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Relatar Problema</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ReportProblemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    height: 120,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#1B68AC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1B68AC',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 8,
  },
});
