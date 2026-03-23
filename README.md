# WordPress Manager

Aplicación web en JavaScript nativo para gestionar posts de WordPress desde una interfaz simple, responsive y con soporte para tema claro/oscuro.

## Qué Hace

- Lista posts de WordPress con paginación.
- Crea, edita, previsualiza y elimina posts.
- Edita contenido con TinyMCE.
- Asigna categorías existentes con filtro en tiempo real.
- Busca etiquetas remotas, las autocompleta y crea etiquetas nuevas si no existen.
- Muestra estado, fecha, categorías, etiquetas y extracto de cada post.
- Guarda la configuración de conexión en el `localStorage` del navegador.
- Incluye toasts, barra de progreso y skeleton loaders para mejorar la UX.

## Captura Funcional Del Proyecto

La interfaz principal incluye:

- Cabecera con cambio de tema y acceso a configuración.
- Listado de cards de posts con menú de acciones.
- Modal de configuración para conectar con la REST API de WordPress.
- Modal editor para crear o modificar posts.
- Modal de previsualización para revisar el contenido sin salir de la app.
- Estado vacío cuando no hay posts disponibles.

## Requisitos

- Node.js 18 o superior recomendado.
- Un sitio WordPress con la REST API disponible.
- Un usuario con permisos para gestionar posts.
- Una Application Password de WordPress.

## Instalación

```bash
npm install
```

## Desarrollo

Servidor de desarrollo con recarga automática:

```bash
npm start
```

El comando ejecuta:

- compilación de Tailwind en modo watch
- servidor local mediante `servor`

Si prefieres ejecutar cada parte por separado:

```bash
npm run build:watch
```

```bash
npx servor --reload
```

## Build

Compila el CSS una sola vez:

```bash
npm run build
```

El CSS generado se escribe en `dist/output.css`.

## Configuración De WordPress

### 1. Generar Una Application Password

1. Inicia sesión en tu sitio WordPress.
2. Ve a `Usuarios > Perfil`.
3. Busca la sección `Contraseñas de aplicación`.
4. Crea una nueva contraseña para esta app.
5. Copia la contraseña generada.

### 2. Configurar La Aplicación

Dentro de la app, abre `Configuración` y completa:

- `URL de la API`: por ejemplo `https://tusitio.com/wp-json/wp/v2/`
- `Usuario`: tu usuario de WordPress
- `Contraseña de Aplicación`: la contraseña generada en el paso anterior

La configuración se guarda en `localStorage` bajo la clave `wpConfig`.

## Flujo De Uso

### Ver Posts

El listado principal carga:

- título
- fecha
- estado
- categorías
- hasta 3 etiquetas por card
- extracto

Cuando el sitio tiene muchos posts, la navegación se hace con paginación usando `Anterior` y `Siguiente`.

### Crear Un Post

1. Haz clic en `Nuevo Post`.
2. Completa el título.
3. Escribe el contenido en TinyMCE.
4. Selecciona categorías.
5. Añade etiquetas separadas por comas.
6. Define el estado como `draft` o `publish`.
7. Guarda los cambios.

### Editar Un Post

1. Abre el menú de acciones de la card.
2. Elige `Editar`.
3. Modifica los campos necesarios.
4. Guarda.

### Previsualizar Un Post

1. Abre el menú de acciones de la card.
2. Elige `Ver`.
3. La app abre un modal de vista previa con contenido, fecha, estado, categorías y etiquetas.

### Eliminar Un Post

1. Abre el menú de acciones.
2. Elige `Borrar`.
3. Confirma la operación en el diálogo nativo del navegador.

## Gestión De Categorías Y Etiquetas

### Categorías

- Se cargan desde la REST API.
- Se muestran como checkboxes.
- Se pueden filtrar por texto dentro del modal de edición.

### Etiquetas

- Se escriben como una lista separada por comas.
- La app consulta sugerencias remotas desde WordPress.
- Se pueden recorrer sugerencias con teclado usando flechas y `Enter`.
- Si una etiqueta no existe, la app intenta crearla antes de guardar el post.

## Tecnologías

- HTML
- JavaScript nativo
- Tailwind CSS v4
- PostCSS
- TinyMCE 6
- WordPress REST API
- `servor` para el servidor local

## Estructura Del Proyecto

- `index.html`: layout principal y modales.
- `app.js`: lógica de UI, posts, etiquetas, categorías, paginación y eventos.
- `api-wp.js`: cliente para consumir la WordPress REST API.
- `src/input.css`: entrada de Tailwind y estilos adicionales.
- `dist/output.css`: CSS compilado.
- `demo-wxr.xml`: archivo de ejemplo para importación de contenido en WordPress.
- `package.json`: scripts y dependencias.

## Scripts Disponibles

- `npm start`: inicia entorno de desarrollo.
- `npm run dev`: alias del flujo de desarrollo actual.
- `npm run build`: compila Tailwind una vez.
- `npm run build:watch`: recompila Tailwind en modo watch.

## Seguridad Y Limitaciones

- Las credenciales se almacenan en el navegador del usuario, no en un backend propio.
- La app depende de que la REST API de WordPress permita autenticación con Application Passwords.
- No hay gestión de medios ni páginas; el foco actual está en posts.
- La app usa `confirm()` para la eliminación de posts.

## Datos De Prueba

El repositorio incluye `demo-wxr.xml`, útil para poblar un WordPress de pruebas con contenido de ejemplo.

## Changelog

El historial del proyecto está en [CHANGELOG.md](CHANGELOG.md).
