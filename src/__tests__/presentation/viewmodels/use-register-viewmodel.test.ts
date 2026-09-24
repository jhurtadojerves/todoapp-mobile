import { act, renderHook } from '@testing-library/react-native';

import { RegisterCredentials } from '@/domain/models/register';
import { useRegisterViewModel } from '@/presentation/viewmodels/use-register-viewmodel';

const mockValidatePassword = jest.fn();
const mockRegister = jest.fn();

jest.mock('@/shared/di/dependencies', () => ({
  dependencies: {
    validatePasswordUseCase: { execute: (...args: unknown[]) => mockValidatePassword(...args) },
  },
}));

jest.mock('@/presentation/contexts/auth-context', () => ({
  useAuth: () => ({ register: mockRegister, isAuthenticating: false }),
}));

const validCredentials: RegisterCredentials = {
  username: 'ana.perez',
  email: 'ana@example.com',
  password: 'Str0ng!pass',
  password2: 'Str0ng!pass',
  firstName: 'Ana',
  lastName: 'Pérez',
};

type Hook = Awaited<ReturnType<typeof renderHook<ReturnType<typeof useRegisterViewModel>, unknown>>>;

async function fill(result: Hook['result'], values: Partial<RegisterCredentials>) {
  await act(async () => {
    for (const [field, value] of Object.entries(values)) {
      result.current.setField(field as keyof RegisterCredentials, value as string);
    }
  });
}

/** Lets the 500 ms password-validation debounce fire and its promise settle. */
async function flushPasswordValidation() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
}

describe('useRegisterViewModel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockValidatePassword.mockResolvedValue({ isValid: true, errors: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('field validation', () => {
    it('should reject usernames with forbidden characters', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { username: 'ana pérez!' });

      expect(result.current.usernameError).toMatch(/Solo letras/);
    });

    it('should accept usernames with the allowed symbols @ . + - _', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { username: 'ana.p+test-1_@x' });

      expect(result.current.usernameError).toBeNull();
    });

    it('should reject usernames longer than 150 characters', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { username: 'a'.repeat(151) });

      expect(result.current.usernameError).not.toBeNull();
    });

    it('should flag an invalid email and clear it once fixed', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { email: 'not-an-email' });
      expect(result.current.emailError).toBe('El correo electrónico no es válido');

      await fill(result, { email: 'ana@example.com' });
      expect(result.current.emailError).toBeNull();
    });

    it('should flag mismatching passwords regardless of which field is typed last', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { password2: 'abc', password: 'abcd' });
      expect(result.current.passwordMatchError).toBe('Las contraseñas no coinciden');

      await fill(result, { password2: 'abcd' });
      expect(result.current.passwordMatchError).toBeNull();
    });
  });

  describe('password strength validation (debounced)', () => {
    it('should wait 500 ms after the last keystroke before calling the API', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { password: 'S' });
      await fill(result, { password: 'St' });
      await fill(result, { password: 'Str0ng!pass' });
      expect(result.current.isValidatingPassword).toBe(true);
      expect(mockValidatePassword).not.toHaveBeenCalled();

      await flushPasswordValidation();

      expect(mockValidatePassword).toHaveBeenCalledTimes(1);
      expect(mockValidatePassword).toHaveBeenCalledWith('Str0ng!pass');
      expect(result.current.isValidatingPassword).toBe(false);
    });

    it('should list the server-side reasons when the password is weak', async () => {
      mockValidatePassword.mockResolvedValue({
        isValid: false,
        errors: ['This password is too short.', 'This password is too common.'],
      });
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { password: '1234' });
      await flushPasswordValidation();

      expect(result.current.passwordError).toBe('La contraseña no cumple los requisitos');
      expect(result.current.passwordValidationErrors).toEqual([
        'This password is too short.',
        'This password is too common.',
      ]);
    });

    it('should report a generic error when the validation request itself fails', async () => {
      mockValidatePassword.mockRejectedValue(new Error('Network'));
      const { result } = await renderHook(() => useRegisterViewModel());

      await fill(result, { password: 'Str0ng!pass' });
      await flushPasswordValidation();

      expect(result.current.passwordError).toBe('Error al validar la contraseña');
    });
  });

  describe('submit', () => {
    it('should be disabled until every field is filled and valid', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());
      expect(result.current.canSubmit).toBeFalsy();

      await fill(result, validCredentials);
      expect(result.current.canSubmit).toBeFalsy(); // still validating the password

      await flushPasswordValidation();
      expect(result.current.canSubmit).toBeTruthy();
    });

    it('should require all fields', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());
      await fill(result, { username: 'ana' });

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrow('Todos los campos son obligatorios');
      });
      expect(result.current.error).toBe('Todos los campos son obligatorios');
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should block submission while a field has a validation error', async () => {
      const { result } = await renderHook(() => useRegisterViewModel());
      await fill(result, { ...validCredentials, password2: 'different' });
      await flushPasswordValidation();

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrow('Las contraseñas no coinciden');
      });
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should register with the entered credentials', async () => {
      mockRegister.mockResolvedValue(undefined);
      const { result } = await renderHook(() => useRegisterViewModel());
      await fill(result, validCredentials);
      await flushPasswordValidation();

      await act(() => result.current.submit());

      expect(mockRegister).toHaveBeenCalledWith(validCredentials);
    });

    it('should expose the API error when registration fails', async () => {
      mockRegister.mockRejectedValue(new Error('A user with that username already exists.'));
      const { result } = await renderHook(() => useRegisterViewModel());
      await fill(result, validCredentials);
      await flushPasswordValidation();

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrow();
      });
      expect(result.current.error).toBe('A user with that username already exists.');
    });
  });
});
