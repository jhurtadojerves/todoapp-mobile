# Guia: Build de APK para Android

## Opcion 1: EAS Build (en la nube, recomendado)

No requiere Android Studio ni JDK instalados localmente.

### Prerequisitos
- Cuenta en [expo.dev](https://expo.dev)
- Node.js instalado

### Pasos

**1. Instalar EAS CLI**
```bash
npm install -g eas-cli
```

**2. Iniciar sesion en Expo**
```bash
eas login
```

**3. Configurar EAS en el proyecto**
```bash
cd todoapp
eas build:configure
```
Cuando pregunte por la plataforma, selecciona **Android**. Esto genera el archivo `eas.json`.

**4. Editar `eas.json` para producir APK**

Por defecto EAS genera un `.aab` (Android App Bundle). Para obtener un `.apk` instalable directamente, asegurate de que el perfil `preview` tenga:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**5. Lanzar el build**
```bash
eas build -p android --profile preview
```

El proceso corre en los servidores de Expo. Al finalizar (aprox. 10-15 min) recibes un link para descargar el `.apk`.

---

## Opcion 2: Build local con Android Studio

Requiere entorno Android configurado localmente.

### Prerequisitos
- [Android Studio](https://developer.android.com/studio) instalado
- JDK 17 o superior
- Variable de entorno `ANDROID_HOME` configurada
- Un emulador o dispositivo fisico conectado (solo para pruebas)

### Pasos

**1. Instalar dependencias del proyecto**
```bash
cd todoapp
npm install
```

**2. Generar el proyecto nativo Android**
```bash
npx expo prebuild --platform android
```
Esto crea la carpeta `android/` con el proyecto nativo.

**3. Build con Gradle**
```bash
cd android
./gradlew assembleRelease
```
> En Windows usa `.\gradlew.bat assembleRelease` si el comando anterior no funciona.

**4. Ubicacion del APK generado**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Notas sobre firma (signing)

Para distribuir la app fuera del modo desarrollo necesitas firmarla. Puedes:

- Dejar que Expo genere un keystore de debug (valido para pruebas)
- Crear tu propio keystore para produccion:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Luego referenciarlo en `android/app/build.gradle` dentro del bloque `signingConfigs`.

---

## Diferencias clave

| | EAS Build | Local |
|---|---|---|
| Requiere Android Studio | No | Si |
| Velocidad de setup | Rapido | Lento |
| Control sobre el build | Limitado | Total |
| Costo | Gratis (con limites) | Gratis |
| Recomendado para | Pruebas y distribucion | Builds customizados |

## Nota de seguridad: tráfico cleartext

`app.json` tiene `android.usesCleartextTraffic: true` para poder hablar con el
backend local por HTTP plano durante desarrollo (`10.0.2.2:8080`, IP de LAN,
etc.). Esto habilita HTTP sin cifrar para **toda** la app, no solo para el
host de desarrollo. Antes de un release real a producción, hay que:

- Apuntar `API_BASE_URL` a un backend HTTPS, y
- Quitar `usesCleartextTraffic` (o reemplazarlo por un
  `network_security_config.xml` que solo permita cleartext para el dominio
  de desarrollo) para no dejar la app aceptando HTTP plano en producción.
