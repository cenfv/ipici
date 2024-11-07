import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AuthLoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        if (token) {
          router.push({ pathname: '/(tabs)/MapDevices' });
        } else {
          router.push({ pathname: '/' });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push({ pathname: '/' });
      }
    };

    checkAuthentication();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1B68AC" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
