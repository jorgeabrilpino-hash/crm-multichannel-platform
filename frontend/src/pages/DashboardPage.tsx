import { useState } from 'react';
import { MessageSquare, Users, CheckCircle, Clock, TrendingUp, Activity, ArrowUp, ArrowDown, Eye, Calendar } from 'lucide-react';
import './DashboardPage.css';

const stats = [
    { label: 'Conversaciones Abiertas', value: '24', icon: MessageSquare, color: 'primary', trend: '+12%', trendUp: true },
    { label: 'Contactos Totales', value: '1,284', icon: Users, color: 'info', trend: '+8%', trendUp: true },
    { label: 'Resueltas Hoy', value: '18', icon: CheckCircle, color: 'success', trend: '+25%', trendUp: true },
    { label: 'Tiempo Promedio', value: '4.2m', icon: Clock, color: 'warning', trend: '-15%', trendUp: false },
];

const recentConversations = [
    { id: '1', name: 'María García', message: 'Hola, necesito información sobre...', time: '2m', timestamp: '10:45 AM', status: 'open', unread: 3 },
    { id: '2', name: 'Carlos López', message: '¿Cuándo llegará mi pedido?', time: '15m', timestamp: '10:30 AM', status: 'open', unread: 1 },
    { id: '3', name: 'Ana Martínez', message: 'Gracias por la ayuda!', time: '1h', timestamp: '9:45 AM', status: 'closed', unread: 0 },
    { id: '4', name: 'Pedro Sánchez', message: 'Me interesa el plan premium', time: '2h', timestamp: '8:30 AM', status: 'follow_up', unread: 0 },
    { id: '5', name: 'Laura Díaz', message: '¿Tienen servicio técnico?', time: '3h', timestamp: '7:15 AM', status: 'open', unread: 2 },
];

const weeklyData = [
    { day: 'Lun', conversations: 45, resolved: 42 },
    { day: 'Mar', conversations: 52, resolved: 48 },
    { day: 'Mié', conversations: 38, resolved: 35 },
    { day: 'Jue', conversations: 65, resolved: 60 },
    { day: 'Vie', conversations: 48, resolved: 45 },
    { day: 'Sáb', conversations: 25, resolved: 24 },
    { day: 'Dom', conversations: 18, resolved: 17 },
];

const topAgents = [
    { name: 'Juan Pérez', conversations: 45, satisfaction: 98 },
    { name: 'María López', conversations: 38, satisfaction: 96 },
    { name: 'Carlos Ruiz', conversations: 32, satisfaction: 94 },
];

function DashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const maxConversations = Math.max(...weeklyData.map(d => d.conversations));

    const handleViewConversation = (id: string) => {
        console.log('Ver conversación:', id);
        // Navigate to conversation
    };

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Resumen de actividad en tiempo real</p>
                </div>
                <div className="header-actions">
                    <div className="period-selector">
                        <button
                            className={`period-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('today')}
                        >
                            Hoy
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('week')}
                        >
                            Semana
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('month')}
                        >
                            Mes
                        </button>
                    </div>
                    <button className="btn btn-secondary">
                        <Calendar size={18} />
                        Personalizado
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={`stat-card stat-${stat.color}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="stat-header">
                            <div className="stat-icon">
                                <stat.icon size={24} />
                            </div>
                            <span className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                                {stat.trendUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                {stat.trend}
                            </span>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-progress">
                            <div className="stat-progress-bar" style={{ width: `${70 + index * 8}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card chart-card">
                    <div className="card-header">
                        <h2>Actividad Semanal</h2>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="dot primary"></span> Recibidas</span>
                            <span className="legend-item"><span className="dot success"></span> Resueltas</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        {weeklyData.map((data, index) => (
                            <div key={data.day} className="chart-bar-group" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="chart-bars">
                                    <div
                                        className="chart-bar primary"
                                        style={{ height: `${(data.conversations / maxConversations) * 100}%` }}
                                        title={`${data.conversations} recibidas`}
                                    >
                                        <span className="bar-value">{data.conversations}</span>
                                    </div>
                                    <div
                                        className="chart-bar success"
                                        style={{ height: `${(data.resolved / maxConversations) * 100}%` }}
                                        title={`${data.resolved} resueltas`}
                                    >
                                        <span className="bar-value">{data.resolved}</span>
                                    </div>
                                </div>
                                <span className="chart-label">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card performance-card">
                    <div className="card-header">
                        <h2>Rendimiento</h2>
                        <Activity size={20} className="text-tertiary" />
                    </div>
                    <div className="performance-content">
                        <div className="performance-item">
                            <div className="performance-label">
                                <span>Tasa de resolución</span>
                                <span className="text-accent">92%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animated" style={{ '--target-width': '92%' } as React.CSSProperties}></div>
                            </div>
                        </div>
                        <div className="performance-item">
                            <div className="performance-label">
                                <span>Satisfacción del cliente</span>
                                <span className="text-accent">88%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animated" style={{ '--target-width': '88%' } as React.CSSProperties}></div>
                            </div>
                        </div>
                        <div className="performance-item">
                            <div className="performance-label">
                                <span>SLA cumplido</span>
                                <span className="text-accent">95%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animated" style={{ '--target-width': '95%' } as React.CSSProperties}></div>
                            </div>
                        </div>
                        <div className="performance-item">
                            <div className="performance-label">
                                <span>Primera respuesta &lt; 5min</span>
                                <span className="text-accent">78%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill animated warning" style={{ '--target-width': '78%' } as React.CSSProperties}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card recent-conversations">
                    <div className="card-header">
                        <h2>Conversaciones Recientes</h2>
                        <button className="btn btn-ghost">Ver todas</button>
                    </div>
                    <div className="conversation-list">
                        {recentConversations.map((conv, i) => (
                            <div
                                key={conv.id}
                                className="conversation-item"
                                style={{ animationDelay: `${i * 0.05}s` }}
                                onClick={() => handleViewConversation(conv.id)}
                            >
                                <div className="avatar">{conv.name.split(' ').map(n => n[0]).join('')}</div>
                                <div className="conversation-content">
                                    <div className="conversation-header">
                                        <span className="conversation-name">{conv.name}</span>
                                        <span className="conversation-time" title={conv.timestamp}>{conv.time}</span>
                                    </div>
                                    <p className="conversation-message truncate">{conv.message}</p>
                                </div>
                                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                                <span className={`badge badge-${conv.status === 'open' ? 'primary' : conv.status === 'closed' ? 'success' : 'warning'}`}>
                                    {conv.status === 'open' ? 'Abierta' : conv.status === 'closed' ? 'Cerrada' : 'Seguimiento'}
                                </span>
                                <button className="btn btn-ghost view-btn" onClick={(e) => { e.stopPropagation(); handleViewConversation(conv.id); }}>
                                    <Eye size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card agents-card">
                    <div className="card-header">
                        <h2>Top Agentes</h2>
                        <TrendingUp size={20} className="text-tertiary" />
                    </div>
                    <div className="agents-list">
                        {topAgents.map((agent, i) => (
                            <div key={agent.name} className="agent-item" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="agent-rank">{i + 1}</div>
                                <div className="avatar avatar-sm">{agent.name.split(' ').map(n => n[0]).join('')}</div>
                                <div className="agent-info">
                                    <span className="agent-name">{agent.name}</span>
                                    <span className="agent-stats">{agent.conversations} conv. · {agent.satisfaction}% sat.</span>
                                </div>
                                <div className="agent-badge">
                                    {i === 0 && '🥇'}
                                    {i === 1 && '🥈'}
                                    {i === 2 && '🥉'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
