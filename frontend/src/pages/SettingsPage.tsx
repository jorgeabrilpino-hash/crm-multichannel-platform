import { useState } from 'react';
import { User, Building, Shield, Bell, Palette, Save, Eye, EyeOff, Check, Moon, Sun, Monitor } from 'lucide-react';
import './SettingsPage.css';

const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'company', label: 'Empresa', icon: Building },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
];

function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [theme, setTheme] = useState('dark');

    // Form states
    const [profile, setProfile] = useState({
        firstName: 'Admin',
        lastName: 'Usuario',
        email: 'admin@empresa.com',
        phone: '+57 300 123 4567',
    });

    const [company, setCompany] = useState({
        name: 'Mi Empresa',
        timezone: 'America/Bogota',
        language: 'es',
    });

    const [notifications, setNotifications] = useState({
        newMessage: true,
        newConversation: true,
        assignedToMe: true,
        mentions: true,
        emailDigest: false,
        soundEnabled: true,
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Contraseña actualizada correctamente');
    };

    return (
        <div className="settings-page animate-fade-in">
            <div className="page-header">
                <h1>Configuración</h1>
                <p>Administra las preferencias del sistema</p>
            </div>

            <div className="settings-grid">
                <div className="settings-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="settings-content">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Información del Perfil</h2>
                                <p>Actualiza tu información personal</p>
                            </div>

                            <div className="avatar-upload">
                                <div className="avatar avatar-xl">AU</div>
                                <div className="avatar-info">
                                    <button className="btn btn-secondary">Cambiar foto</button>
                                    <span>JPG, PNG. Max 2MB</span>
                                </div>
                            </div>

                            <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Correo electrónico</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar cambios</>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Company Tab */}
                    {activeTab === 'company' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Configuración de Empresa</h2>
                                <p>Administra los datos de tu empresa</p>
                            </div>

                            <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                <div className="form-group">
                                    <label>Nombre de la empresa</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={company.name}
                                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Zona horaria</label>
                                    <select
                                        className="input"
                                        value={company.timezone}
                                        onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                                    >
                                        <option value="America/Bogota">América/Bogotá (GMT-5)</option>
                                        <option value="America/Mexico_City">América/Ciudad de México (GMT-6)</option>
                                        <option value="America/Lima">América/Lima (GMT-5)</option>
                                        <option value="America/Buenos_Aires">América/Buenos Aires (GMT-3)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Idioma predeterminado</label>
                                    <select
                                        className="input"
                                        value={company.language}
                                        onChange={(e) => setCompany({ ...company, language: e.target.value })}
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                        <option value="pt">Português</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar cambios</>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Seguridad</h2>
                                <p>Gestiona tu contraseña y configuración de seguridad</p>
                            </div>

                            <form className="settings-form" onSubmit={handlePasswordChange}>
                                <div className="form-group">
                                    <label>Contraseña actual</label>
                                    <div className="input-with-icon">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="input"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Nueva contraseña</label>
                                    <div className="input-with-icon">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className="input"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <span className="input-hint">Mínimo 8 caracteres, incluye mayúsculas y números</span>
                                </div>

                                <div className="form-group">
                                    <label>Confirmar nueva contraseña</label>
                                    <input type="password" className="input" placeholder="••••••••" />
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    <Shield size={16} /> Actualizar contraseña
                                </button>
                            </form>

                            <div className="security-info">
                                <h3>Sesiones activas</h3>
                                <div className="session-item">
                                    <div className="session-info">
                                        <span className="session-device">Windows · Chrome</span>
                                        <span className="session-location">Bogotá, Colombia · Hace 2 min</span>
                                    </div>
                                    <span className="badge badge-success">Actual</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Notificaciones</h2>
                                <p>Configura cómo y cuándo recibes notificaciones</p>
                            </div>

                            <div className="notification-options">
                                <div className="notification-item">
                                    <div className="notification-info">
                                        <span className="notification-label">Nuevos mensajes</span>
                                        <span className="notification-desc">Recibir notificación cuando llegue un nuevo mensaje</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications.newMessage}
                                            onChange={(e) => setNotifications({ ...notifications, newMessage: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="notification-item">
                                    <div className="notification-info">
                                        <span className="notification-label">Nuevas conversaciones</span>
                                        <span className="notification-desc">Notificar cuando inicie una nueva conversación</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications.newConversation}
                                            onChange={(e) => setNotifications({ ...notifications, newConversation: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="notification-item">
                                    <div className="notification-info">
                                        <span className="notification-label">Asignaciones</span>
                                        <span className="notification-desc">Cuando me asignen una conversación</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications.assignedToMe}
                                            onChange={(e) => setNotifications({ ...notifications, assignedToMe: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="notification-item">
                                    <div className="notification-info">
                                        <span className="notification-label">Sonidos</span>
                                        <span className="notification-desc">Reproducir sonido con las notificaciones</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications.soundEnabled}
                                            onChange={(e) => setNotifications({ ...notifications, soundEnabled: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="notification-item">
                                    <div className="notification-info">
                                        <span className="notification-label">Resumen por email</span>
                                        <span className="notification-desc">Recibir resumen diario de actividad</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailDigest}
                                            onChange={(e) => setNotifications({ ...notifications, emailDigest: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={handleSave}>
                                {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar preferencias</>}
                            </button>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Apariencia</h2>
                                <p>Personaliza la apariencia de la aplicación</p>
                            </div>

                            <div className="theme-options">
                                <h3>Tema</h3>
                                <div className="theme-cards">
                                    <button
                                        className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun size={24} />
                                        <span>Claro</span>
                                    </button>
                                    <button
                                        className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon size={24} />
                                        <span>Oscuro</span>
                                    </button>
                                    <button
                                        className={`theme-card ${theme === 'system' ? 'active' : ''}`}
                                        onClick={() => setTheme('system')}
                                    >
                                        <Monitor size={24} />
                                        <span>Sistema</span>
                                    </button>
                                </div>
                            </div>

                            <div className="accent-options">
                                <h3>Color de acento</h3>
                                <div className="color-options">
                                    <button className="color-btn active" style={{ background: '#6366f1' }} title="Índigo"></button>
                                    <button className="color-btn" style={{ background: '#8b5cf6' }} title="Violeta"></button>
                                    <button className="color-btn" style={{ background: '#06b6d4' }} title="Cian"></button>
                                    <button className="color-btn" style={{ background: '#10b981' }} title="Esmeralda"></button>
                                    <button className="color-btn" style={{ background: '#f59e0b' }} title="Ámbar"></button>
                                    <button className="color-btn" style={{ background: '#ef4444' }} title="Rojo"></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
