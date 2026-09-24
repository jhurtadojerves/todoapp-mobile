import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

import { TaskAttachment } from '@/domain/models/attachment';
import { useTaskAttachmentsViewModel } from '@/presentation/viewmodels/use-task-attachments-viewmodel';

const mockGetAttachments = jest.fn();
const mockAddAttachment = jest.fn();
const mockDeleteAttachment = jest.fn();

jest.mock('@/shared/di/dependencies', () => ({
  dependencies: {
    getTaskAttachmentsUseCase: { execute: (...args: unknown[]) => mockGetAttachments(...args) },
    addTaskAttachmentUseCase: { execute: (...args: unknown[]) => mockAddAttachment(...args) },
    deleteTaskAttachmentUseCase: { execute: (...args: unknown[]) => mockDeleteAttachment(...args) },
  },
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const requestCamera = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const launchCamera = ImagePicker.launchCameraAsync as jest.Mock;
const requestLocation = Location.requestForegroundPermissionsAsync as jest.Mock;
const getPosition = Location.getCurrentPositionAsync as jest.Mock;

const attachment: TaskAttachment = {
  id: 'a1',
  taskId: 10,
  photoUri: 'file:///documents/task-attachments/a1.jpg',
  latitude: -0.18,
  longitude: -78.47,
  createdAt: '2026-01-01T00:00:00Z',
};

const granted = { granted: true, canAskAgain: true };
const deniedAskable = { granted: false, canAskAgain: true };
const deniedBlocked = { granted: false, canAskAgain: false };
const photo = { canceled: false, assets: [{ uri: 'file:///cache/photo.jpg' }] };

async function renderLoaded() {
  const hook = await renderHook(() => useTaskAttachmentsViewModel(10));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('useTaskAttachmentsViewModel', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    mockGetAttachments.mockResolvedValue([]);
    mockAddAttachment.mockResolvedValue(attachment);
    requestCamera.mockResolvedValue(granted);
    launchCamera.mockResolvedValue(photo);
    requestLocation.mockResolvedValue(granted);
    getPosition.mockResolvedValue({ coords: { latitude: -0.18, longitude: -78.47 } });
  });

  afterAll(() => {
    Platform.OS = originalOS;
  });

  describe('loading', () => {
    it('should load the attachments of the task on mount', async () => {
      mockGetAttachments.mockResolvedValue([attachment]);

      const { result } = await renderLoaded();

      expect(mockGetAttachments).toHaveBeenCalledWith(10);
      expect(result.current.attachments).toEqual([attachment]);
    });

    it('should expose the error message when loading fails', async () => {
      mockGetAttachments.mockRejectedValue(new Error('Read failed'));

      const { result } = await renderLoaded();

      expect(result.current.error).toBe('Read failed');
    });
  });

  describe('captureAttachment', () => {
    it('should save the photo with GPS coordinates and reload the list', async () => {
      const { result } = await renderLoaded();
      mockGetAttachments.mockResolvedValue([attachment]);

      await act(() => result.current.captureAttachment());

      expect(mockAddAttachment).toHaveBeenCalledWith(10, {
        photoUri: 'file:///cache/photo.jpg',
        latitude: -0.18,
        longitude: -78.47,
      });
      expect(result.current.attachments).toEqual([attachment]);
      expect(result.current.captureError).toBeNull();
      expect(result.current.isCapturing).toBe(false);
    });

    it('should refuse on web without touching the camera', async () => {
      Platform.OS = 'web';
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(requestCamera).not.toHaveBeenCalled();
      expect(result.current.captureError).toBe(
        'La cámara y el GPS solo están disponibles en la app móvil.'
      );
    });

    it('should ask for camera permission again when it was denied but can still be requested', async () => {
      requestCamera.mockResolvedValue(deniedAskable);
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(result.current.captureError).toBe('Se necesita permiso de cámara para tomar la foto.');
      expect(result.current.isCameraPermissionBlocked).toBe(false);
      expect(launchCamera).not.toHaveBeenCalled();
    });

    it('should flag a permanently blocked camera permission so the UI can link to settings', async () => {
      requestCamera.mockResolvedValue(deniedBlocked);
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(result.current.isCameraPermissionBlocked).toBe(true);
      expect(result.current.captureError).toMatch(/bloqueado/);
      expect(mockAddAttachment).not.toHaveBeenCalled();
    });

    it('should do nothing when the user cancels the camera', async () => {
      launchCamera.mockResolvedValue({ canceled: true, assets: null });
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(requestLocation).not.toHaveBeenCalled();
      expect(mockAddAttachment).not.toHaveBeenCalled();
      expect(result.current.captureError).toBeNull();
    });

    it('should still save the photo without coordinates and warn when location is denied', async () => {
      requestLocation.mockResolvedValue(deniedAskable);
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(mockAddAttachment).toHaveBeenCalledWith(10, {
        photoUri: 'file:///cache/photo.jpg',
        latitude: null,
        longitude: null,
      });
      expect(result.current.locationWarning).toMatch(/sin ubicación/);
      expect(result.current.isLocationPermissionBlocked).toBe(false);
    });

    it('should flag a permanently blocked location permission', async () => {
      requestLocation.mockResolvedValue(deniedBlocked);
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(result.current.isLocationPermissionBlocked).toBe(true);
    });

    it('should save without coordinates when reading the GPS position fails', async () => {
      getPosition.mockRejectedValue(new Error('Location unavailable'));
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(mockAddAttachment).toHaveBeenCalledWith(10, expect.objectContaining({ latitude: null, longitude: null }));
      expect(result.current.captureError).toBeNull();
      expect(result.current.locationWarning).toBeNull();
    });

    it('should surface a storage failure as a capture error', async () => {
      mockAddAttachment.mockRejectedValue(new Error('Disk full'));
      const { result } = await renderLoaded();

      await act(() => result.current.captureAttachment());

      expect(result.current.captureError).toBe('Disk full');
      expect(result.current.isCapturing).toBe(false);
    });

    it('should clear previous warnings when capturing again', async () => {
      requestCamera.mockResolvedValueOnce(deniedBlocked);
      const { result } = await renderLoaded();
      await act(() => result.current.captureAttachment());

      await act(() => result.current.captureAttachment());

      expect(result.current.captureError).toBeNull();
      expect(result.current.isCameraPermissionBlocked).toBe(false);
    });
  });

  describe('deleteAttachment', () => {
    it('should delete the attachment and reload the list', async () => {
      mockGetAttachments.mockResolvedValue([attachment]);
      const { result } = await renderLoaded();
      mockGetAttachments.mockResolvedValue([]);

      await act(() => result.current.deleteAttachment('a1'));

      expect(mockDeleteAttachment).toHaveBeenCalledWith('a1');
      expect(result.current.attachments).toEqual([]);
      expect(result.current.deletingId).toBeNull();
    });

    it('should expose the error when deleting fails', async () => {
      mockDeleteAttachment.mockRejectedValue(new Error('Delete failed'));
      const { result } = await renderLoaded();

      await act(() => result.current.deleteAttachment('a1'));

      expect(result.current.deleteError).toBe('Delete failed');
      expect(result.current.deletingId).toBeNull();
    });
  });

  it('should open the system settings for the app', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const { result } = await renderLoaded();

    result.current.openAppSettings();

    expect(openSettings).toHaveBeenCalledTimes(1);
  });
});
