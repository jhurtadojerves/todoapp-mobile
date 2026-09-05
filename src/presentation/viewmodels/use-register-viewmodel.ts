import { RegisterCredentials } from '@/domain/models/register';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email();
const usernamePattern = /^[\w.@+-]+$/;

export function useRegisterViewModel() {
  const { register, isAuthenticating } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<string[]>([]);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);

  // Validate username format
  const validateUsername = useCallback((username: string) => {
    if (!username) {
      setUsernameError(null);
      return;
    }

    if (username.length > 150 || !usernamePattern.test(username)) {
      setUsernameError('Solo letras, números y @/./+/-/_ (máximo 150 caracteres)');
    } else {
      setUsernameError(null);
    }
  }, []);

  // Validate email format
  const validateEmail = useCallback((email: string) => {
    if (!email) {
      setEmailError(null);
      return;
    }

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError('El correo electrónico no es válido');
    } else {
      setEmailError(null);
    }
  }, []);

  // Validate that passwords match
  const validatePasswordMatch = useCallback(
    (password: string, password2: string) => {
      if (!password2) {
        setPasswordMatchError(null);
        return;
      }

      if (password !== password2) {
        setPasswordMatchError('Las contraseñas no coinciden');
      } else {
        setPasswordMatchError(null);
      }
    },
    []
  );

  // debounced password validation
  useEffect(() => {
    if (!credentials.password) {
      setPasswordValidationErrors([]);
      setPasswordError(null);
      return;
    }

    setIsValidatingPassword(true);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await dependencies.validatePasswordUseCase.execute(credentials.password);
        if (!result.is_valid) {
          setPasswordValidationErrors(result.errors);
          setPasswordError('La contraseña no cumple los requisitos');
        } else {
          setPasswordValidationErrors([]);
          setPasswordError(null);
        }
      } catch {
        setPasswordError('Error al validar la contraseña');
      } finally {
        setIsValidatingPassword(false);
      }
    }, 500); // Debounce of 500ms

    return () => {
      clearTimeout(timeoutId);
      setIsValidatingPassword(false);
    };
  }, [credentials.password]);

  const setField = (field: keyof RegisterCredentials, value: string) => {
    setCredentials((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'username') {
        validateUsername(value);
      }

      if (field === 'email') {
        validateEmail(value);
      }

      if (field === 'password' || field === 'password2') {
        validatePasswordMatch(updated.password, updated.password2);
      }

      return updated;
    });
  };

  const submit = async () => {
    setError(null);

    if (
      !credentials.username ||
      !credentials.email ||
      !credentials.password ||
      !credentials.first_name ||
      !credentials.last_name
    ) {
      setError('Todos los campos son obligatorios');
      throw new Error('Todos los campos son obligatorios');
    }

    if (usernameError) {
      setError(usernameError);
      throw new Error(usernameError);
    }

    if (emailError) {
      setError(emailError);
      throw new Error(emailError);
    }

    if (passwordError) {
      setError(passwordError);
      throw new Error(passwordError);
    }

    if (passwordMatchError) {
      setError(passwordMatchError);
      throw new Error(passwordMatchError);
    }

    try {
      await register(credentials);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo completar el registro.';
      setError(message);
      throw err;
    }
  };

  const canSubmit =
    credentials.username &&
    credentials.email &&
    credentials.password &&
    credentials.password2 &&
    credentials.first_name &&
    credentials.last_name &&
    !usernameError &&
    !emailError &&
    !passwordError &&
    !passwordMatchError &&
    !isValidatingPassword;

  return {
    credentials,
    setField,
    submit,
    error,
    usernameError,
    emailError,
    passwordError,
    passwordMatchError,
    passwordValidationErrors,
    isValidatingPassword,
    isAuthenticating,
    canSubmit,
  };
}
