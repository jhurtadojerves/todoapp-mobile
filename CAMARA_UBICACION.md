# Cámara y ubicación (adjuntos de tareas)

Guía rápida de dónde vive cada parte de la feature de adjuntar una foto (tomada con la
cámara del dispositivo) más la ubicación GPS a una tarea. Como la API del backend no
tiene un campo para esto, el adjunto se persiste **enteramente en el dispositivo**
(no viaja al servidor).

## 1. Permisos (Android e iOS)

Configurados en `app.json`, sin código nativo escrito a mano — los plugins de Expo
generan el `AndroidManifest.xml` / `Info.plist` correspondientes en cada `expo prebuild`.

- Permisos de Android: [`app.json:26`](app.json#L26) (`CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)
- Mensaje de permiso de cámara/ubicación para iOS (`Info.plist`): [`app.json:12`](app.json#L12) (`NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`)
- Plugin `expo-image-picker` (mismo mensaje de cámara, aplicado también del lado Android): [`app.json:52`](app.json#L52)
- Plugin `expo-location` (mensaje de ubicación): [`app.json:58`](app.json#L58)

`ios/` no se puede generar en esta máquina (Windows, sin Xcode) — esta configuración
queda lista para cuando se compile desde Mac/Linux o EAS Build.

## 2. Modelo de dominio

Un adjunto es una foto (URI local) más coordenadas opcionales y cuándo se tomó.

- Modelo: [`src/domain/models/attachment.ts:1`](src/domain/models/attachment.ts#L1) (`TaskAttachment`, `TaskAttachmentInput`)

## 3. Capa de acceso a datos: fuente local + repositorio

Mismo patrón que el resto del proyecto (datasource + repositorio implementando una
interfaz de dominio), pero acá el "datasource" no llama a la API — persiste en el
filesystem del dispositivo con `expo-file-system`.

- Interfaz de repositorio: [`src/domain/repositories/attachment-repository.ts:3`](src/domain/repositories/attachment-repository.ts#L3) (`AttachmentRepository`)
- Fuente local (copia la foto a `document-directory/task-attachments/` y guarda un índice JSON): [`src/data/datasources/attachment-local-datasource.ts:12`](src/data/datasources/attachment-local-datasource.ts#L12) (`AttachmentLocalDataSource`)
- Repositorio (delega al datasource local): [`src/data/repositories/attachment-repository-impl.ts:5`](src/data/repositories/attachment-repository-impl.ts#L5) (`AttachmentRepositoryImpl`)

## 4. Casos de uso

Uno por operación, igual que el resto del dominio (ver `CONSUMO_API.md`).

- Listar adjuntos de una tarea: [`src/domain/usecases/get-task-attachments.ts:4`](src/domain/usecases/get-task-attachments.ts#L4) (`GetTaskAttachmentsUseCase`)
- Agregar un adjunto: [`src/domain/usecases/add-task-attachment.ts:4`](src/domain/usecases/add-task-attachment.ts#L4) (`AddTaskAttachmentUseCase`)
- Borrar un adjunto: [`src/domain/usecases/delete-task-attachment.ts:3`](src/domain/usecases/delete-task-attachment.ts#L3) (`DeleteTaskAttachmentUseCase`)
- Instanciados e inyectados en el contenedor de dependencias: [`src/shared/di/dependencies.ts:103`](src/shared/di/dependencies.ts#L103)

## 5. Captura: cámara + GPS

Toda la orquestación (pedir permisos, abrir la cámara, leer el GPS, guardar) vive en
el viewmodel de la pantalla de detalle de tarea.

- Pedido de permiso y apertura de cámara (`expo-image-picker`): [`src/presentation/viewmodels/use-task-attachments-viewmodel.ts:46`](src/presentation/viewmodels/use-task-attachments-viewmodel.ts#L46) (`requestCameraPermissionsAsync`, `launchCameraAsync`)
- Pedido de permiso y lectura de posición GPS (`expo-location`): [`src/presentation/viewmodels/use-task-attachments-viewmodel.ts:59`](src/presentation/viewmodels/use-task-attachments-viewmodel.ts#L59) (`requestForegroundPermissionsAsync`, `getCurrentPositionAsync`)
- La ubicación es *best-effort*: si el usuario rechaza el permiso de GPS, la foto se guarda igual con `latitude`/`longitude` en `null` — nunca bloquea el guardado de la foto.
- En web (`Platform.OS === 'web'`) la feature se deshabilita con un mensaje, ya que no hay cámara/GPS nativos ahí: [`src/presentation/viewmodels/use-task-attachments-viewmodel.ts:9`](src/presentation/viewmodels/use-task-attachments-viewmodel.ts#L9)

## 6. UI

- Lista de adjuntos (miniatura + coordenadas + botón borrar por ítem): [`src/presentation/components/tasks/task-attachment-list.tsx:12`](src/presentation/components/tasks/task-attachment-list.tsx#L12) (`TaskAttachmentList`) y [`src/presentation/components/tasks/task-attachment-item.tsx:13`](src/presentation/components/tasks/task-attachment-item.tsx#L13) (`TaskAttachmentItem`)
- Sección "Fotos y ubicación" con el botón "Tomar foto", integrada en la pantalla de detalle de tarea: [`src/presentation/screens/task-detail-screen.tsx:182`](src/presentation/screens/task-detail-screen.tsx#L182)
- Confirmación antes de borrar un adjunto: [`src/presentation/screens/task-detail-screen.tsx:96`](src/presentation/screens/task-detail-screen.tsx#L96) (`handleDeleteAttachment`, reutiliza `confirmAction` de `src/shared/utils/confirm.ts`)

## 7. Dónde vive físicamente el dato

- Fotos: `FileSystem.documentDirectory + 'task-attachments/<id>.<ext>'`
- Índice (metadata de todos los adjuntos, todas las tareas): `FileSystem.documentDirectory + 'task-attachments/index.json'`
- Ver [`src/data/datasources/attachment-local-datasource.ts`](src/data/datasources/attachment-local-datasource.ts) para el detalle de lectura/escritura del índice.

Al desinstalar la app se pierden los adjuntos (viven en el sandbox de la app, no en
un almacenamiento compartido) — es una limitación conocida, no un bug: no hay backend
al que subirlos todavía.
