export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface RegisteredUser {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface PasswordValidationResult {
  is_valid: boolean;
  errors: string[];
}
