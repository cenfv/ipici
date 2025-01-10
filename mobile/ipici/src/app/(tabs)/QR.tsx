import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../service/utils/api';


export default function QrScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await api.get(`/devices/by-qr/?code=${encodeURIComponent(data)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        router.push({
          pathname: '/MapDevices',
          params: { 
            deviceId: response.data.id,
            showDetails: 'true' 
          }
        });
      } else {
        Alert.alert('Erro', 'Dispositivo não encontrado');
        setScanned(false);
      }
    } catch (error) {
      console.error('Erro ao buscar dispositivo:', error);
      Alert.alert('Erro', 'Erro ao buscar informações do dispositivo');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão para acessar a câmera...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Permissão para acessar a câmera foi negada</Text>;
  }

  return (
    <View style={styles.container}>
      {scanned ? (
        <>
          <Text style={styles.qrData}>Dispositivo encontrado! Redirecionando...</Text>
          <Button title="Escanear novamente" onPress={() => setScanned(false)} />
        </>
      ) : (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrData: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
});
