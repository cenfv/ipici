import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types/types';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../service/user/authService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const router = useRouter();

  const handleLogin = async () => {
    if (emailError || !email || !password) {
      setMessage({ type: 'error', text: 'Preencha todos os campos corretamente.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const credentials = { email, password };
      const response = await login(credentials);

      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);

      setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
      router.push({ pathname: '/(tabs)/MapDevices', params: {} });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setMessage({ type: 'error', text: 'Falha ao realizar login. Verifique suas credenciais.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = () => {
    router.push({ pathname: '/PasswordRecovery', params: {} });
  };

  const handleRegister = () => {
    router.push({ pathname: '/Register', params: {} });
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    setEmailError(!text.includes('@'));
  };

  return (
    <ImageBackground
      source={require('../assets/images/background_dot.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Title style={styles.title}>Seja Bem-vindo!</Title>

        {message && (
          <Text style={[styles.message, message.type === 'error' ? styles.errorText : styles.successText]}>
            {message.text}
          </Text>
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={validateEmail}
          style={styles.input}
          mode="outlined"
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          theme={{ colors: { primary: '#1B68AC' } }}
        />
        <HelperText type="error" visible={emailError}>
          Insira um endereço de email válido.
        </HelperText>

        <TextInput
          label="Senha"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          mode="outlined"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          theme={{ colors: { primary: '#1B68AC' } }}
        />

        <TouchableOpacity onPress={handlePasswordRecovery}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading || emailError || !email || !password}
          buttonColor="#1B68AC"
        >
          Iniciar Sessão
        </Button>

        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerText}>Não tem uma conta? Registre-se</Text>
        </TouchableOpacity>
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
    flex: 1,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150, 
    height: 200, 
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1B68AC',
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
  input: {
    marginBottom: 2,
  },
  forgotPasswordText: {
    color: '#1B68AC',
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 5,
  },
  registerText: {
    color: '#1B68AC',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
