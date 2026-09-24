/**
 * Integration tests: auth screens rendered with the real AuthProvider, DI
 * container, http-client and storage wrapper. Only the network (axios
 * adapter), the device keychain (expo-secure-store) and navigation are faked.
 */
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import BoardsTab from '../../../../app/(tabs)/boards';
import { LoginScreen } from '@/presentation/screens/login-screen';
import { RegisterScreen } from '@/presentation/screens/register-screen';
import { apiClient } from '@/shared/api/http-client';
import { mockRouter, resetMockRouter } from '@/test-utils/expo-router-mock';
import { buildBoard, makeJwt, paginated } from '@/test-utils/fixtures';
import { renderWithProviders } from '@/test-utils/render';
import { __getSecureStoreSnapshot, __resetSecureStore } from '@/test-utils/secure-store-mock';

jest.mock('expo-secure-store', () => require('@/test-utils/secure-store-mock'));
jest.mock('expo-router', () => require('@/test-utils/expo-router-mock'));

const apiMock = new MockAdapter(apiClient);
const tokens = { access: makeJwt({ user_id: 7 }), refresh: 'refresh-token' };

describe('Auth screens (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    __resetSecureStore();
    resetMockRouter();
  });

  describe('LoginScreen', () => {
    it('should log in, store the tokens securely and go to /users', async () => {
      const user = userEvent.setup();
      apiMock
        .onPost('/api/v1/auth/token/', { email: 'ana@example.com', password: 'secret' })
        .reply(200, tokens);
      await renderWithProviders(<LoginScreen />);

      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Acceder' }));

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/users'));
      expect(__getSecureStoreSnapshot()).toEqual({
        accessToken: tokens.access,
        refreshToken: 'refresh-token',
      });
    });

    it('should not send a Bearer token to the login endpoint', async () => {
      const user = userEvent.setup();
      __resetSecureStore({ accessToken: 'stale-token' });
      apiMock.onPost('/api/v1/auth/token/').reply(200, tokens);
      await renderWithProviders(<LoginScreen />);

      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Acceder' }));

      await waitFor(() => expect(apiMock.history.post).toHaveLength(1));
      expect(apiMock.history.post[0].headers?.Authorization).toBeUndefined();
    });

    it('should show the backend message on wrong credentials and stay on the screen', async () => {
      const user = userEvent.setup();
      apiMock
        .onPost('/api/v1/auth/token/')
        .reply(401, { detail: 'No active account found with the given credentials' });
      await renderWithProviders(<LoginScreen />);

      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'wrong');
      await user.press(screen.getByRole('button', { name: 'Acceder' }));

      expect(
        await screen.findByText('No active account found with the given credentials')
      ).toBeOnTheScreen();
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(__getSecureStoreSnapshot()).toEqual({});
    });

    it('should show a connectivity message when the server is unreachable', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/auth/token/').networkError();
      await renderWithProviders(<LoginScreen />);

      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Acceder' }));

      expect(await screen.findByText(/No hay conexión con el servidor/)).toBeOnTheScreen();
    });

    it('should link to the register screen', async () => {
      const user = userEvent.setup();
      await renderWithProviders(<LoginScreen />);

      await user.press(screen.getByText('Regístrate'));

      expect(mockRouter.push).toHaveBeenCalledWith('/register');
    });
  });

  describe('Boards tab gate', () => {
    it('should ask for login first and reveal the boards once signed in', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/auth/token/').reply(200, tokens);
      apiMock
        .onGet('/api/v1/boards/?page=1')
        .reply(200, paginated([buildBoard({ name: 'Roadmap' })]));
      await renderWithProviders(<BoardsTab />);

      expect(screen.getByRole('button', { name: 'Acceder' })).toBeOnTheScreen();
      expect(apiMock.history.get).toHaveLength(0);

      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Acceder' }));

      expect(await screen.findByText('Roadmap')).toBeOnTheScreen();
      expect(apiMock.history.get[0].headers?.Authorization).toBe(`Bearer ${tokens.access}`);
    });

    it('should restore a stored session without asking for login again', async () => {
      __resetSecureStore({ accessToken: tokens.access, refreshToken: tokens.refresh });
      apiMock.onGet('/api/v1/boards/?page=1').reply(200, paginated([buildBoard({ name: 'Roadmap' })]));

      await renderWithProviders(<BoardsTab />);

      expect(await screen.findByText('Roadmap')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Acceder' })).not.toBeOnTheScreen();
    });
  });

  describe('RegisterScreen', () => {
    const fillForm = async (user: ReturnType<typeof userEvent.setup>, password2 = 'Str0ng!pass') => {
      await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
      await user.type(screen.getByLabelText('Nombre'), 'Ana');
      await user.type(screen.getByLabelText('Apellido'), 'Pérez');
      await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'Str0ng!pass');
      await user.type(screen.getByLabelText('Confirmar contraseña'), password2);
    };

    it('should register, sign in automatically and go to /users', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/auth/password/validate/').reply(200, {});
      apiMock.onPost('/api/v1/users/register/').reply(201, {
        id: 7,
        username: 'ana',
        email: 'ana@example.com',
        first_name: 'Ana',
        last_name: 'Pérez',
      });
      apiMock.onPost('/api/v1/auth/token/').reply(200, tokens);
      await renderWithProviders(<RegisterScreen />);

      await fillForm(user);
      const submit = screen.getByRole('button', { name: 'Registrarse' });
      await waitFor(() => expect(submit).toBeEnabled());
      await user.press(submit);

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/users'));
      const registerRequest = apiMock.history.post.find((r) => r.url === '/api/v1/users/register/');
      expect(JSON.parse(registerRequest!.data)).toEqual({
        username: 'ana',
        email: 'ana@example.com',
        password: 'Str0ng!pass',
        first_name: 'Ana',
        last_name: 'Pérez',
      });
      expect(__getSecureStoreSnapshot().accessToken).toBe(tokens.access);
    });

    it('should show the password rules returned by the backend and keep submit disabled', async () => {
      const user = userEvent.setup();
      apiMock
        .onPost('/api/v1/auth/password/validate/')
        .reply(400, { password: ['This password is too common.'] });
      await renderWithProviders(<RegisterScreen />);

      await fillForm(user);

      expect(await screen.findByText('• This password is too common.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Registrarse' })).toBeDisabled();
    });

    it('should warn when the passwords do not match', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/auth/password/validate/').reply(200, {});
      await renderWithProviders(<RegisterScreen />);

      await fillForm(user, 'Different!1');

      expect(screen.getByText('Las contraseñas no coinciden')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Registrarse' })).toBeDisabled();
    });
  });
});
