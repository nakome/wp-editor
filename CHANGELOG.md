# Changelog

Este proyecto sigue un formato inspirado en Keep a Changelog.

## [Unreleased]

### Changed

- Se actualizó la documentación para reflejar el estado real de la aplicación.
- Se documentó el flujo de trabajo de posts, categorías, etiquetas, preview y paginación.

## [0.1.0] - 2026-03-23

### Added

- Gestión de posts de WordPress desde una interfaz web en JavaScript nativo.
- Editor de contenido con TinyMCE.
- Configuración de conexión mediante URL, usuario y Application Password.
- Persistencia de configuración y tema en `localStorage`.
- Listado de posts con estados, extractos y metadatos.
- Paginación de resultados basada en cabeceras `X-WP-Total` y `X-WP-TotalPages`.
- Carga y selección de categorías desde la REST API.
- Búsqueda remota de etiquetas y creación automática de etiquetas inexistentes.
- Modal de preview para inspeccionar posts sin salir del listado.
- Skeleton loaders, barra de progreso y toasts de feedback.
- Tema claro/oscuro.

### Changed

- Se ajustó el menú de acciones de las cards para anclar mejor el dropdown a la derecha.

### Notes

- El alcance actual del proyecto está centrado en posts, no en páginas ni medios.