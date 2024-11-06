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


