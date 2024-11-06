import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type PasswordRecoveryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PasswordRecovery'>;

type PasswordRecoveryScreenProps = {
  navigation: PasswordRecoveryScreenNavigationProp;
};

export default function PasswordRecoveryScreen({ navigation }: PasswordRecoveryScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<boolean>(false);

  const handlePasswordRecovery = () => {
    console.log("Recuperação de senha solicitada para", email);
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
          disabled={emailError || !email}
          buttonColor="#1B68AC"
        >
          Enviar Email de Recuperação
        </Button>
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
    marginTop: 20,
    paddingVertical: 5,
  },
});
