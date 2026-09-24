import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useBoardFormViewModel } from '@/presentation/viewmodels/use-board-form-viewmodel';
import { buildBoard } from '@/test-utils/fixtures';

const mockGetBoard = jest.fn();
const mockCreateBoard = jest.fn();
const mockUpdateBoard = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/shared/di/dependencies', () => ({
  dependencies: {
    getBoardUseCase: { execute: (...args: unknown[]) => mockGetBoard(...args) },
    createBoardUseCase: { execute: (...args: unknown[]) => mockCreateBoard(...args) },
    updateBoardUseCase: { execute: (...args: unknown[]) => mockUpdateBoard(...args) },
  },
}));

jest.mock('@/presentation/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('useBoardFormViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });

  describe('creating', () => {
    it('should start empty, not editing and not loading', async () => {
      const { result } = await renderHook(() => useBoardFormViewModel());

      expect(result.current.isEditing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.fields).toEqual({ name: '', description: '' });
      expect(mockGetBoard).not.toHaveBeenCalled();
    });

    it('should only allow submitting once the name is not blank', async () => {
      const { result } = await renderHook(() => useBoardFormViewModel());
      expect(result.current.canSubmit).toBe(false);

      await act(async () => result.current.setField('name', '   '));
      expect(result.current.canSubmit).toBe(false);

      await act(async () => result.current.setField('name', 'Roadmap'));
      expect(result.current.canSubmit).toBe(true);
    });

    it('should reject a blank name with a field error and not call the API', async () => {
      const { result } = await renderHook(() => useBoardFormViewModel());

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrow('El nombre es obligatorio');
      });

      expect(result.current.nameError).toBe('El nombre es obligatorio');
      expect(mockCreateBoard).not.toHaveBeenCalled();
    });

    it('should clear the name error as soon as the user types a name', async () => {
      const { result } = await renderHook(() => useBoardFormViewModel());
      await act(async () => {
        await result.current.submit().catch(() => {});
      });

      await act(async () => result.current.setField('name', 'R'));

      expect(result.current.nameError).toBeNull();
    });

    it('should create the board with the entered fields', async () => {
      mockCreateBoard.mockResolvedValue(buildBoard());
      const { result } = await renderHook(() => useBoardFormViewModel());
      await act(async () => {
        result.current.setField('name', 'Roadmap');
        result.current.setField('description', 'Q3 goals');
      });

      await act(() => result.current.submit());

      expect(mockCreateBoard).toHaveBeenCalledWith({ name: 'Roadmap', description: 'Q3 goals' });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should expose and rethrow the API error when saving fails', async () => {
      mockCreateBoard.mockRejectedValue(new Error('Ya existe un tablero con ese nombre.'));
      const { result } = await renderHook(() => useBoardFormViewModel());
      await act(async () => result.current.setField('name', 'Roadmap'));

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrow();
      });

      expect(result.current.error).toBe('Ya existe un tablero con ese nombre.');
    });

    it('should refuse to submit without an active session', async () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      const { result } = await renderHook(() => useBoardFormViewModel());
      await act(async () => result.current.setField('name', 'Roadmap'));

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrow('No hay una sesión activa.');
      });
      expect(mockCreateBoard).not.toHaveBeenCalled();
    });
  });

  describe('editing', () => {
    it('should load the board and prefill the fields', async () => {
      mockGetBoard.mockResolvedValue(buildBoard({ id: 5, name: 'Old name', description: 'Old desc' }));

      const { result } = await renderHook(() => useBoardFormViewModel(5));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetBoard).toHaveBeenCalledWith(5);
      expect(result.current.isEditing).toBe(true);
      expect(result.current.fields).toEqual({ name: 'Old name', description: 'Old desc' });
    });

    it('should show the load error when the board cannot be fetched', async () => {
      mockGetBoard.mockRejectedValue(new Error('No existe o no tenés acceso a este recurso.'));

      const { result } = await renderHook(() => useBoardFormViewModel(5));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBe('No existe o no tenés acceso a este recurso.');
    });

    it('should update instead of create when submitting', async () => {
      mockGetBoard.mockResolvedValue(buildBoard({ id: 5, name: 'Old name', description: '' }));
      mockUpdateBoard.mockResolvedValue(buildBoard({ id: 5 }));
      const { result } = await renderHook(() => useBoardFormViewModel(5));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => result.current.setField('name', 'New name'));

      await act(() => result.current.submit());

      expect(mockUpdateBoard).toHaveBeenCalledWith(5, { name: 'New name', description: '' });
      expect(mockCreateBoard).not.toHaveBeenCalled();
    });
  });
});
