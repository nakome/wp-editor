# WordPress Manager

Aplicación web moderna para gestionar posts de WordPress con interfaz intuitiva y tema claro/oscuro.

## Características

- Ver, crear, editar y eliminar posts de WordPress
- Editor WYSIWYG con TinyMCE para contenido formateado
- Gestión de categorías con selección múltiple
- Gestión de etiquetas con preview en tiempo real
- Interfaz moderna con Tailwind CSS
- Tema claro/oscuro con persistencia
- Configuración segura de credenciales con localStorage
- Notificaciones toast para feedback del usuario
- Diseño responsive para móvil y escritorio
- Autenticación mediante Application Passwords de WordPress

## Configuración

### 1. Generar Application Password en WordPress

Para usar esta aplicación, necesitas generar una contraseña de aplicación en WordPress:

1. Inicia sesión en tu sitio WordPress
2. Ve a **Usuarios → Perfil**
3. Desplázate hasta la sección **Contraseñas de Aplicación**
4. Ingresa un nombre para la aplicación (ej: "WordPress Manager")
5. Haz clic en **Añadir nueva contraseña de aplicación**
6. Copia la contraseña generada (formato: `xxxx xxxx xxxx xxxx`)

### 2. Configurar la Aplicación

1. Abre la aplicación en tu navegador
2. Haz clic en el botón **Configuración**
3. Completa los campos:
   - **URL de la API**: La URL base de tu WordPress (ej: `https://tusitio.com/wp-json/wp/v2/`)
   - **Usuario**: Tu nombre de usuario de WordPress
   - **Contraseña de Aplicación**: La contraseña generada en el paso anterior
4. Haz clic en **Guardar**

La configuración se guardará de forma segura en el localStorage de tu navegador.

## Uso

### Ver Posts

Los posts se cargan automáticamente en la página principal mostrando:
- Título del post
- Fecha de publicación
- Extracto del contenido
- Estado (Publicado/Borrador)

### Crear Nuevo Post

1. Haz clic en el botón **Nuevo Post**
2. Completa el formulario:
   - **Título**: Nombre del post
   - **Contenido**: Usa el editor WYSIWYG para formatear texto, agregar listas, enlaces e imágenes
   - **Categorías**: Selecciona una o más categorías existentes con los checkboxes
   - **Etiquetas**: Escribe etiquetas separadas por comas (aparecerán como preview mientras escribes)
   - **Estado**: Elige entre Borrador o Publicado
3. Haz clic en **Guardar**

#### Editor de Contenido

El editor WYSIWYG incluye las siguientes funciones:
- Formateo de texto (negrita, cursiva, subrayado)
- Alineación de párrafos
- Listas ordenadas y desordenadas
- Insertar enlaces e imágenes
- Ver código HTML
- Deshacer/Rehacer cambios

#### Categorías y Etiquetas

- **Categorías**: Selecciona múltiples categorías existentes en tu sitio WordPress
- **Etiquetas**: Crea etiquetas nuevas escribiendo nombres separados por comas. Las etiquetas se crearán automáticamente si no existen

### Editar Post

1. Haz clic en el botón **Editar** del post que deseas modificar
2. Modifica los campos necesarios
3. Haz clic en **Guardar**

### Ver Post

Haz clic en el botón **Ver** para abrir el post en una nueva pestaña de tu sitio WordPress.

### Eliminar Post

1. Haz clic en el botón **Borrar**
2. Confirma la eliminación en el diálogo
3. El post será eliminado permanentemente

### Cambiar Tema

Haz clic en el icono de sol/luna en la esquina superior derecha para alternar entre tema claro y oscuro.

## Tecnologías

- HTML5
- JavaScript (ES6+)
- Tailwind CSS (compilado)
- PostCSS
- TinyMCE 6 (Editor WYSIWYG)
- WordPress REST API
- LocalStorage API

## Archivos del Proyecto

- `index.html` - Estructura HTML de la aplicación
- `app.js` - Lógica de la aplicación
- `api-wordpress.js` - Cliente de la API REST de WordPress
- `package.json` - Configuración del proyecto

## API de WordPress

Esta aplicación utiliza la clase `WordPressAPIClient` que implementa las operaciones CRUD:

### Métodos Principales

| Método | Operación | Descripción |
|--------|-----------|-------------|
| `get(resource, id, params)` | READ | Obtiene uno o varios recursos |
| `create(resource, data)` | CREATE | Crea un nuevo recurso |
| `update(resource, id, data)` | UPDATE | Actualiza un recurso existente |
| `delete(resource, id, force)` | DELETE | Elimina un recurso |

## Seguridad

- Las credenciales se almacenan localmente en el navegador
- Se utiliza autenticación Basic Auth con Application Passwords
- Los Application Passwords son más seguros que las contraseñas de usuario
- Las credenciales nunca se envían a servidores externos

## Inicio Rápido

```bash
npm install
npm start
```

La aplicación se abrirá automáticamente en tu navegador predeterminado.

### Comandos Disponibles

- `npm start` - Inicia el servidor de desarrollo con compilación automática de Tailwind
- `npm run build` - Compila Tailwind CSS una sola vez
- `npm run build:watch` - Compila Tailwind CSS en modo vigilancia (watch)
