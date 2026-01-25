import Constants from 'expo-constants';

const BASE_URL = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL = BASE_URL ?? 'http://localhost:8080/';
