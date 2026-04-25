# Guía de Despliegue en Proxmox

## 1. Preparar VM

```bash
# Crear VM Ubuntu 22.04 o Debian 12
# RAM: 4GB mínimo
# Disco: 20GB mínimo
# Red: Acceso a internet

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
```

## 2. Clonar Proyecto

```bash
cd /opt
git clone <tu-repositorio> crm
cd crm
```

## 3. Configurar Variables

```bash
cp .env.example .env
nano .env
```

Variables críticas:
- `DATABASE_URL`: PostgreSQL
- `JWT_SECRET`: Secreto único
- `WHATSAPP_*`: Credenciales Meta

## 4. Desplegar

```bash
# Construir e iniciar
docker-compose up -d --build

# Verificar servicios
docker-compose ps

# Ver logs
docker-compose logs -f
```

## 5. Migraciones

```bash
docker-compose exec backend npx prisma migrate deploy
```

## 6. Configurar Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name crm.tudominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## 7. SSL con Certbot

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d crm.tudominio.com
```

## 8. Verificar

- Frontend: https://crm.tudominio.com
- API: https://crm.tudominio.com/api/docs
- Webhook: https://crm.tudominio.com/api/v1/whatsapp/webhook

## Mantenimiento

```bash
# Actualizar
cd /opt/crm && git pull
docker-compose up -d --build

# Backup BD
docker-compose exec postgres pg_dump -U crm_user crm_multicanal > backup.sql

# Logs
docker-compose logs -f backend
```
