# Cómo volver a implementar: enlace a Settings cuando el permiso está bloqueado

> Este documento describe, paso a paso, cómo reintroducir la funcionalidad que se
> revirtió: mostrar mensajes de permisos de cámara/ubicación como *cards* con un
> enlace para abrir la configuración del sistema cuando el permiso está bloqueado.
> Sirve como guion para la demo en clase.

## Archivos involucrados

- [src/presentation/viewmodels/use-task-attachments-viewmodel.ts](src/presentation/viewmodels/use-task-attachments-viewmodel.ts)
- [src/presentation/screens/task-detail-screen.tsx](src/presentation/screens/task-detail-screen.tsx)

## 1. Detectar si el permiso está bloqueado

`expo-image-picker` y `expo-location` devuelven, al pedir el permiso, un objeto con
`granted` y `canAskAgain`:

- `granted: false, canAskAgain: true` → el usuario todavía puede ver el diálogo
  nativo de permisos (se le puede volver a pedir).
- `granted: false, canAskAgain: false` → el permiso está **bloqueado** (el usuario
  lo negó de forma permanente o lo desactivó desde Settings). El único camino es
  abrir la configuración del sistema.

En `use-task-attachments-viewmodel.ts`, dentro de `captureAttachment`, agregar:

```ts
import { Linking, Platform } from 'react-native';

// nuevo estado
const [isCameraPermissionBlocked, setIsCameraPermissionBlocked] = useState(false);
const [locationWarning, setLocationWarning] = useState<string | null>(null);
const [isLocationPermissionBlocked, setIsLocationPermissionBlocked] = useState(false);
```

Al inicio de `captureAttachment`, resetear los tres estados junto con `captureError`.

### Cámara (bloquea la acción)

```ts
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
```

### Ubicación (es opcional, no bloquea la foto)

```ts
const locationPermission = await Location.requestForegroundPermissionsAsync();
if (locationPermission.granted) {
  // ... obtener lat/long como ya existe
} else {
  setIsLocationPermissionBlocked(!locationPermission.canAskAgain);
  setLocationWarning(
    'La foto se guardó sin ubicación porque el permiso de GPS está desactivado. Es opcional, pero se puede activar manualmente en la configuración del sistema.'
  );
}
```

> Nota de idioma: usar español neutro en los mensajes (evitar voseo como
> "habilitalo" o "podés"; preferir formas impersonales: "es necesario...",
> "se puede...").

## 2. Función para abrir la configuración del sistema

`Linking.openSettings()` de `react-native` funciona tanto en iOS como en Android
(desde RN 0.63+) y abre la pantalla de configuración de la app:

```ts
const openAppSettings = useCallback(() => {
  Linking.openSettings();
}, []);
```

Exponer `isCameraPermissionBlocked`, `locationWarning`, `isLocationPermissionBlocked`
y `openAppSettings` en el `return` del hook.

## 3. Consumir el hook en la pantalla

En `task-detail-screen.tsx`, desestructurar los nuevos valores del hook:

```ts
const {
  // ...lo existente
  isCameraPermissionBlocked,
  locationWarning,
  isLocationPermissionBlocked,
  openAppSettings,
} = useTaskAttachmentsViewModel(taskId);
```

## 4. UI: mostrar los mensajes como *cards*

Seguir el mismo patrón visual que ya usan `task-card.tsx`, `board-card.tsx` y
`comment-item.tsx` (`YStack` con `backgroundColor="$backgroundSoft"`,
`borderRadius="$3"`, `borderWidth={1}`, `padding="$3"`, `gap="$2"`), en vez de un
`Paragraph` suelto.

```tsx
{captureError ? (
  <YStack
    backgroundColor="$backgroundSoft"
    borderRadius="$3"
    borderWidth={1}
    borderColor="$danger"
    padding="$3"
    gap="$2"
  >
    <Paragraph color="$danger" fontSize={13}>
      {captureError}
    </Paragraph>
    {isCameraPermissionBlocked ? (
      <Paragraph
        color="$primary"
        fontSize={13}
        fontWeight="700"
        textDecorationLine="underline"
        onPress={openAppSettings}
      >
        Abrir configuración del sistema
      </Paragraph>
    ) : null}
  </YStack>
) : null}

{locationWarning ? (
  <YStack
    backgroundColor="$backgroundSoft"
    borderRadius="$3"
    borderWidth={1}
    borderColor="$border"
    padding="$3"
    gap="$2"
  >
    <Paragraph color="$muted" fontSize={13}>
      {locationWarning}
    </Paragraph>
    {isLocationPermissionBlocked ? (
      <Paragraph
        color="$primary"
        fontSize={13}
        fontWeight="700"
        textDecorationLine="underline"
        onPress={openAppSettings}
      >
        Abrir configuración del sistema
      </Paragraph>
    ) : null}
  </YStack>
) : null}
```

Diferencia entre las dos cards:

- **Cámara bloqueada**: `borderColor="$danger"` porque impide tomar la foto.
- **Ubicación sin permiso**: `borderColor="$border"` porque es informativo/opcional
  (la foto se guarda igual, sin coordenadas).

## 5. Cómo probarlo en el dispositivo/emulador

1. Denegar el permiso de cámara (o ubicación) y marcar "No volver a preguntar" /
   negarlo dos veces en Android, o simplemente desactivarlo desde Configuración en
   iOS.
2. Presionar "Tomar foto" en el detalle de una tarea.
3. Debería aparecer la card de error con el enlace "Abrir configuración del
   sistema".
4. Tocar el enlace debe abrir la pantalla de configuración de la app
   (`Linking.openSettings()`), donde se puede reactivar el permiso manualmente.
5. Volver a la app y tomar la foto nuevamente para confirmar que ya funciona.
