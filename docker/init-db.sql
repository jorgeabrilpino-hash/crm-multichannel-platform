-- Initialize default roles
INSERT INTO roles (id, name, description) VALUES
  (gen_random_uuid(), 'ADMIN', 'Administrador del sistema con acceso completo'),
  (gen_random_uuid(), 'SUPERVISOR', 'Supervisor con acceso a reportes y gestión de equipos'),
  (gen_random_uuid(), 'AGENT', 'Agente de atención al cliente')
ON CONFLICT (name) DO NOTHING;

-- Initialize default channels
INSERT INTO channels (id, type, name, is_enabled) VALUES
  (gen_random_uuid(), 'WHATSAPP', 'WhatsApp Business', true),
  (gen_random_uuid(), 'FACEBOOK', 'Facebook Messenger', false),
  (gen_random_uuid(), 'INSTAGRAM', 'Instagram Direct', false),
  (gen_random_uuid(), 'WEBCHAT', 'Web Chat', false)
ON CONFLICT (type) DO NOTHING;
