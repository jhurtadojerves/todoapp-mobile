# Tests e2e (Maestro)

Flujos que manejan la app real en un emulador/dispositivo Android contra el backend real.

| Flujo | Qué cubre |
| --- | --- |
| `flows/01-login-invalid.yaml` | Credenciales inválidas → se muestra el error del backend y no se entra. |
| `flows/02-board-task-lifecycle.yaml` | Login → crear tablero → crear tarea → borrar tarea → borrar tablero. |
| `flows/03-logout.yaml` | Cerrar sesión desde el menú del header vuelve a proteger las pestañas. |

`subflows/login.yaml` arranca la app con el estado limpio e inicia sesión; lo reutilizan los flujos 02 y 03.

## Requisitos

1. **Maestro CLI** (necesita Java 17+):
   ```bash
   curl -fsSL "https://get.maestro.mobile.dev" | bash
   ```
   En Windows, correr ese comando desde Git Bash o WSL, o descargar el zip de
   [releases](https://github.com/mobile-dev-inc/maestro/releases) y agregar `maestro/bin` al `PATH`.
2. **Emulador Android o dispositivo** conectado (`adb devices` lo tiene que listar).
3. **La app instalada** (development build o APK de preview, ver [BUILD_APK.md](../BUILD_APK.md)):
   ```bash
   npx expo run:android
   ```
   Expo Go no sirve: los flujos apuntan al `appId` `com.jhurtadojerves.todoapp`.
4. **Backend levantado** en la URL de `EXPO_PUBLIC_API_BASE_URL` y un **usuario de prueba** ya registrado.

## Ejecutar

```bash
# Todos los flujos
maestro test -e E2E_EMAIL=e2e@example.com -e E2E_PASSWORD='Secreta123!' .maestro

# Uno solo
maestro test -e E2E_EMAIL=e2e@example.com -e E2E_PASSWORD='Secreta123!' .maestro/flows/02-board-task-lifecycle.yaml

# Atajo npm (pasar las variables después de --)
npm run test:e2e -- -e E2E_EMAIL=e2e@example.com -e E2E_PASSWORD='Secreta123!'
```

Para escribir o depurar un flujo, `maestro studio` abre un inspector con la jerarquía de la pantalla.

## Notas

- Los nombres de tablero y tarea llevan un timestamp, así que se puede re-ejecutar sin choques; el flujo 02 borra lo que crea.
- Los elementos se buscan por texto visible o `accessibilityLabel` (los `AppInput` usan el placeholder como label), así que no hace falta agregar `testID`.
- Los diálogos de confirmación nativos se tocan con la regex `(?i)eliminar`, porque algunos temas de Android muestran los botones en mayúsculas.
