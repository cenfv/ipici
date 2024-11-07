export interface Auth {
  email: string
  password: string
}

export interface AuthResponse {
  data: {
    refresh: string;
    access: string;
  }
}

export interface Address {
  street: string;
  number: number;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  country: number; 
  zip_code: number;
}

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string; 
  phone: string;
  address: Address;
}

export interface ResetPassword {
  email: string;
}
