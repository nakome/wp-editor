/**
 * @class WordPressAPIClient
 * @description Cliente para interactuar con la API REST de WordPress.
 * Requiere autenticación por Basic Auth o mediante un plugin como Application Passwords.
 */
class WordPressAPIClient {
  /**
   * @param {string} baseURL - La URL base de la API de WordPress (ej: 'https://tusitio.com/wp-json/wp/v2/').
   * @param {string} [token] - Token de autenticación (ej: para Basic Auth, 'usuario:contraseña' codificado en Base64).
   * @param {string} [applicationPassword] - Contraseña de aplicación si se usa ese método.
   * @param {string} [username] - Nombre de usuario si se usa Basic Auth o Application Password.
   */
  constructor(
    baseURL,
    token = null,
    username = null,
    applicationPassword = null
  ) {
    if (!baseURL || !baseURL.startsWith('http')) {
      throw new Error('La URL base es requerida y debe ser válida.');
    }

    // Asegura que la URL base termine con un '/'
    this.baseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
    this.username = username;
    this.applicationPassword = applicationPassword;
    this.token = token; // Puede ser un token codificado en Base64 para Basic Auth

    // Configura los encabezados (Headers)
    this.headers = {
      'Content-Type': 'application/json',
    };

    // Autenticación: Prioriza Application Password, luego Basic Auth usando el token.
    if (this.username && this.applicationPassword) {
      // Usa Application Passwords (forma recomendada para la mayoría de los casos)
      const authString = `${this.username}:${this.applicationPassword}`;
      const encodedAuth = btoa(authString);
      this.headers['Authorization'] = `Basic ${encodedAuth}`;
    } else if (this.token) {
      // Asume que el token ya es la cadena codificada en Base64 para Basic Auth
      this.headers['Authorization'] = `Basic ${this.token}`;
    }

    // Si no hay autenticación, solo se podrán realizar peticiones públicas (GET)
  }

  /**
   * @private
   * @description Maneja la ejecución de la solicitud fetch.
   * @param {string} endpoint - El endpoint específico (ej: 'posts', 'pages', 'media').
   * @param {string} method - El método HTTP (GET, POST, PUT, DELETE).
   * @param {Object} [body] - El cuerpo de la solicitud para POST/PUT.
   * @param {Object} [params] - Parámetros de la consulta (query parameters) para GET.
   * @returns {Promise<Object|Array>} La respuesta parseada de la API.
   */
  async _request(endpoint, method = 'GET', body = null, params = null) {
    let url = `${this.baseURL}${endpoint}`;

    // Adjuntar parámetros de consulta si existen (útil para GET/READ)
    if (params) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const config = {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Intenta parsear el cuerpo de la respuesta para obtener detalles del error
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        // Lanza un error con el mensaje de la API o un mensaje por defecto
        throw new Error(
          errorData.message || `API Error: ${response.statusText}`
        );
      }

      // Para DELETE (que puede devolver un 204 No Content o un objeto de la entrada borrada)
      if (response.status === 204) {
        return {
          success: true,
          message: 'Recurso eliminado correctamente (No Content).',
        };
      }

      // Devuelve la respuesta parseada
      return await response.json();
    } catch (error) {
      console.error(`Error en la solicitud ${method} a ${url}:`, error);
      throw error; // Propaga el error para que el código de llamada lo maneje
    }
  }

  // --- MÉTODOS PÚBLICOS DE LA API (CRUD) ---

  /**
   * @public
   * @description Obtiene uno o varios recursos de WordPress (posts, pages, custom_post_type). (READ)
   * @param {string} resource - El endpoint del recurso (ej: 'posts', 'pages', 'users').
   * @param {number} [id] - ID del recurso específico. Si se omite, devuelve una lista.
   * @param {Object} [params] - Parámetros de la consulta para filtrar la lista (ej: { per_page: 5, status: 'publish' }).
   * @returns {Promise<Object|Array>} El objeto de recurso o un array de recursos.
   */
  async get(resource, id = null, params = null) {
    const endpoint = id ? `${resource}/${id}` : resource;
    return this._request(endpoint, 'GET', null, params);
  }

  /**
   * @public
   * @description Obtiene una colección junto con metadatos de paginación de WordPress.
   * @param {string} resource - El endpoint del recurso (ej: 'posts', 'tags').
   * @param {Object} [params] - Parámetros de consulta.
   * @returns {Promise<{data:Array, meta:{total:number,totalPages:number}}>} Datos y metadatos.
   */
  async getWithMeta(resource, params = null) {
    let url = `${this.baseURL}${resource}`;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `API Error: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        data,
        meta: {
          total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
          totalPages: parseInt(
            response.headers.get('X-WP-TotalPages') || '0',
            10
          ),
        },
      };
    } catch (error) {
      console.error(`Error en la solicitud GET con metadatos a ${url}:`, error);
      throw error;
    }
  }

  /**
   * @public
   * @description Crea un nuevo recurso de WordPress. (CREATE)
   * @param {string} resource - El endpoint del recurso (ej: 'posts', 'pages').
   * @param {Object} data - Los datos del nuevo recurso (ej: { title: 'Mi Nuevo Post', content: '...', status: 'publish' }).
   * @returns {Promise<Object>} El objeto del recurso creado.
   */
  async create(resource, data) {
    // En WordPress, la creación es una solicitud POST
    return this._request(resource, 'POST', data);
  }

  /**
   * @public
   * @description Actualiza (sobrescribe) un recurso existente de WordPress. (UPDATE)
   * @param {string} resource - El endpoint del recurso (ej: 'posts', 'pages').
   * @param {number} id - ID del recurso a actualizar.
   * @param {Object} data - Los datos a actualizar. Solo se necesitan las propiedades a cambiar.
   * @returns {Promise<Object>} El objeto del recurso actualizado.
   */
  async update(resource, id, data) {
    const endpoint = `${resource}/${id}`;
    // En WordPress, la actualización utiliza el método POST o PUT (POST es más común y compatible)
    return this._request(endpoint, 'POST', data);
    // Nota: También se puede usar 'PUT', pero 'POST' a un ID específico funciona para actualizar
  }

  /**
   * @public
   * @description Elimina un recurso de WordPress. (DELETE)
   * @param {string} resource - El endpoint del recurso (ej: 'posts', 'pages').
   * @param {number} id - ID del recurso a eliminar.
   * @param {boolean} [force=false] - Si es 'true', elimina permanentemente. Si es 'false' (por defecto), lo mueve a la papelera.
   * @returns {Promise<Object>} El objeto del recurso eliminado o un mensaje de éxito.
   */
  async delete(resource, id, force = false) {
    const endpoint = `${resource}/${id}`;
    const params = { force: force };
    return this._request(endpoint, 'DELETE', null, params);
  }

  // --- MÉTODOS CONVENIENTES (EJEMPLO) ---

  /**
   * @public
   * @description Ejemplo de función para crear un nuevo post.
   * @param {string} title - Título del post.
   * @param {string} content - Contenido del post.
   * @param {string} [status='draft'] - Estado (ej: 'publish', 'draft').
   * @returns {Promise<Object>} El objeto del post creado.
   */
  async createPost(title, content, status = 'draft') {
    const data = {
      title: title,
      content: content,
      status: status,
    };
    return this.create('posts', data);
  }
}
