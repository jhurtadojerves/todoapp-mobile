# Plan: notificaciones por falta de permisos (cámara y ubicación)

> Resume los dos ajustes implementados sobre `captureAttachment` para que el
> usuario sepa por qué falló o quedó incompleta la captura de una foto, y cómo
> resolverlo desde la propia app.

## Contexto

Al tomar una foto desde el detalle de una tarea se piden dos permisos:

- **Cámara** (obligatorio): sin él no se puede tomar la foto.
- **Ubicación** (opcional): si no está, la foto se guarda igual pero sin
  coordenadas.

Antes de este plan, ambos casos solo mostraban un `Paragraph` de error simple,
sin indicar cómo reactivar el permiso.

## Archivos involucrados

- [src/presentation/viewmodels/use-task-attachments-viewmodel.ts](src/presentation/viewmodels/use-task-attachments-viewmodel.ts)
- [src/presentation/screens/task-detail-screen.tsx](src/presentation/screens/task-detail-screen.tsx)

## Ajuste 1: permiso de cámara denegado (bloqueante)

**Objetivo:** si el usuario bloqueó el permiso de cámara (no se le puede volver
a pedir), mostrar un aviso claro con un enlace directo a la configuración del
sistema.

**Detección:** `ImagePicker.requestCameraPermissionsAsync()` devuelve
`granted` y `canAskAgain`.

- `canAskAgain: true` → todavía se puede reintentar pidiendo el permiso de
  nuevo (mensaje genérico, sin enlace).
- `canAskAgain: false` → el permiso está bloqueado permanentemente → se marca
  `isCameraPermissionBlocked = true` y se agrega el enlace a Settings.

**Estado agregado al viewmodel:** `isCameraPermissionBlocked`.

**UI:** card con `borderColor="$danger"` (impide tomar la foto) que muestra el
mensaje de error y, si está bloqueado, el link "Abrir configuración del
sistema".

## Ajuste 2: permiso de ubicación ausente (informativo, no bloqueante)

**Objetivo:** avisar que la foto se guardó sin ubicación porque el permiso de
GPS no está activo, aclarando que es opcional, y ofrecer siempre un enlace a
Settings para activarlo si el usuario quiere.

**Detección:** `Location.requestForegroundPermissionsAsync()` — si
`granted` es `false` (sin importar `canAskAgain`), se guarda la foto sin
coordenadas y se muestra el aviso.

**Estado agregado al viewmodel:** `locationWarning` (mensaje) e
`isLocationPermissionBlocked` (disponible para diferenciar estilos a futuro,
aunque el enlace se muestra siempre que hay `locationWarning`).

**UI:** card con `borderColor="$border"` (informativa, no bloquea el flujo)
que muestra el mensaje en `$muted` y el enlace "Abrir configuración del
sistema".

## Pieza común: abrir Settings

```ts
const openAppSettings = useCallback(() => {
  Linking.openSettings();
}, []);
```

`Linking.openSettings()` funciona en iOS y Android (RN 0.63+) y abre la
pantalla de configuración de la app, donde el usuario puede reactivar cámara
y/o ubicación manualmente.

## Estilo visual (consistente entre ambas cards)

Mismo patrón que `task-card.tsx`, `board-card.tsx` y `comment-item.tsx`:

```tsx
<YStack
  backgroundColor="$backgroundSoft"
  borderRadius="$3"
  borderWidth={1}
  borderColor="$danger" // o "$border" según el caso
  padding="$3"
  gap="$2"
>
  <Paragraph color="$danger" fontSize={13}>
    {mensaje}
  </Paragraph>
  <Paragraph
    color="$primary"
    fontSize={13}
    fontWeight="700"
    textDecorationLine="underline"
    onPress={openAppSettings}
  >
    Abrir configuración del sistema
  </Paragraph>
</YStack>
```

| Card | `borderColor` | ¿Bloquea la foto? | ¿Enlace a Settings? |
| --- | --- | --- | --- |
| Cámara bloqueada | `$danger` | Sí | Solo si `isCameraPermissionBlocked` |
| Ubicación ausente | `$border` | No (foto se guarda sin GPS) | Siempre que hay `locationWarning` |

## Cómo probarlo

1. Denegar el permiso de cámara marcando "No volver a preguntar" (Android) o
   desactivarlo desde Configuración (iOS).
2. Presionar "Tomar foto" → debe aparecer la card roja con el enlace a
   Settings.
3. Reactivar cámara pero denegar ubicación → tomar la foto → debe guardarse
   sin coordenadas y aparecer la card informativa con el enlace a Settings.
4. Tocar el enlace en cualquiera de los dos casos debe abrir la configuración
   de la app (`Linking.openSettings()`).
5. Reactivar el permiso correspondiente desde Settings, volver a la app y
   repetir la captura para confirmar que el aviso desaparece.
