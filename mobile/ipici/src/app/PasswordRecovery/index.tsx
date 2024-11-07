import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Text } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { resetPassword } from '../../service/user/userService';
import {ResetPassword} from '../../service/user/types';

type PasswordRecoveryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PasswordRecovery'>;

type PasswordRecoveryScreenProps = {
  navigation: PasswordRecoveryScreenNavigationProp;
};

export default function PasswordRecoveryScreen({ navigation }: PasswordRecoveryScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePasswordRecovery = async () => {
    if (emailError || !email) {
      setMessage({ type: 'error', text: 'Por favor, insira um email válido.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const resetPasswordData: ResetPassword = { email };
      await resetPassword(resetPasswordData);
      setMessage({ type: 'success', text: 'Se o seu email estiver cadastrado, você receberá uma mensagem com instruções para redefinir sua senha em breve.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao solicitar recuperação de senha. Tente novamente mais tarde.' });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    setEmailError(!text.includes('@'));
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background_dot.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <View style={styles.container}>
        <Title style={styles.title}>Recuperar Senha</Title>
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

        <Button
          mode="contained"
          onPress={handlePasswordRecovery}
          style={styles.button}
          loading={loading}
          disabled={loading || emailError || !email}
          buttonColor="#1B68AC"
        >
          Enviar Email de Recuperação
        </Button>
        {message && (
          <Text style={[styles.message, message.type === 'error' ? styles.errorText : styles.successText]}>
            {message.text}
          </Text>
        )}
      </View>
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
  button: {
    paddingVertical: 5,
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
  },
  successText: {
    color: 'green',
  },
});
