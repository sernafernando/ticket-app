# 🚀 Sistema de Gestión de Tickets (Dark Mode) 🚀

¡Bienvenido al Sistema de Gestión de Tickets, una solución moderna y eficiente para manejar las solicitudes de tus usuarios, construida enteramente sobre la poderosa plataforma de Cloudflare!

Este proyecto te permite ofrecer a tus usuarios una forma sencilla de crear tickets y seguir su estado, mientras tú (el agente) puedes actualizar su progreso y añadir comentarios, todo desde una interfaz elegante con **tema oscuro**.

## ✨ Características Principales

* **Creación de Tickets Intuitiva:** Los usuarios pueden enviar fácilmente nuevos tickets con un asunto y una descripción detallada.

* **Seguimiento de Estado en Tiempo Real:** Los usuarios pueden consultar el estado de sus tickets en cualquier momento utilizando su ID único.

* **Gestión de Agentes Centralizada:** Como agente, tienes una interfaz dedicada para:

    * Ver los detalles completos de cualquier ticket.

    * Actualizar el estado del ticket (Abierto, En Progreso, Resuelto, Cerrado).

    * Añadir comentarios para mantener al usuario informado.

* **Tema Oscuro Elegante:** Una interfaz visualmente atractiva y cómoda para la vista, ideal para largas sesiones de trabajo.

* **Notificaciones No Intrusivas:** Mensajes de éxito/error flotantes, sin interrupciones molestas.

* **100% Serverless:** Construido sobre Cloudflare Workers y Pages para una escalabilidad ilimitada y un rendimiento global.

## 🛠️ Tecnologías Utilizadas

Este sistema aprovecha al máximo el ecosistema de Cloudflare para ofrecer una solución robusta y de bajo costo:

* **Cloudflare Pages:** Para el despliegue del frontend (HTML, CSS, JavaScript).

* **Cloudflare Pages Functions:** Para el backend (Workers), gestionando la lógica de la API de tickets.

* **Cloudflare KV (Key-Value Store):** Como base de datos ultrarrápida y distribuida globalmente para almacenar los tickets y sus comentarios.

* **HTML5:** Estructura de la interfaz de usuario.

* **Tailwind CSS:** Para un diseño responsivo y estilos rápidos y modernos.

* **JavaScript (Vanilla JS):** Para la lógica del frontend y la interacción con la API.

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura "Full-Stack Serverless" con Cloudflare:

1.  **Frontend (Cloudflare Pages):** Un conjunto de archivos HTML, CSS y JavaScript que se sirven directamente desde la CDN global de Cloudflare, garantizando una carga rápida para tus usuarios en cualquier parte del mundo.

2.  **Backend (Cloudflare Pages Functions):** El código del Worker (`[[id]].js`) reside dentro de la carpeta `functions` de tu proyecto de Pages. Cloudflare Pages enruta automáticamente las solicitudes API (ej. `/api/tickets`, `/api/tickets/{id}`) a este Worker.

3.  **Base de Datos (Cloudflare KV):** El Worker interactúa con un KV Namespace dedicado para persistir y recuperar los datos de los tickets de forma eficiente.


+-------------------+       +------------------------+       +-------------------+
|   Usuario/Agente  | <---> |  Cloudflare Pages      | <---> |  Cloudflare KV    |
|   (Navegador)     |       |  (Frontend + Functions)|       |  (Base de Datos)  |
+-------------------+       +------------------------+       +-------------------+
|                               |
|  HTTP Requests/Responses      |  KV Operations


## 🚀 Despliegue Rápido

Sigue estos pasos para tener tu sistema de tickets funcionando en cuestión de minutos:

### 1. Prepara tus Archivos

Asegúrate de que la estructura de tu proyecto sea la siguiente:


tu-proyecto-de-tickets/
├── public/
│   ├── index.html          # Tu frontend (HTML, CSS, JS)
│   └── functions/
│       └── api/
│           └── tickets/
│               └── [[id]].js   # Tu backend (Cloudflare Worker)
└── .gitignore              # Archivo para ignorar directorios y archivos no deseados


