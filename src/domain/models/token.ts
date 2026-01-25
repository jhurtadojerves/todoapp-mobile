export interface UserCredentials {
  email: string;
  password: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}
