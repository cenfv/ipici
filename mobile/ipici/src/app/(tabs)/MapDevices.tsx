import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView, Switch, TouchableWithoutFeedback, Platform, UIManager, LayoutAnimation } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import axios from 'axios';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LightingDevice, LocationType } from '../types/types';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';


const mapTypes = [
  { label: 'Padrão', value: 'standard' },
  { label: 'Satélite', value: 'satellite' },
  { label: 'Híbrido', value: 'hybrid' },
  { label: 'Terreno', value: 'terrain' },
];

const typeOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Poste de Iluminação', value: 'POSTE' },
  { label: 'Braço de Iluminação', value: 'BRAÇO' },
  { label: 'Luminária LED', value: 'LUMINARIA_LED' },
  { label: 'Luminária Halógena', value: 'LUMINARIA_HALOGENA' },
  { label: 'Luminária Fluorescente', value: 'LUMINARIA_FLUORESCENTE' },
  { label: 'Luminária Vapor de Sódio', value: 'LUMINARIA_VAPOR_SODIO' },
  { label: 'Luminária Vapor Metálico', value: 'LUMINARIA_VAPOR_METALICO' },
  { label: 'Luminária de Indução', value: 'LUMINARIA_INDUCAO' },
  { label: 'Luminária Solar', value: 'LUMINARIA_SOLAR' },
  { label: 'Projetor de Iluminação', value: 'PROJETOR' },
  { label: 'Iluminação de Emergência', value: 'ILUMINACAO_DE_EMERGENCIA' },
  { label: 'Iluminação Decorativa', value: 'ILUMINACAO_DECORATIVA' },
  { label: 'Iluminação Vial', value: 'ILUMINACAO_VIAL' },
  { label: 'Iluminação para Pedestres', value: 'ILUMINACAO_PEDESTRE' },
  { label: 'Iluminação de Ciclovia', value: 'ILUMINACAO_CICLOVIA' },
  { label: 'Refletor de Alta Intensidade', value: 'REFLETOR' },
  { label: 'Outro', value: 'OUTRO' },
];

const statusOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Operacional', value: 'OPERACIONAL' },
  { label: 'Em Manutenção', value: 'MANUTENCAO' },
  { label: 'Falha Detectada', value: 'FALHA' },
  { label: 'Desativado', value: 'DESATIVADO' },
  { label: 'Indisponível Temporariamente', value: 'INDISPONIVEL' },
  { label: 'Pendente de Ativação', value: 'PENDENTE_ATIVACAO' },
];

const getStatusMarkerUrl = (status: string): string => {
  switch (status) {
    case 'OPERACIONAL':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    case 'MANUTENCAO':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
    case 'FALHA':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'; 
    case 'DESATIVADO':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
    case 'INDISPONIVEL':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
    case 'PENDENTE_ATIVACAO':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
    default:
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
  }
};