### 2. Sube a un Repositorio Git

Crea un nuevo repositorio en GitHub, GitLab o Bitbucket y sube todos estos archivos.

### 3. Crea un KV Namespace en Cloudflare

1.  Accede a tu [Panel de Control de Cloudflare](https://dash.cloudflare.com/).

2.  Ve a **Workers & Pages** > **KV**.

3.  Haz clic en **Create a Namespace** y nómbralo **`TICKETS`**. (¡Este nombre es crucial y debe ser exacto!)

### 4. Crea un Nuevo Proyecto de Pages

1.  En tu Panel de Control de Cloudflare, ve a **Workers & Pages** > **Pages**.

2.  Haz clic en **Create a project**.

3.  Selecciona **Connect to Git** y elige el repositorio donde subiste tu código.

4.  Configura los detalles del build:

    * **Build command:** `(déjalo vacío)`

    * **Build directory:** `public`

    * **Root directory:** `/`

5.  Haz clic en **Save and Deploy**.

### 5. Configura el Binding de KV en Pages

1.  Una vez que tu proyecto de Pages esté creado, ve a la configuración de ese proyecto (en **Workers & Pages** > **Pages** > `[Tu Proyecto]` > **Settings** > **Functions**).

2.  Desplázate hasta la sección **KV Namespace Bindings**.

3.  Haz clic en **Add binding**.

4.  En **Variable name**, escribe **`TICKETS`**.

5.  En **KV Namespace**, selecciona el Namespace **`TICKETS`** que creaste previamente.

6.  Haz clic en **Save**.

¡Listo! Cloudflare Pages desplegará tu aplicación. Una vez que el despliegue esté completo, verás una URL (ej. `https://tu-proyecto.pages.dev`) donde podrás acceder a tu sistema de tickets.

## 💡 Cómo Usar

1.  **Crear un Ticket:**

    * En la sección "Crear Nuevo Ticket", rellena el "Asunto" y la "Descripción".

    * Haz clic en "Enviar Ticket". Recibirás un ID único para tu ticket.

2.  **Consultar Estado (Usuario):**

    * En la sección "Consultar Estado de Ticket", introduce el ID de tu ticket.

    * Haz clic en "Ver Estado". Se mostrarán los detalles del ticket y cualquier comentario.

3.  **Gestión de Agentes (Tú):**

    * Para modificar un ticket, primero consúltalo usando su ID en la sección "Consultar Estado de Ticket".

    * Una vez que los detalles del ticket se carguen, la sección "Gestión de Tickets (Modo Agente)" se habilitará.

    * Desde aquí, puedes:

        * Cambiar el "Estado" del ticket.

        * Añadir un "Comentario" en el campo de texto.

    * Haz clic en "Actualizar Ticket" para guardar los cambios.

## 🚀 Próximos Pasos / Mejoras Potenciales

* **Autenticación y Autorización:** Implementar un sistema de login (ej. Cloudflare Access, OAuth, JWT) para proteger el panel de agente y permitir que solo usuarios autorizados realicen modificaciones.

* **Notificaciones por Email:** Integrar un servicio de envío de emails (ej. Cloudflare Email Routing, SendGrid) para notificar a los usuarios sobre actualizaciones de sus tickets.

* **Listado de Tickets para Agentes:** Una vista donde los agentes puedan ver todos los tickets abiertos/pendientes en lugar de buscar por ID.

* **Filtrado y Búsqueda:** Funcionalidad para buscar tickets por palabras clave, estado, etc.

* **UI/UX Avanzada:** Mejorar la interfaz de usuario con un framework de componentes más robusto o animaciones.

* **Adjuntos:** Permitir a los usuarios adjuntar archivos a sus tickets.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

¡Disfruta construyendo y gestionando tu sistema de tickets serverless! Si tienes alguna pregunta o sugerencia, no dudes en abrir un *issue* en este repositorio.
