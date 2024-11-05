export type LocationType = {
  latitude: number;
  longitude: number;
};

export type Zone = {
  name: string;
  description: string;
  location: string;
  boundary_color: string;
};

export type Address = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: number;
  zip_code: string;
};

export type LightingDevice = {
  id: number;
  address: Address;
  zone: Zone;
  number: string;
  structural_name: string;
  location: string;
  device_image: string | null;
  operational_status: string;
  type: string;
};
