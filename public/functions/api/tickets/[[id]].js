// Este archivo se ubicaría en tu proyecto de Cloudflare Pages en:
// /functions/api/tickets/[[id]].js
//
// Cloudflare Pages Functions enrutará:
// - POST /api/tickets a esta función con `id` como undefined.
// - GET /api/tickets a esta función con `id` como undefined (para listar todos).
// - GET, PUT /api/tickets/{id} a esta función con `id` como el ID del ticket.

// Importa los tipos de Request y Env para mejor tipado (opcional, pero buena práctica)
/**
 * @typedef {Object} Env
 * @property {KVNamespace} TICKETS - Tu KV Namespace para almacenar tickets.
 */

/**
 * Maneja las solicitudes HTTP para la API de tickets.
 * @param {Request} request - La solicitud HTTP entrante.
 * @param {Env} env - El objeto de entorno que contiene las variables de Cloudflare (como KV Namespaces).
 * @param {ExecutionContext} ctx - El contexto de ejecución (no usado directamente aquí, pero útil para waitUntil).
 * @returns {Response} La respuesta HTTP.
 */
export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const method = request.method;

    // Accede al KV Namespace definido en tu entorno de Cloudflare Pages
    // Asegúrate de que tienes un binding KV llamado 'TICKETS' configurado en tu proyecto de Pages.
    const TICKETS = env.TICKETS;

    // El parámetro 'id' se capturará de la URL si existe (ej. /api/tickets/123)
    // En Cloudflare Pages Functions, [[id]] significa que 'id' puede ser opcional.
    const ticketIdFromPath = params.id ? params.id[0] : null;

    // --- Manejo de solicitudes POST para crear un nuevo ticket ---
    if (method === 'POST' && url.pathname === '/api/tickets') {
        try {
            const data = await request.json();
            // Validar datos mínimos
            if (!data.subject || !data.description) {
                return new Response(JSON.stringify({ error: 'Asunto y descripción son requeridos.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Generar un ID único para el ticket
            const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            const newTicket = {
                id: ticketId,
                subject: data.subject,
                description: data.description,
                status: 'Abierto', // Estado inicial del ticket
                comments: [], // Array para almacenar comentarios
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            };

            // Almacenar el ticket en KV
            await TICKETS.put(ticketId, JSON.stringify(newTicket));

            return new Response(JSON.stringify(newTicket), {
                status: 201, // 201 Created
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            console.error('Error al crear ticket:', e);
            return new Response(JSON.stringify({ error: 'Error interno del servidor al crear el ticket.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // --- NUEVO: Manejo de solicitudes GET para obtener TODOS los tickets ---
    // Esto se activará cuando la ruta sea exactamente /api/tickets y el método sea GET
    if (method === 'GET' && url.pathname === '/api/tickets') {
        try {
            const { keys } = await TICKETS.list(); // Obtiene solo las claves de KV

            const allTickets = [];
            for (const keyInfo of keys) {
                const ticketId = keyInfo.name;
                const ticketData = await TICKETS.get(ticketId);
                if (ticketData) {
                    allTickets.push(JSON.parse(ticketData));
                }
            }
            // Ordenar tickets por fecha de creación (más recientes primero)
            allTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return new Response(JSON.stringify(allTickets), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            console.error('Error al listar tickets:', e);
            return new Response(JSON.stringify({ error: 'Error interno del servidor al listar tickets.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }


    // --- Manejo de solicitudes GET para obtener un ticket por ID ---
    // Esto se activará cuando la ruta sea /api/tickets/{id} y el método sea GET
    if (method === 'GET' && ticketIdFromPath) {
        try {
            const ticket = await TICKETS.get(ticketIdFromPath);
            if (ticket) {
                return new Response(ticket, {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ error: 'Ticket no encontrado.' }), {
                    status: 404, // Not Found
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (e) {
            console.error('Error al obtener ticket:', e);
            return new Response(JSON.stringify({ error: 'Error interno del servidor al obtener el ticket.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // --- Manejo de solicitudes PUT para actualizar un ticket o añadir un comentario ---
    if (method === 'PUT' && ticketIdFromPath) {
        try {
            const existingTicketString = await TICKETS.get(ticketIdFromPath);
            if (!existingTicketString) {
                return new Response(JSON.stringify({ error: 'Ticket no encontrado para actualizar.' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const ticket = JSON.parse(existingTicketString);
            const updateData = await request.json();

            let updated = false;

            // Actualizar estado del ticket (solo si se proporciona y es válido)
            if (updateData.status && ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'].includes(updateData.status)) {
                if (ticket.status !== updateData.status) {
                    ticket.status = updateData.status;
                    updated = true;
                }
            }

            // Añadir un nuevo comentario
            if (updateData.comment && typeof updateData.comment === 'string' && updateData.comment.trim() !== '') {
                const author = updateData.author || 'Agente'; // Puedes implementar autenticación real aquí
                ticket.comments.push({
                    text: updateData.comment.trim(),
                    author: author,
                    timestamp: new Date().toISOString()
                });
                updated = true;
            }

            if (updated) {
                ticket.lastUpdatedAt = new Date().toISOString();
                await TICKETS.put(ticketIdFromPath, JSON.stringify(ticket));
                return new Response(JSON.stringify(ticket), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ message: 'No se realizaron cambios en el ticket.', ticket: ticket }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

        } catch (e) {
            console.error('Error al actualizar ticket:', e);
            return new Response(JSON.stringify({ error: 'Error interno del servidor al actualizar el ticket.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Si ninguna ruta coincide, devuelve 404
    return new Response('Ruta no encontrada', { status: 404 });
}
