/**
 * Integration tests: board and task screens → viewmodels → use cases →
 * repositories → datasources → http-client, with a signed-in session restored
 * from the (faked) keychain. Only the network, keychain and navigation are faked.
 */
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { BoardFormScreen } from '@/presentation/screens/board-form-screen';
import { BoardsScreen } from '@/presentation/screens/boards-screen';
import { TaskFormScreen } from '@/presentation/screens/task-form-screen';
import { TasksScreen } from '@/presentation/screens/tasks-screen';
import { apiClient } from '@/shared/api/http-client';
import { mockRouter, resetMockRouter } from '@/test-utils/expo-router-mock';
import {
  buildBoard,
  buildMembership,
  buildSprint,
  buildStatus,
  buildTask,
  makeJwt,
  paginated,
} from '@/test-utils/fixtures';
import { renderWithProviders } from '@/test-utils/render';
import { __getSecureStoreSnapshot, __resetSecureStore } from '@/test-utils/secure-store-mock';

jest.mock('expo-secure-store', () => require('@/test-utils/secure-store-mock'));
jest.mock('expo-router', () => require('@/test-utils/expo-router-mock'));

const apiMock = new MockAdapter(apiClient);
const accessToken = makeJwt({ user_id: 7 });

function requestBody(method: 'post' | 'patch', url: string) {
  const request = apiMock.history[method].find((r) => r.url === url);
  return request ? JSON.parse(request.data) : undefined;
}

