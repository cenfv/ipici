import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Text, Button, ActivityIndicator, Avatar, Card, Divider, Snackbar, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByBearer } from '../../service/user/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface Address {
  street: string;
  number: number;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  country: number;
  zip_code: number;
}

interface User {
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  address: Address | null;
}

export default function UserScreen({  }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();

  const primaryColor = '#1B68AC';

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const userData = await getUserByBearer(token);
          setUser(userData);
        } else {
          showMessage('Token de autenticação não encontrado');
        }
      } catch (error) {
        showMessage('Erro ao carregar informações do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    showMessage('Você saiu com sucesso');
    router.push({ pathname: '/' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Não foi possível carregar as informações do usuário.</Text>
      </View>
    );
  }

  return (
    <ImageBackground
    source={require('../../assets/images/background_dot.png')}
    resizeMode="repeat"
    style={styles.background}
  >
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Avatar.Image
          size={100}
          source={{
            uri: 'https://via.placeholder.com/100', 
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <Card style={styles.card}>
          <Card.Title title="Informações Pessoais" titleStyle={{ color: primaryColor }} />
          <Card.Content>
            <Text>Data de Nascimento: {user.birth_date}</Text>
            <Text>Telefone: {user.phone}</Text>
          </Card.Content>
        </Card>

        {user.address ? (
          <Card style={styles.card}>
            <Card.Title title="Endereço" titleStyle={{ color: primaryColor }} />
            <Card.Content>
              <Text>Rua: {user.address.street}, {user.address.number}</Text>
              <Text>Bairro: {user.address.neighborhood}</Text>
              <Text>Complemento: {user.address.complement}</Text>
              <Text>Cidade: {user.address.city}</Text>
              <Text>Estado: {user.address.state}</Text>
              <Text>País: {user.address.country}</Text>
              <Text>CEP: {user.address.zip_code}</Text>
            </Card.Content>
          </Card>
        ) : (
          <Text style={styles.noAddressText}>Endereço não disponível</Text>
        )}

        <Divider style={styles.divider} />
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: primaryColor }]}
      >
        Sair do sistema
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  avatar: {
    marginTop: 16,
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  noAddressText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },

  divider: {
    marginVertical: 16,
    width: '100%',
  },
  logoutButton: {
    marginBottom: 30,
    margin:24
  },
});
