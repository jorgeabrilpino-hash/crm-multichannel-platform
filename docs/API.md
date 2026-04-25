# CRM Multicanal - Documentación de API

Base URL: `/api/v1`

## Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <access_token>
```

### POST /auth/login
Login de usuario.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "...", "roles": ["AGENT"] },
  "accessToken": "eyJ...",
  "refreshToken": "uuid",
  "expiresIn": "15m"
}
```

---

## Contactos

### GET /contacts
Lista contactos con paginación.

**Query params:** `page`, `limit`, `search`, `tagId`

### GET /contacts/:id/360
Vista 360° del contacto con historial completo.

### POST /contacts
Crear contacto.

### POST /contacts/:id/tags
Agregar etiqueta.

### POST /contacts/:id/notes
Agregar nota.

---

## Conversaciones

### GET /conversations
Lista conversaciones.

**Query params:** `page`, `limit`, `status` (OPEN/FOLLOW_UP/CLOSED), `assignedTo`

### GET /conversations/:id/messages
Obtener mensajes de una conversación.

### POST /conversations/:id/messages
Enviar mensaje.
```json
{
  "content": "Hola, ¿en qué puedo ayudarte?",
  "type": "TEXT"
}
```

### PUT /conversations/:id/assign
Asignar agente.

### PUT /conversations/:id/status
Cambiar estado.

---

## Canales

### GET /channels/accounts
Cuentas conectadas de la empresa.

### POST /channels/whatsapp/connect
Conectar número de WhatsApp.
```json
{
  "name": "Soporte",
  "phoneNumber": "+573001234567",
  "phoneNumberId": "123456789",
  "wabaId": "987654321",
  "accessToken": "EAA..."
}
```

---

## WhatsApp

### GET /whatsapp/webhook
Verificación de webhook de Meta.

### POST /whatsapp/webhook
Recepción de eventos de WhatsApp.

### POST /whatsapp/send
Enviar mensaje por WhatsApp.
```json
{
  "channelAccountId": "...",
  "to": "+573001234567",
  "content": "Mensaje",
  "type": "text"
}
```

---

## Eventos (n8n)

### GET /events/pending
Eventos pendientes para procesar.

### PUT /events/:id/processed
Marcar evento como procesado.

---

## Automatización (Fase 2)

### GET /automation/rules
### POST /automation/rules
### PUT /automation/rules/:id
### DELETE /automation/rules/:id

### GET /automation/ai/config
### POST /automation/ai/process
