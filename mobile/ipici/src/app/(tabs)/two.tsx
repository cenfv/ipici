import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import axios from 'axios';
import { LightingDevice, Zone, Address, LocationType } from '../types/types';

const MapScreen: React.FC = () => {
  const [devices, setDevices] = useState<LightingDevice[]>([]);
  const fetchDevices = async () => {
    try {
      const response = await axios.get<LightingDevice[]>('http://192.168.1.4:8000/api/devices/', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1OTk3MDUwLCJpYXQiOjE3MzA4MTMwNTAsImp0aSI6Ijk4MTBjMzcxY2FiYjQ5N2U5NzVhMWMxOGE3NTBiZGRjIiwidXNlcl9pZCI6MX0.epoHJRipUrxFl8cCJjpaaJoReJhdxlMJQeWgbT7Ormk',
        },
      });
      if (Array.isArray(response.data)) {
        setDevices(response.data);
      } else {
        console.warn("Resposta inesperada da API:", response.data);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Erro Axios:", {
          message: error.message,
          response: error.response,
          request: error.request,
          config: error.config,
        });
      } else {
        console.error("Erro desconhecido:", error);
      }
    }
  };
  const parseLocation = (locationStr: string): LocationType => {
    const [longitude, latitude] = locationStr
      .replace("SRID=4326;POINT (", "")
      .replace(")", "")
      .split(" ")
      .map(coord => parseFloat(coord));
        
    return { latitude, longitude };
  };

  const parsePolygon = (polygonStr: string): LocationType[] => {
    const coordinates = polygonStr
      .replace("SRID=4326;POLYGON ((", "")
      .replace("))", "")
      .split(", ")
      .map(point => {
        const [longitude, latitude] = point.split(" ").map(coord => parseFloat(coord));
        return { latitude, longitude };
      });
    return coordinates;
  };

  useEffect(() => {
    console.log("Chamando fetchDevices");
    fetchDevices();
  }, []);
  

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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

          return (
            <React.Fragment key={device.id}>
              <Marker
                coordinate={coordinates}
                title={device.structural_name}
                description={`Tipo: ${device.type} - Status: ${device.operational_status}`}
                image={device.device_image ? { uri: `http://192.168.1.4${device.device_image}` } : undefined}
              />
              
              <Polygon
                coordinates={zoneCoordinates}
                strokeColor={device.zone.boundary_color}
                fillColor={`${device.zone.boundary_color}80`} 
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapScreen;