const mapStyle = [
  { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative", "elementType": "labels", "stylers": [{ "visibility": "off" }] }
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MapDevices: React.FC = () => {
  const [devices, setDevices] = useState<LightingDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<LightingDevice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');
  const [mapTypeMenuVisible, setMapTypeMenuVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showDevices, setShowDevices] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackHandlerEnabled, setIsBackHandlerEnabled] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const openReportProblemScreen = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!selectedDevice) return;
    router.push({
      pathname: '/ReportProblemScreen',
      params: { device: selectedDevice.id, token },
    });
  };

  const fetchDevices = useCallback(async () => {
    const token = await AsyncStorage.getItem('access_token');
    setIsLoading(true);
    try {
      const response = await axios.get<LightingDevice[]>('http://192.168.1.5:8000/api/devices/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setDevices(response.data);
      } else {
        console.warn("Resposta inesperada da API:", response.data);
        setDevices([]);
      }
    } catch (error: any) {
      console.error("Erro ao buscar dispositivos:", error);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSelectedDevice(null); 
      setModalVisible(false); 
    }, [])
  );

  useEffect(() => {
    const handleBackPress = () => {
      if (isBackHandlerEnabled) {
        closeModal();
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isBackHandlerEnabled]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const toggleSearchBar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchVisible(!isSearchVisible);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&addressdetails=1`
      );
      const data = await response.json();
  
      if (data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);
  
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        toggleSearchBar();
        setSearchQuery('');
        
      } else {
        alert('Local não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      alert('Erro ao buscar localização.');
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

  const openModal = (device: LightingDevice) => {
    setSelectedDevice(device);
    setModalVisible(true);
    setIsBackHandlerEnabled(true); 
  };

  const closeModal = () => {
    setSelectedDevice(null);
    setModalVisible(false);
    setIsBackHandlerEnabled(false);
  };

  const changeMapType = (type: 'standard' | 'satellite' | 'hybrid' | 'terrain') => {
    setMapType(type);
    setMapTypeMenuVisible(false);
  };

  const resetFilters = () => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setShowDevices(true);
    setShowZones(true);
  };

  const filteredDevices = devices.filter(device => {
    const typeMatch = selectedType === 'ALL' || device.type === selectedType;
    const statusMatch = selectedStatus === 'ALL' || device.operational_status === selectedStatus;
    
    return typeMatch && statusMatch && showDevices;
  });

  return (
    <TouchableWithoutFeedback onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsSearchVisible(false);
    }}>
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: -23.185391,
          longitude: -50.648520,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {filteredDevices.map((device) => {
          const coordinates = parseLocation(device.location);
          const zoneCoordinates = parsePolygon(device.zone.location);
          const zoneName = device.zone.name;
          const markerIconUrl = getStatusMarkerUrl(device.operational_status);

          return (
            <React.Fragment key={device.id}>
              <Marker
                coordinate={coordinates}
                title={device.number}
                description={`Tipo: ${device.type} - Status: ${device.operational_status}`}
                image={{ uri: markerIconUrl }}
                onPress={() => openModal(device)}
              />
              {showZones && (
                <Polygon
                  coordinates={zoneCoordinates}
                  strokeColor={device.zone.boundary_color}
                  fillColor={`${device.zone.boundary_color}20`}
                  strokeWidth={2}
                />
              )}
              {showZones && (
                <Marker
                  coordinate={zoneCoordinates[0]}
                  title={zoneName}
                  pinColor="transparent"
                >
                  <View style={styles.zoneNameContainer}>
                    <Text style={styles.zoneNameText}>{zoneName}</Text>
                  </View>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapView>

      <SafeAreaView style={styles.searchContainer}>
        {!isSearchVisible ? (
          <TouchableOpacity onPress={toggleSearchBar} style={styles.searchIcon}>
            <MaterialIcons name="search" size={28} color="#333" />
          </TouchableOpacity>
        ) : (
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise um local..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <MaterialIcons name="arrow-forward" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity style={styles.mapTypeButton} onPress={() => setMapTypeMenuVisible(!mapTypeMenuVisible)}>
          <MaterialIcons name="layers" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <MaterialIcons name="filter-list" size={28} color="#333" />
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
                <TouchableOpacity 
                  style={styles.optionButton} 
                  onPress={() => changeMapType(item.value as 'standard' | 'satellite' | 'hybrid' | 'terrain')}
                >
                  <Text style={styles.optionButtonText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <Text style={styles.filterLabel}>Tipo de Dispositivo</Text>
            <Picker
              selectedValue={selectedType}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              {typeOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Status</Text>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            >
              {statusOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>

            <View style={styles.switchRow}>
              <Text style={styles.filterLabel}>Mostrar Dispositivos</Text>
              <Switch value={showDevices} onValueChange={setShowDevices} thumbColor="#1B68AC" trackColor={{ true: '#1B68AC' }}/>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.filterLabel}>Mostrar Zonas</Text>
              <Switch value={showZones} onValueChange={setShowZones} thumbColor="#1B68AC" trackColor={{ true: '#1B68AC' }} />
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Resetar Filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setFilterModalVisible(false);
                fetchDevices();
              }}
            >
              <FontAwesome name="times" size={16} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
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
              <TouchableOpacity style={styles.reportButton} onPress={openReportProblemScreen}>
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
    </TouchableWithoutFeedback>
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
    marginTop: 40,
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
  filterButton: {
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
  filterLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  reportButton: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  reportButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionButton: {
    padding: 12,
    backgroundColor: '#1B68AC',
    marginVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: { color: '#FFF', fontWeight: 'bold' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
  },
  resetButton: {
    backgroundColor: '#1B68AC',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchIcon: {
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
  searchButton: {
    marginLeft: 5,
    padding: 7,
    backgroundColor: '#1B68AC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  
});

export default MapDevices;