describe('Boards and tasks screens (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    resetMockRouter();
    __resetSecureStore({ accessToken, refreshToken: 'refresh-token' });
  });

  describe('BoardsScreen', () => {
    it('should list the boards with an authenticated request', async () => {
      apiMock.onGet('/api/v1/boards/?page=1').reply(200, paginated([
        buildBoard({ id: 1, name: 'Roadmap', description: 'Q3 goals' }),
        buildBoard({ id: 2, name: 'Bugs', description: '' }),
      ]));

      await renderWithProviders(<BoardsScreen />);

      expect(await screen.findByText('Roadmap')).toBeOnTheScreen();
      expect(screen.getByText('Q3 goals')).toBeOnTheScreen();
      expect(screen.getByText('Sin descripción')).toBeOnTheScreen();
      expect(apiMock.history.get[0].headers?.Authorization).toBe(`Bearer ${accessToken}`);
    });

    it('should show the empty state when there are no boards', async () => {
      apiMock.onGet('/api/v1/boards/?page=1').reply(200, paginated([]));

      await renderWithProviders(<BoardsScreen />);

      expect(await screen.findByText('No hay tableros todavía')).toBeOnTheScreen();
    });

    it('should load the next page when pressing "Cargar más"', async () => {
      const user = userEvent.setup();
      apiMock
        .onGet('/api/v1/boards/?page=1')
        .reply(200, paginated([buildBoard({ id: 1, name: 'Page one' })], 'http://api/boards/?page=2'));
      apiMock.onGet('/api/v1/boards/?page=2').reply(200, paginated([buildBoard({ id: 2, name: 'Page two' })]));
      await renderWithProviders(<BoardsScreen />);

      await user.press(await screen.findByRole('button', { name: 'Cargar más' }));

      expect(await screen.findByText('Page two')).toBeOnTheScreen();
      expect(screen.getByText('Page one')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeOnTheScreen();
    });

    it('should show the server error and recover with "Reintentar"', async () => {
      const user = userEvent.setup();
      apiMock.onGet('/api/v1/boards/?page=1').replyOnce(500);
      apiMock.onGet('/api/v1/boards/?page=1').replyOnce(200, paginated([buildBoard({ name: 'Roadmap' })]));
      await renderWithProviders(<BoardsScreen />);

      expect(await screen.findByText(/El servidor tuvo un problema/)).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: 'Reintentar' }));

      expect(await screen.findByText('Roadmap')).toBeOnTheScreen();
    });

    it('should treat a response that breaks the API contract as a server error', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      apiMock.onGet('/api/v1/boards/?page=1').reply(200, { results: [{ id: 'not-a-number' }] });

      await renderWithProviders(<BoardsScreen />);

      expect(await screen.findByText(/El servidor tuvo un problema/)).toBeOnTheScreen();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('failed schema validation'), expect.anything());
      warn.mockRestore();
    });

    it('should navigate to a board and to the new-board form', async () => {
      const user = userEvent.setup();
      apiMock.onGet('/api/v1/boards/?page=1').reply(200, paginated([buildBoard({ id: 3, name: 'Roadmap' })]));
      await renderWithProviders(<BoardsScreen />);

      await user.press(await screen.findByText('Roadmap'));
      await user.press(screen.getByRole('button', { name: 'Nuevo' }));

      expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/board/3');
      expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/board/new');
    });
  });

  describe('BoardFormScreen', () => {
    it('should keep "Crear tablero" disabled until a name is typed', async () => {
      const user = userEvent.setup();
      await renderWithProviders(<BoardFormScreen />);
      const submit = screen.getByRole('button', { name: 'Crear tablero' });

      expect(submit).toBeDisabled();
      await user.type(screen.getByLabelText('Nombre'), 'Roadmap');
      expect(submit).toBeEnabled();
    });

    it('should create the board and return to /boards', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/boards/').reply(201, buildBoard({ name: 'Roadmap' }));
      await renderWithProviders(<BoardFormScreen />);

      await user.type(screen.getByLabelText('Nombre'), 'Roadmap');
      await user.type(screen.getByLabelText('Descripción'), 'Q3 goals');
      await user.press(screen.getByRole('button', { name: 'Crear tablero' }));

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/boards'));
      expect(requestBody('post', '/api/v1/boards/')).toEqual({ name: 'Roadmap', description: 'Q3 goals' });
    });

    it('should go back instead of replacing when there is navigation history', async () => {
      const user = userEvent.setup();
      mockRouter.canGoBack.mockReturnValue(true);
      apiMock.onPost('/api/v1/boards/').reply(201, buildBoard());
      await renderWithProviders(<BoardFormScreen />);

      await user.type(screen.getByLabelText('Nombre'), 'Roadmap');
      await user.press(screen.getByRole('button', { name: 'Crear tablero' }));

      await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should show the field error returned by the backend and not navigate', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/boards/').reply(400, { name: ['Ensure this field has no more than 100 characters.'] });
      await renderWithProviders(<BoardFormScreen />);

      await user.type(screen.getByLabelText('Nombre'), 'Roadmap');
      await user.press(screen.getByRole('button', { name: 'Crear tablero' }));

      expect(
        await screen.findByText('Ensure this field has no more than 100 characters.')
      ).toBeOnTheScreen();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should prefill and PATCH an existing board', async () => {
      const user = userEvent.setup();
      apiMock.onGet('/api/v1/boards/5/').reply(200, buildBoard({ id: 5, name: 'Old name', description: 'Keep me' }));
      apiMock.onPatch('/api/v1/boards/5/').reply(200, buildBoard({ id: 5, name: 'New name' }));
      await renderWithProviders(<BoardFormScreen boardId={5} />);

      const name = await screen.findByDisplayValue('Old name');
      await user.clear(name);
      await user.type(name, 'New name');
      await user.press(screen.getByRole('button', { name: 'Guardar cambios' }));

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/board/5'));
      expect(requestBody('patch', '/api/v1/boards/5/')).toEqual({ name: 'New name', description: 'Keep me' });
    });
  });

  describe('TasksScreen', () => {
    it('should list the tasks of the board with their status and sprint', async () => {
      apiMock.onGet('/api/v1/boards/1/tasks/?page=1').reply(200, paginated([
        buildTask({
          id: 10,
          title: 'Write tests',
          status: { id: 3, name: 'In progress', color: '#0a7ea4' },
          sprint: { id: 4, name: 'Sprint 1' },
        }),
      ]));

      await renderWithProviders(<TasksScreen boardId={1} />);

      expect(await screen.findByText('Write tests')).toBeOnTheScreen();
      expect(screen.getByText('In progress')).toBeOnTheScreen();
      expect(screen.getByText(/Sprint 1/)).toBeOnTheScreen();
    });

    it('should navigate to a task and to the new-task form', async () => {
      const user = userEvent.setup();
      apiMock.onGet('/api/v1/boards/1/tasks/?page=1').reply(200, paginated([buildTask({ id: 10, title: 'Write tests' })]));
      await renderWithProviders(<TasksScreen boardId={1} />);

      await user.press(await screen.findByText('Write tests'));
      await user.press(screen.getByRole('button', { name: 'Nueva' }));

      expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/board/1/tasks/10');
      expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/board/1/tasks/new');
    });
  });

  describe('TaskFormScreen', () => {
    beforeEach(() => {
      apiMock.onGet('/api/v1/boards/1/statuses/?page=1').reply(200, paginated([buildStatus({ id: 3, name: 'In progress' })]));
      apiMock.onGet('/api/v1/boards/1/sprints/?page=1').reply(200, paginated([buildSprint({ id: 4, name: 'Sprint 1' })]));
      apiMock.onGet('/api/v1/boards/1/members/?page=1').reply(200, paginated([
        buildMembership({ user: { id: 8, username: 'ana', email: 'ana@example.com' } }),
      ]));
    });

    it('should create a task with the picked options sent in snake_case', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/boards/1/tasks/').reply(201, buildTask({ title: 'Ship it' }));
      await renderWithProviders(<TaskFormScreen boardId={1} />);

      await user.type(await screen.findByLabelText('Título'), 'Ship it');
      await user.press(screen.getByRole('button', { name: 'In progress' }));
      await user.press(screen.getByRole('button', { name: 'Sprint 1' }));
      await user.press(screen.getByRole('button', { name: 'ana' }));
      await user.press(screen.getByRole('button', { name: 'Crear tarea' }));

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/board/1/tasks'));
      expect(requestBody('post', '/api/v1/boards/1/tasks/')).toEqual({
        title: 'Ship it',
        description: '',
        status_id: 3,
        sprint_id: 4,
        assigned_to_id: 8,
      });
    });

    it('should send nulls for options left unset', async () => {
      const user = userEvent.setup();
      apiMock.onPost('/api/v1/boards/1/tasks/').reply(201, buildTask());
      await renderWithProviders(<TaskFormScreen boardId={1} />);

      await user.type(await screen.findByLabelText('Título'), 'Ship it');
      await user.press(screen.getByRole('button', { name: 'Crear tarea' }));

      await waitFor(() => expect(apiMock.history.post).toHaveLength(1));
      expect(requestBody('post', '/api/v1/boards/1/tasks/')).toMatchObject({
        status_id: null,
        sprint_id: null,
        assigned_to_id: null,
      });
    });

    it('should show an error instead of the form options when they fail to load', async () => {
      apiMock.onGet('/api/v1/boards/1/members/?page=1').reply(403, { detail: 'No sos miembro de este tablero.' });

      await renderWithProviders(<TaskFormScreen boardId={1} />);

      expect(await screen.findByText('No sos miembro de este tablero.')).toBeOnTheScreen();
    });
  });

  describe('expired session', () => {
    it('should refresh the access token on a 401 and transparently retry the request', async () => {
      const newAccess = makeJwt({ user_id: 7, rotated: true });
      apiMock
        .onGet('/api/v1/boards/?page=1')
        .replyOnce(401, { detail: 'Given token not valid for any token type' })
        .onPost('/api/v1/auth/token/refresh/', { refresh: 'refresh-token' })
        .replyOnce(200, { access: newAccess, refresh: 'refresh-token-2' })
        .onGet('/api/v1/boards/?page=1')
        .replyOnce(200, paginated([buildBoard({ name: 'Roadmap' })]));

      await renderWithProviders(<BoardsScreen />);

      expect(await screen.findByText('Roadmap')).toBeOnTheScreen();
      expect(apiMock.history.get.map((r) => r.headers?.Authorization)).toEqual([
        `Bearer ${accessToken}`,
        `Bearer ${newAccess}`,
      ]);
      expect(__getSecureStoreSnapshot()).toEqual({
        accessToken: newAccess,
        refreshToken: 'refresh-token-2',
      });
    });

    it('should sign out and redirect when the refresh token is no longer valid', async () => {
      apiMock
        .onGet('/api/v1/boards/?page=1')
        .reply(401, { detail: 'Given token not valid for any token type' })
        .onPost('/api/v1/auth/token/refresh/')
        .reply(401, { detail: 'Token is blacklisted' });

      await renderWithProviders(<BoardsScreen />);

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/boards'));
      expect(__getSecureStoreSnapshot()).toEqual({});
      expect(apiMock.history.post).toHaveLength(1);
    });
  });
});
