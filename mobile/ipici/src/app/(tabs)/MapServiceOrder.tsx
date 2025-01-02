import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView, Switch, TouchableWithoutFeedback, Platform, UIManager, LayoutAnimation } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import { api } from '../../service/utils/api';


type ServiceOrderType = {
  id: number;
  title: string;
  description: string;
  creation_date: string;
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  responsible: {
    id: number;
    first_name: string;
    last_name: string;
  };
  device: number; 
  device_details?: {
    id: number;
    number: string;
    address?: {
      street?: string;
      number?: string;
      neighborhood?: string;
      complement?: string;
      city?: string;
      state?: string;
      zip_code?: string;
    };
    zone?: {
      name?: string;
      description?: string;
      location?: string;
      zone_code?: string;
      boundary_color?: string;
    };
    structural_name?: string;
    type?: string;
    height?: number;
    material?: string;
    installation_date?: string;
    location?: string;
    device_image?: string;
    operational_status?: string;
    qr_code?: string;
    energy_source?: string;
    additional_features?: string;
    nearby_installations?: string;
    last_maintenance_date?: string | null;
  };
  location: string; 
  responsible_details?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    birth_date?: string;
    phone?: string;
    address?: string | null;
  };
};

const mapTypes = [
  { label: 'Padrão', value: 'standard' },
  { label: 'Satélite', value: 'satellite' },
  { label: 'Híbrido', value: 'hybrid' },
  { label: 'Terreno', value: 'terrain' },
];

const priorityOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Alta', value: 'ALTA' },
  { label: 'Média', value: 'MEDIA' },
  { label: 'Baixa', value: 'BAIXA' },
];

const statusOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Aberta', value: 'ABERTA' },
  { label: 'Em Andamento', value: 'EM_ANDAMENTO' },
  { label: 'Concluída', value: 'CONCLUIDA' },
];

