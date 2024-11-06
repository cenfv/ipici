import axios from 'axios'
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || Constants.manifest?.extra?.API_URL;


export const api = axios.create({
  baseURL: API_URL,
})
