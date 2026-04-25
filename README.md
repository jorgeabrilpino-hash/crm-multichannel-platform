# CRM Multicanal - Fase 1

Plataforma CRM tipo Kommo/Whaticket con integración oficial de WhatsApp Business API.

## 🚀 Stack Tecnológico

- **Backend**: NestJS + TypeScript + Prisma
- **Frontend**: React + TypeScript + Vite
- **Base de Datos**: PostgreSQL 15
- **Cache**: Redis
- **Infraestructura**: Docker + Docker Compose

## 📋 Requisitos

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (o usar Docker)

## 🛠️ Instalación

### 1. Clonar y configurar

```bash
# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
```

### 2. Desarrollo local

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

### 3. Docker (recomendado)

```bash
docker-compose up -d
```

## 📁 Estructura del Proyecto

```
├── backend/               # API NestJS
│   ├── src/modules/       # Módulos funcionales
│   │   ├── auth/          # Autenticación JWT
│   │   ├── users/         # Gestión de usuarios
│   │   ├── contacts/      # Contactos (CORE)
│   │   ├── conversations/ # Conversaciones
│   │   ├── channels/      # Canales
│   │   ├── whatsapp/      # WhatsApp API
│   │   ├── events/        # Sistema de eventos
│   │   └── automation/    # Automatización (Fase 2)
│   └── prisma/            # Schema de BD
├── frontend/              # React SPA
│   └── src/
│       ├── pages/         # Páginas principales
│       ├── components/    # Componentes
│       └── store/         # Estado (Zustand)
└── docker-compose.yml     # Orquestación
```

## 🔐 Autenticación

```bash
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

## 📡 API Endpoints

| Módulo | Endpoints |
|--------|-----------|
| Contacts | `/api/v1/contacts`, `/api/v1/contacts/:id/360` |
| Conversations | `/api/v1/conversations`, `/api/v1/conversations/:id/messages` |
| Channels | `/api/v1/channels/accounts` |
| WhatsApp | `/api/v1/whatsapp/webhook`, `/api/v1/whatsapp/send` |

## 📱 WhatsApp Business API

### Configurar Webhook en Meta

1. URL: `https://tu-dominio.com/api/v1/whatsapp/webhook`
2. Token: Valor de `WHATSAPP_VERIFY_TOKEN` en .env
3. Suscribirse a: `messages`, `message_deliveries`

## 🐳 Despliegue en Proxmox

```bash
# Crear VM con Docker instalado
# Clonar repositorio
git clone <repo> /opt/crm

# Configurar y desplegar
cp .env.example .env
nano .env  # Configurar variables
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy
```

## 📈 Preparación para Fase 2

- ✅ Endpoints `/automation/*` y `/ai/*` listos
- ✅ Sistema de eventos para webhooks n8n
- ✅ Tabla `ai_events` para tracking
- ✅ Arquitectura desacoplada

## 📄 Licencia

Propietario - Uso interno
