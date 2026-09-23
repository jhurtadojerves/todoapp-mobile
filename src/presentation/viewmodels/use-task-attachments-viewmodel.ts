import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { TaskAttachment } from '@/domain/models/attachment';
import { dependencies } from '@/shared/di/dependencies';

export function useTaskAttachmentsViewModel(taskId: number) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isCameraPermissionBlocked, setIsCameraPermissionBlocked] = useState(false);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [isLocationPermissionBlocked, setIsLocationPermissionBlocked] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    return dependencies.getTaskAttachmentsUseCase
      .execute(taskId)
      .then(setAttachments)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los adjuntos.');
      })
      .finally(() => setIsLoading(false));
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const captureAttachment = async (): Promise<void> => {
    setCaptureError(null);
    setIsCameraPermissionBlocked(false);
    setLocationWarning(null);
    setIsLocationPermissionBlocked(false);

    if (Platform.OS === 'web') {
      setCaptureError('La cámara y el GPS solo están disponibles en la app móvil.');
      return;
    }

    setIsCapturing(true);
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        if (!cameraPermission.canAskAgain) {
          setIsCameraPermissionBlocked(true);
          throw new Error(
            'El permiso de cámara está bloqueado. Es necesario habilitarlo en la configuración del sistema para tomar fotos.'
          );
        }
        throw new Error('Se necesita permiso de cámara para tomar la foto.');
      }

      const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      let latitude: number | null = null;
      let longitude: number | null = null;

      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.granted) {
        try {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch {
        }
      } else {
        setIsLocationPermissionBlocked(!locationPermission.canAskAgain);
        setLocationWarning(
          'La foto se guardó sin ubicación porque el permiso de GPS está desactivado. Es opcional, pero se puede activar manualmente en la configuración del sistema.'
        );
      }

      await dependencies.addTaskAttachmentUseCase.execute(taskId, {
        photoUri: result.assets[0].uri,
        latitude,
        longitude,
      });
      await load();
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'No se pudo capturar la foto.');
    } finally {
      setIsCapturing(false);
    }
  };

  const openAppSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const deleteAttachment = async (id: string): Promise<void> => {
    setDeleteError(null);
    setDeletingId(id);
    try {
      await dependencies.deleteTaskAttachmentUseCase.execute(id);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el adjunto.');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    attachments,
    isLoading,
    error,
    isCapturing,
    captureError,
    isCameraPermissionBlocked,
    locationWarning,
    isLocationPermissionBlocked,
    deletingId,
    deleteError,
    captureAttachment,
    deleteAttachment,
    openAppSettings,
  };
}
