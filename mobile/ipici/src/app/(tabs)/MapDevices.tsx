import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import axios from 'axios';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LightingDevice, LocationType } from '../types/types';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mapTypes: { label: string, value: 'standard' | 'satellite' | 'hybrid' | 'terrain' }[] = [
  { label: 'Padrão', value: 'standard' },
  { label: 'Satélite', value: 'satellite' },
  { label: 'Híbrido', value: 'hybrid' },
  { label: 'Terreno', value: 'terrain' },
];

const MapDevices: React.FC = () => {
  const [devices, setDevices] = useState<LightingDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<LightingDevice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');
  const [mapTypeMenuVisible, setMapTypeMenuVisible] = useState(false);

  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const openReportProblemScreen = async () => {
    const token = await AsyncStorage.getItem('access_token');

    if (!selectedDevice) return;
    router.push({
      pathname: '/ReportProblemScreen',
      params: {
        device: selectedDevice.id,
        token: token,
      },
    });
  }

  const fetchDevices = async () => {
    const token = await AsyncStorage.getItem('access_token');

    try {
      const response = await axios.get<LightingDevice[]>('http://192.168.1.4:8000/api/devices/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        setDevices(response.data);
      } else {
        console.warn("Resposta inesperada da API:", response.data);
      }
    } catch (error: any) {
      console.error("Erro ao buscar dispositivos:", error);
    }
  };

  const parseLocation = (locationStr: string): LocationType => {
    const [longitude, latitude] = locationStr.replace("SRID=4326;POINT (", "").replace(")", "").split(" ").map(coord => parseFloat(coord));
    return { latitude, longitude };
  };

  const parsePolygon = (polygonStr: string): LocationType[] => {
    return polygonStr.replace("SRID=4326;POLYGON ((", "").replace("))", "").split(", ").map(point => {
      const [longitude, latitude] = point.split(" ").map(coord => parseFloat(coord));
      return { latitude, longitude };
    });
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openModal = (device: LightingDevice) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedDevice(null);
    setModalVisible(false);
  };

  const changeMapType = (type: 'standard' | 'satellite' | 'hybrid' | 'terrain') => {
    setMapType(type);
    setMapTypeMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: -23.185391,
          longitude: -50.648520,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {devices.map((device) => {
          const coordinates = parseLocation(device.location);
          const zoneCoordinates = parsePolygon(device.zone.location);
          const zoneName = device.zone.name;
          return (
            <React.Fragment key={device.id}>
              <Marker
                coordinate={coordinates}
                title={device.number}
                description={`Tipo: ${device.type} - Status: ${device.operational_status}`}
                pinColor="#1B68AC"
                onPress={() => openModal(device)}
              />
              <Polygon
                coordinates={zoneCoordinates}
                strokeColor={device.zone.boundary_color}
                fillColor={`${device.zone.boundary_color}80`} 
                strokeWidth={2}
              />
              <Marker
                coordinate={zoneCoordinates[0]}
                title={zoneName}
                pinColor="transparent"
              >
                <View style={styles.zoneNameContainer}>
                  <Text style={styles.zoneNameText}>{zoneName}</Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity style={styles.mapTypeButton} onPress={() => setMapTypeMenuVisible(true)}>
          <MaterialIcons name="layers" size={28} color="#333" />
        </TouchableOpacity>
      </SafeAreaView>

      <Modal
        visible={mapTypeMenuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMapTypeMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione o Tipo de Mapa</Text>
            <FlatList
              data={mapTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionButton} onPress={() => changeMapType(item.value)}>
                  <Text style={styles.optionButtonText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {selectedDevice && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
	  <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Detalhes do Dispositivo</Text>

              <View style={styles.infoRow}>
                <FontAwesome name="lightbulb-o" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>Identificação: {selectedDevice.number}</Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="info-circle" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>Tipo: {selectedDevice.type}</Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="signal" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>Status: {selectedDevice.operational_status}</Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="map-marker" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>Endereço: {selectedDevice.address.street}, {selectedDevice.address.number}</Text>
              </View>

              <TouchableOpacity style={styles.reportButton} onPress={openReportProblemScreen} >
                <FontAwesome name="exclamation-triangle" size={16} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.reportButtonText}>Relatar Problema</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <FontAwesome name="times" size={16} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>	
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  safeAreaView: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  mapTypeButton: {
    marginTop: 10,
    marginRight: 4,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    padding: 12,
    backgroundColor: '#1B68AC',
    marginVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: { color: '#FFF', fontWeight: 'bold' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  reportButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#FF6347',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#1B68AC',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  zoneNameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 4,
    borderRadius: 4,
  },
  zoneNameText: {
    fontSize: 12,
    color: '#333',
  },
});

export default MapDevices;
