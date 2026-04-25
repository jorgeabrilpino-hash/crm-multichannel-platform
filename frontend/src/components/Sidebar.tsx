import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Plug,
    Settings,
    LogOut,
    Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import './Sidebar.css';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/conversations', icon: MessageSquare, label: 'Conversaciones' },
    { to: '/contacts', icon: Users, label: 'Contactos' },
    { to: '/channels', icon: Plug, label: 'Canales' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
];

function Sidebar() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">
                        <Zap size={24} />
                    </div>
                    <span className="logo-text">CRM Pro</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="user-details">
                        <span className="user-name">
                            {user?.firstName} {user?.lastName}
                        </span>
                        <span className="user-role">{user?.roles?.[0] || 'Agent'}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout} title="Cerrar sesión">
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
