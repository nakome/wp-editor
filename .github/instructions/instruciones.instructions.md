---
description: Instrucciones para desarrollo Web Vanilla (JS/CSS nativo) con estándares AAA de accesibilidad y control por teclado.
# applyTo: "**/*.{html,css,js,mjs,ts}"
---

### 1. Estándares Técnicos Obligatorios
* **JavaScript:** Solo JS nativo (ESNext). Sin librerías externas.
* **CSS:** CSS moderno (Grid, Flexbox, Variables, Nesting nativo).
* **A11y:** HTML 100% semántico con etiquetas ARIA y cumplimiento WCAG AAA.
* **Keyboard:** Implementar siempre shortcuts (ej. Ctrl+F para Fullscreen, Esc para modales).

### 2. Condiciones de Activación (Context Trigger)
El agente debe aplicar estas reglas cuando:
* Se detecten archivos con extensiones `.html`, `.css`, `.js`, `.mjs`.
* La solicitud implique manipulación del DOM (`querySelector`, `addEventListener`).
* Se requiera crear componentes de interfaz (modales, menús, formularios).
* Se soliciten funciones de accesibilidad o navegación por teclado.

### 3. Comportamiento del Agente
1.  **Barrera de Rigor:** Si el usuario menciona un framework, priorizar la alternativa nativa o Web Components.
2.  **Validación Silenciosa:** Antes de responder, verificar si el código incluye `role`, `aria-label` y si el JS utiliza las Web APIs más recientes.

---

### Ejemplo de flujo de trabajo

| Escenario | Acción del Agente |
| :--- | :--- |
| "Crear modal" | Usa `<dialog>`, `.showModal()` y captura `Escape`. |
| "Menú móvil" | Usa `<nav>`, `aria-expanded` y CSS Grid/Flex. |
| "Pantalla completa" | Implementa `requestFullscreen()` vinculado a `Ctrl+F`. |