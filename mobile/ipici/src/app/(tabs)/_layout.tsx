import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return <FontAwesome style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const primaryColor = '#1B68AC';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#aaa',
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="MapDevices"
        options={{
          title: 'Dispositivos',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="MapServiceOrder"
        options={{
          title: 'Ordens de Serviço',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="wrench" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="QR"
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="qrcode" color="#fff" size={28} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.qrButton}>
              <TabBarIcon name="qrcode" color="#fff" size={28} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="Reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="file-text" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="User"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="user" color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 5,
    elevation: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  qrButton: {
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1B68AC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
