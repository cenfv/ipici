import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ImageBackground } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types/types';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);

  const router = useRouter();

  const handleLogin = () => {
    console.log("Logando com", email, password);
  };

  const handlePasswordRecovery = () => {
    router.push({ pathname: '/PasswordRecovery' });
  };

  const handleRegister = () => {
    router.push({ pathname: '/Register' });
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
      <Title style={styles.title}>Seja Bem-vindo!</Title>

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
        disabled={emailError || !email || !password}
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1B68AC',
  },
  input: {
    marginBottom: 10,
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