const getStatusMarkerUrl = (status: string): string => {
  switch (status) {
    case 'ABERTA':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
    case 'EM_ANDAMENTO':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
    case 'CONCLUIDA':
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
    default:
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
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

const MapServiceOrders: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderType[]>([]);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrderType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');
  const [mapTypeMenuVisible, setMapTypeMenuVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showServiceOrders, setShowServiceOrders] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackHandlerEnabled, setIsBackHandlerEnabled] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const fetchServiceOrders = useCallback(async () => {
    const token = await AsyncStorage.getItem('access_token');
    setIsLoading(true);
  
    try {
      const response = await api.get<ServiceOrderType[]>('/service-orders/', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (Array.isArray(response.data)) {
        setServiceOrders(response.data);
      } else {
        console.warn("Resposta inesperada da API:", response.data);
        setServiceOrders([]);
      }
    } catch (error: any) {
      console.error("Erro ao buscar ordens de serviço:", error);
      setServiceOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const parseLocation = (locationStr: string) => {
    const [longitude, latitude] = locationStr.replace("SRID=4326;POINT (", "").replace(")", "").split(" ").map(coord => parseFloat(coord));
    return { latitude, longitude };
  };

  const closeServiceOrder = async (serviceOrderId: number) => {
    const token = await AsyncStorage.getItem('access_token');
  
    try {
      await api.patch(`/service-orders/${serviceOrderId}/close/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServiceOrders(); 
      closeModal(); 
    } catch (error) {
      console.error("Erro ao fechar ordem de serviço:", error);
      alert("Não foi possível fechar a ordem de serviço.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedServiceOrder(null); 
      setModalVisible(false); 
    }, [])
  );

  useEffect(() => {
    fetchServiceOrders();
  }, [fetchServiceOrders]);

  const openModal = (serviceOrder: ServiceOrderType) => {
    setSelectedServiceOrder(serviceOrder);
    setModalVisible(true);
    setIsBackHandlerEnabled(true); 
  };

  const closeModal = () => {
    setSelectedServiceOrder(null);
    setModalVisible(false);
    setIsBackHandlerEnabled(false);
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
        
        setIsSearchVisible(false);
        setSearchQuery('');
      } else {
        alert('Local não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      alert('Erro ao buscar localização.');
    }
  };

  const filteredServiceOrders = serviceOrders.filter(order => {
    const priorityMatch = selectedPriority === 'ALL' || order.priority === selectedPriority;
    const statusMatch = selectedStatus === 'ALL' || order.status === selectedStatus;
    
    return priorityMatch && statusMatch && showServiceOrders;
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
        {filteredServiceOrders.map((order) => {
          const coordinates = parseLocation(order.location);
          const markerIconUrl = getStatusMarkerUrl(order.status);

          return (
            <Marker
              key={order.id}
              coordinate={coordinates}
              title={order.title}
              description={`Status: ${order.status} - Prioridade:  ${order.priority}`}
              image={{ uri: markerIconUrl }}
              onPress={() => openModal(order)}
            />
          );
        })}
      </MapView>

      <SafeAreaView style={styles.searchContainer}>
        {!isSearchVisible ? (
          <TouchableOpacity onPress={() => setIsSearchVisible(true)} style={styles.searchIcon}>
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
        <TouchableOpacity style={styles.filterButton} onPress={fetchServiceOrders}>
                  <MaterialIcons name="refresh" size={28} color="#333" />
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
                  onPress={() => {
                    setMapType(item.value as 'standard' | 'satellite' | 'hybrid' | 'terrain');
                    setMapTypeMenuVisible(false);
                  }}
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
            
            <Text style={styles.filterLabel}>Prioridade</Text>
            <Picker
              selectedValue={selectedPriority}
              onValueChange={(itemValue) => setSelectedPriority(itemValue)}
            >
              {priorityOptions.map(option => (
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
              <Text style={styles.filterLabel}>Mostrar Ordens de Serviço</Text>
              <Switch 
                value={showServiceOrders} 
                onValueChange={setShowServiceOrders} 
                thumbColor="#1B68AC" 
                trackColor={{ true: '#1B68AC' }}
              />
            </View>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setFilterModalVisible(false);
                fetchServiceOrders();
              }}
            >
              <FontAwesome name="times" size={16} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedServiceOrder && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Detalhes da Ordem de Serviço</Text>

              <View style={styles.infoRow}>
                <FontAwesome name="info-circle" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>Título: {selectedServiceOrder.title}</Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="file-text" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>Descrição: {selectedServiceOrder.description}</Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="calendar" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>
                  Data de Criação: {new Date(selectedServiceOrder.creation_date).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="exclamation-triangle" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>
                  Prioridade: {selectedServiceOrder.priority === 'ALTA' ? 'Alta' : 
                  selectedServiceOrder.priority === 'MEDIA' ? 'Média' : 'Baixa'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="check-circle" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>
                  Status: {selectedServiceOrder.status === 'ABERTA' ? 'Aberta' : 
                  selectedServiceOrder.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Concluída'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="user" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>
                  Responsável: {`${selectedServiceOrder.responsible_details?.first_name || ''} ${selectedServiceOrder.responsible_details?.last_name || ''}`}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="map-marker" size={20} color="#1B68AC" />
                <Text style={styles.infoText}>
                  Dispositivo: {selectedServiceOrder.device_details?.number || 'Não disponível'}
                </Text>
                
              </View>

              <View style={styles.infoRow}>
                <FontAwesome name="map-marker" size={20} color="#1B68AC" />
                
                <Text style={styles.infoText}>
                  Endereço: {selectedServiceOrder.device_details?.address?.street || 'Sem informações'}, 
                  {selectedServiceOrder.device_details?.address?.number || 'S/N'}
                </Text>
              </View>

              {selectedServiceOrder.status !== 'CONCLUIDA' && (
                <TouchableOpacity
                  style={styles.closeServiceOrderButton}
                  onPress={() => closeServiceOrder(selectedServiceOrder.id)}
                >
                  <FontAwesome name="check" size={16} color="#FFF" style={styles.buttonIcon} />
                  <Text style={styles.closeServiceOrderButtonText}>Fechar Ordem de Serviço</Text>
                </TouchableOpacity>
              )}

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
  closeServiceOrderButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  closeServiceOrderButtonText: {
    color: 'white',
    textAlign: 'center',
    marginLeft: 10,
  },
});

export default MapServiceOrders;
