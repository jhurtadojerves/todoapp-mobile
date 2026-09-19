# Consumo de la API REST

Guía rápida de dónde vive cada feature del consumo de la API del backend Django, pensada para explicarla en clase. Cada sección enlaza al archivo (y línea) donde se implementa principalmente esa tarea.

## 1. Cliente HTTP único (axios), configuración por ambiente y timeouts explícitos

Una sola instancia de axios (`apiClient`) centraliza todas las llamadas a la API, y `apiFetch` es la envoltura fina que todos los datasources usan sobre ella (nadie más en el código llama a `fetch` directamente, salvo un caso puntual documentado en `auth-datasource.ts` que también fue migrado a `apiClient`). La base URL y el timeout se resuelven por ambiente en vez de estar *hardcodeados*, y se pasan directo a `axios.create()`.

- Instancia axios centralizada: [`src/shared/api/http-client.ts:79`](src/shared/api/http-client.ts#L79) (`apiClient = create({ baseURL, timeout })`)
- Wrapper de conveniencia sobre `apiClient`: [`src/shared/api/http-client.ts:236`](src/shared/api/http-client.ts#L236) (`apiFetch`)
- Configuración por ambiente + timeout: [`src/shared/config/api.ts:13`](src/shared/config/api.ts#L13) (`API_BASE_URL`, `API_TIMEOUT_MS`)
- Valores por ambiente: [`.env`](.env) (desarrollo) y [`.env.production`](.env.production) (producción)
- Ejemplo de uso (un datasource llamando a `apiFetch` con token + schema): [`src/data/datasources/board-datasource.ts:19`](src/data/datasources/board-datasource.ts#L19) (`fetchBoard`)

## 2. Interceptores de autenticación y renovación automática del token

Antes esto vivía en un motor de interceptores hecho a mano (para explicar en clase cómo funciona `interceptors.request.use()` / `interceptors.response.use()` por dentro). Ahora que se migró a axios real, se usan directamente sus interceptores nativos — misma idea, sin reinventar la rueda:

- Interceptor de request (convierte el body a snake_case y adjunta el Bearer token): [`src/shared/api/http-client.ts:84`](src/shared/api/http-client.ts#L84) (`apiClient.interceptors.request.use`)
- Interceptor de response (convierte el body de vuelta a camelCase en 2xx): [`src/shared/api/http-client.ts:97`](src/shared/api/http-client.ts#L97) (`apiClient.interceptors.response.use`)
- Refresh-and-retry en 401 (no es un interceptor de error de axios, sino un `try/catch` recursivo alrededor de `apiClient.request` — así el conteo de reintentos viaja fácil entre llamadas): [`src/shared/api/http-client.ts:157`](src/shared/api/http-client.ts#L157) (`requestWithAuthRetry`)
- Traducción de cualquier `AxiosError` a las 4 familias de error de dominio (ver punto 5): [`src/shared/api/http-client.ts:187`](src/shared/api/http-client.ts#L187) (`translateError`)
- Renovación automática (single-flight refresh, para no disparar dos refresh en simultáneo): [`src/presentation/hooks/use-auth-session.ts:55`](src/presentation/hooks/use-auth-session.ts#L55) (`refreshAccessToken`)
- Máximo de reintentos configurable (`maxRefreshRetries`, default 1): definido en [`src/presentation/hooks/use-auth-session.ts:132`](src/presentation/hooks/use-auth-session.ts#L132) y consumido en `requestWithAuthRetry` en [`src/shared/api/http-client.ts:171`](src/shared/api/http-client.ts#L171)

## 3. Modelos con serialización generada

Cada modelo de dominio se define **una sola vez** como schema de Zod; el tipo de TypeScript se deriva del schema con `z.infer` en vez de escribirse a mano por separado. El mismo schema sirve como (de)serializador en runtime.

- Ejemplo canónico: [`src/domain/models/board.ts:4`](src/domain/models/board.ts#L4) (`boardSchema` → `type Board`)
- Mismo patrón aplicado en: [`comment.ts`](src/domain/models/comment.ts), [`membership.ts`](src/domain/models/membership.ts), [`sprint.ts`](src/domain/models/sprint.ts), [`status.ts`](src/domain/models/status.ts), [`task.ts`](src/domain/models/task.ts), [`token.ts`](src/domain/models/token.ts), [`user.ts`](src/domain/models/user.ts), [`register.ts`](src/domain/models/register.ts), [`pagination.ts`](src/domain/models/pagination.ts) (schema genérico para el envelope paginado)

## 4. Capa de acceso a datos: fuente remota + repositorio

Cada recurso tiene un *datasource* (llama a `apiFetch` con el schema del modelo) y un *repositorio* (implementa la interfaz de dominio delegando al datasource). Las capas superiores (casos de uso, viewmodels) solo conocen la interfaz del repositorio.

- Fuente remota (ejemplo): [`src/data/datasources/board-datasource.ts:10`](src/data/datasources/board-datasource.ts#L10) (`BoardDataSource`)
- Repositorio (ejemplo): [`src/data/repositories/board-repository-impl.ts:6`](src/data/repositories/board-repository-impl.ts#L6) (`BoardRepositoryImpl`)
- Mismo patrón para el resto de recursos en [`src/data/datasources/`](src/data/datasources/) y [`src/data/repositories/`](src/data/repositories/)

## 5. Cuatro familias de fallo de red traducidas a mensajes de dominio

`translateError` (invocado desde `apiFetch`, ver punto 2) traduce todo `AxiosError` posible en una de cuatro clases de error, cada una con su mensaje en español pensado para mostrarse directo en la UI:

| Familia | Cuándo ocurre | Clase |
| --- | --- | --- |
| Sin conexión | La request nunca llega a un servidor (offline, DNS, CORS) — `error.response` no existe | [`NetworkError`](src/shared/api/http-client.ts#L33) |
| Timeout | El servidor no respondió dentro de `API_TIMEOUT_MS` — `error.code === 'ECONNABORTED'` | [`TimeoutError`](src/shared/api/http-client.ts#L41) |
| Error de servidor | Respuesta 5xx | [`ServerError`](src/shared/api/http-client.ts#L22) |
| Error de cliente | Respuesta 4xx con body de error de DRF (`detail` o campos) | [`ApiError`](src/shared/api/http-client.ts#L9) |

## 6. Seguridad del consumo de la API

- HTTPS obligatorio en producción: [`src/shared/config/api.ts:13`](src/shared/config/api.ts#L13) (tira una excepción si `API_BASE_URL` no es `https://` fuera de `__DEV__`)
- Tráfico cleartext de Android acotado solo a hosts de desarrollo: [`plugins/withScopedCleartextTraffic.js:25`](plugins/withScopedCleartextTraffic.js#L25)
- Almacenamiento seguro de tokens (Keychain/Keystore vía `expo-secure-store`, con fallback a `localStorage` solo en web): [`src/shared/utils/storage.ts:1`](src/shared/utils/storage.ts#L1)
- Validación de la respuesta contra el schema del modelo (ver punto 3) evita confiar ciegamente en un contrato de API roto
