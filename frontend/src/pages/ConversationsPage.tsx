import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Send, Paperclip, MoreVertical, Phone, User, Image, Smile, CheckCheck, Clock, X, FileText, Mic, Video } from 'lucide-react';
import './ConversationsPage.css';

// Mock data - será reemplazado con datos reales de WhatsApp
const mockConversations = [
    {
        id: '1',
        name: 'María García',
        phone: '+57 300 123 4567',
        lastMessage: 'Hola, necesito información sobre el servicio de internet',
        time: '2m',
        unread: 3,
        status: 'open',
        channel: 'whatsapp',
        isOnline: true,
        isTyping: false
    },
    {
        id: '2',
        name: 'Carlos López',
        phone: '+57 310 987 6543',
        lastMessage: '¿Cuándo llegará el técnico?',
        time: '15m',
        unread: 1,
        status: 'open',
        channel: 'whatsapp',
        isOnline: true,
        isTyping: true
    },
    {
        id: '3',
        name: 'Ana Martínez',
        phone: '+57 320 456 7890',
        lastMessage: 'Gracias por la ayuda',
        time: '1h',
        unread: 0,
        status: 'closed',
        channel: 'whatsapp',
        isOnline: false,
        isTyping: false
    },
    {
        id: '4',
        name: 'Pedro Sánchez',
        phone: '+57 315 111 2222',
        lastMessage: 'Me interesa el plan premium',
        time: '2h',
        unread: 0,
        status: 'follow_up',
        channel: 'whatsapp',
        isOnline: false,
        isTyping: false
    },
    {
        id: '5',
        name: 'Laura Díaz',
        phone: '+57 312 333 4444',
        lastMessage: '¿Tienen servicio en mi zona?',
        time: '3h',
        unread: 2,
        status: 'open',
        channel: 'whatsapp',
        isOnline: true,
        isTyping: false
    },
];

const mockMessages: Record<string, Array<{
    id: string;
    direction: 'inbound' | 'outbound';
    content: string;
    time: string;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'document';
}>> = {
    '1': [
        { id: '1', direction: 'inbound', content: 'Hola, buenos días! Necesito información sobre el servicio de internet', time: '10:30 AM', status: 'read', type: 'text' },
        { id: '2', direction: 'outbound', content: 'Buenos días María! Con gusto te ayudo. ¿En qué zona te encuentras?', time: '10:31 AM', status: 'read', type: 'text' },
        { id: '3', direction: 'inbound', content: 'Estoy en el norte de la ciudad, barrio Los Pinos', time: '10:32 AM', status: 'read', type: 'text' },
        { id: '4', direction: 'outbound', content: 'Perfecto, tenemos cobertura en esa zona. ¿Qué velocidad necesitas?', time: '10:33 AM', status: 'read', type: 'text' },
        { id: '5', direction: 'inbound', content: 'Necesito mínimo 100 Mbps para trabajar desde casa', time: '10:35 AM', status: 'read', type: 'text' },
        { id: '6', direction: 'outbound', content: 'Excelente! Tenemos el plan Hogar Premium de 150 Mbps a $89.000/mes. Incluye instalación gratis y router WiFi 6.', time: '10:36 AM', status: 'delivered', type: 'text' },
    ],
    '2': [
        { id: '1', direction: 'inbound', content: 'Buenos días, tengo una cita agendada para hoy', time: '9:15 AM', status: 'read', type: 'text' },
        { id: '2', direction: 'outbound', content: 'Buenos días Carlos! Déjame verificar tu agenda. ¿Cuál es tu número de orden?', time: '9:16 AM', status: 'read', type: 'text' },
        { id: '3', direction: 'inbound', content: 'Es el #12345', time: '9:17 AM', status: 'read', type: 'text' },
        { id: '4', direction: 'outbound', content: 'Perfecto, veo tu cita. El técnico llegará entre 2-4pm.', time: '9:18 AM', status: 'read', type: 'text' },
        { id: '5', direction: 'inbound', content: '¿Cuándo llegará el técnico?', time: '2:30 PM', status: 'read', type: 'text' },
    ],
    '3': [
        { id: '1', direction: 'inbound', content: 'Hola, mi internet no funciona', time: '8:00 AM', status: 'read', type: 'text' },
        { id: '2', direction: 'outbound', content: 'Hola Ana, lamento escuchar eso. ¿Puedes reiniciar el router?', time: '8:02 AM', status: 'read', type: 'text' },
        { id: '3', direction: 'inbound', content: 'Ya lo hice y funcionó! Gracias', time: '8:10 AM', status: 'read', type: 'text' },
        { id: '4', direction: 'outbound', content: 'Excelente! Me alegra que se haya resuelto. ¿Algo más en que pueda ayudarte?', time: '8:11 AM', status: 'read', type: 'text' },
        { id: '5', direction: 'inbound', content: 'Gracias por la ayuda', time: '8:12 AM', status: 'read', type: 'text' },
    ],
};

const quickTemplates = [
    { id: '1', name: 'Saludo', content: '👋 ¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?' },
    { id: '2', name: 'Despedida', content: '¡Gracias por contactarnos! Si tienes más preguntas, no dudes en escribirnos. ¡Que tengas un excelente día! 😊' },
    { id: '3', name: 'En espera', content: 'Un momento por favor, estoy verificando la información...' },
    { id: '4', name: 'Horarios', content: 'Nuestro horario de atención es de Lunes a Viernes de 8am a 6pm y Sábados de 8am a 1pm.' },
];

function ConversationsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [conversations, setConversations] = useState(mockConversations);
    const [selectedConv, setSelectedConv] = useState(conversations[0]);
    const [messages, setMessages] = useState(mockMessages[selectedConv.id] || []);
    const [messageText, setMessageText] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handle incoming new conversation from navigation
    useEffect(() => {
        const state = location.state as { newConversation?: { name: string; phone: string } } | null;
        if (state?.newConversation) {
            const { name, phone } = state.newConversation;

            // Check if conversation with this phone already exists
            const existing = conversations.find(c => c.phone === phone);
            if (existing) {
                setSelectedConv(existing);
            } else {
                // Create new conversation
                const newConv = {
                    id: Date.now().toString(),
                    name,
                    phone,
                    lastMessage: 'Nueva conversación',
                    time: 'Ahora',
                    unread: 0,
                    status: 'open',
                    channel: 'whatsapp',
                    isOnline: false,
                    isTyping: false
                };
                setConversations(prev => [newConv, ...prev]);
                setSelectedConv(newConv);
                setMessages([]);
            }

            // Clear the navigation state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    const filteredConversations = conversations.filter(c => {
        const matchesFilter = filter === 'all' || c.status === filter;
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm) ||
            c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setMessages(mockMessages[selectedConv.id] || []);
    }, [selectedConv]);

    // Simular typing indicator
    useEffect(() => {
        if (selectedConv.isTyping) {
            const timer = setTimeout(() => {
                const updatedConvs = conversations.map(c =>
                    c.id === selectedConv.id ? { ...c, isTyping: false } : c
                );
                setConversations(updatedConvs);
                setSelectedConv(prev => ({ ...prev, isTyping: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [selectedConv.isTyping]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            direction: 'outbound' as const,
            content: messageText,
            time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            status: 'sent' as const,
            type: 'text' as const,
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageText('');

        // Simular respuesta automática después de 2-4 segundos
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                const autoResponse = {
                    id: (Date.now() + 1).toString(),
                    direction: 'inbound' as const,
                    content: getAutoResponse(messageText),
                    time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
                    status: 'read' as const,
                    type: 'text' as const,
                };
                setMessages(prev => [...prev, autoResponse]);
            }, 2000);
        }, 1000);
    };

    const getAutoResponse = (msg: string): string => {
        const lower = msg.toLowerCase();
        if (lower.includes('precio') || lower.includes('costo')) {
            return 'Nuestros planes van desde $49.000 hasta $129.000 mensuales. ¿Te gustaría conocer los detalles de cada uno?';
        }
        if (lower.includes('instalación') || lower.includes('instalar')) {
            return 'La instalación es completamente gratis y se realiza en un plazo de 24-48 horas hábiles.';
        }
        if (lower.includes('gracias')) {
            return '¡Con mucho gusto! Estamos para servirte. ¿Hay algo más en lo que pueda ayudarte?';
        }
        return 'Entiendo. Déjame verificar esa información y te respondo en un momento.';
    };

    const handleSelectTemplate = (template: typeof quickTemplates[0]) => {
        setMessageText(template.content);
        setShowTemplates(false);
    };

    const handleCloseConversation = () => {
        const updatedConvs = conversations.map(c =>
            c.id === selectedConv.id ? { ...c, status: 'closed' } : c
        );
        setConversations(updatedConvs);
        setSelectedConv(prev => ({ ...prev, status: 'closed' }));
    };

    const handleReopenConversation = () => {
        const updatedConvs = conversations.map(c =>
            c.id === selectedConv.id ? { ...c, status: 'open' } : c
        );
        setConversations(updatedConvs);
        setSelectedConv(prev => ({ ...prev, status: 'open' }));
    };

    const handleMarkAsFollowUp = () => {
        const updatedConvs = conversations.map(c =>
            c.id === selectedConv.id ? { ...c, status: 'follow_up' } : c
        );
        setConversations(updatedConvs);
        setSelectedConv(prev => ({ ...prev, status: 'follow_up' }));
    };

    const handleAddTag = (tag: string) => {
        console.log('Agregar etiqueta:', tag);
    };

    const handleAddNote = () => {
        const note = prompt('Escribe una nota:');
        if (note) {
            console.log('Nota agregada:', note);
        }
    };

    return (
        <div className="conversations-page">
            {/* Conversation List */}
            <div className="conversation-list-panel">
                <div className="panel-header">
                    <h2>Conversaciones</h2>
                    <div className="filter-tabs">
                        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</button>
                        <button className={`filter-tab ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Abiertas</button>
                        <button className={`filter-tab ${filter === 'follow_up' ? 'active' : ''}`} onClick={() => setFilter('follow_up')}>Seguimiento</button>
                    </div>
                </div>

                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar conversaciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="conversation-items">
                    {filteredConversations.length === 0 ? (
                        <div className="no-results">
                            <p>No se encontraron conversaciones</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`conv-item ${selectedConv?.id === conv.id ? 'active' : ''}`}
                                onClick={() => setSelectedConv(conv)}
                            >
                                <div className="avatar-wrapper">
                                    <div className="avatar">{conv.name.split(' ').map(n => n[0]).join('')}</div>
                                    {conv.isOnline && <span className="online-indicator"></span>}
                                </div>
                                <div className="conv-info">
                                    <div className="conv-header">
                                        <span className="conv-name">{conv.name}</span>
                                        <span className="conv-time">{conv.time}</span>
                                    </div>
                                    <p className="conv-preview truncate">
                                        {conv.isTyping ? (
                                            <span className="typing-text">Escribiendo...</span>
                                        ) : (
                                            conv.lastMessage
                                        )}
                                    </p>
                                </div>
                                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Panel */}
            <div className="chat-panel">
                {selectedConv ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-contact">
                                <div className="avatar-wrapper">
                                    <div className="avatar">{selectedConv.name.split(' ').map(n => n[0]).join('')}</div>
                                    {selectedConv.isOnline && <span className="online-indicator"></span>}
                                </div>
                                <div className="contact-info">
                                    <span className="contact-name">{selectedConv.name}</span>
                                    <span className="contact-status">
                                        {selectedConv.isOnline ? (
                                            <><span className="status-dot online"></span> En línea</>
                                        ) : (
                                            <><span className="status-dot"></span> Desconectado</>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-actions">
                                <button className="btn btn-ghost" title="Llamar"><Phone size={18} /></button>
                                <button className="btn btn-ghost" title="Video"><Video size={18} /></button>
                                <button className="btn btn-ghost" title="Ver perfil"><User size={18} /></button>
                                <button className="btn btn-ghost" title="Más opciones"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message ${msg.direction}`}>
                                    <div className="message-bubble">
                                        <p>{msg.content}</p>
                                        <div className="message-meta">
                                            <span className="message-time">{msg.time}</span>
                                            {msg.direction === 'outbound' && (
                                                <span className={`message-status ${msg.status}`}>
                                                    {msg.status === 'read' ? <CheckCheck size={14} /> : <CheckCheck size={14} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message inbound">
                                    <div className="message-bubble typing-bubble">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-container">
                            {showTemplates && (
                                <div className="templates-popup">
                                    <div className="templates-header">
                                        <span>Plantillas rápidas</span>
                                        <button onClick={() => setShowTemplates(false)}><X size={16} /></button>
                                    </div>
                                    <div className="templates-list">
                                        {quickTemplates.map(t => (
                                            <button key={t.id} className="template-item" onClick={() => handleSelectTemplate(t)}>
                                                <span className="template-name">{t.name}</span>
                                                <span className="template-preview">{t.content}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showAttachMenu && (
                                <div className="attach-popup">
                                    <button onClick={() => setShowAttachMenu(false)}><Image size={20} /> Imagen</button>
                                    <button onClick={() => setShowAttachMenu(false)}><FileText size={20} /> Documento</button>
                                    <button onClick={() => setShowAttachMenu(false)}><Mic size={20} /> Audio</button>
                                </div>
                            )}

                            <div className="chat-input">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                    title="Adjuntar"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    title="Plantillas"
                                >
                                    <FileText size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Escribe un mensaje..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button className="btn btn-ghost" title="Emoji"><Smile size={20} /></button>
                                <button
                                    className="btn btn-primary send-btn"
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-conversation">
                        <p>Selecciona una conversación para comenzar</p>
                    </div>
                )}
            </div>

            {/* Contact Info Panel */}
            <div className="contact-panel">
                {selectedConv && (
                    <>
                        <div className="contact-header">
                            <div className="avatar-wrapper large">
                                <div className="avatar avatar-lg">{selectedConv.name.split(' ').map(n => n[0]).join('')}</div>
                                {selectedConv.isOnline && <span className="online-indicator"></span>}
                            </div>
                            <h3>{selectedConv.name}</h3>
                            <p>{selectedConv.phone}</p>
                            <span className={`badge badge-${selectedConv.status === 'open' ? 'primary' : selectedConv.status === 'closed' ? 'success' : 'warning'}`}>
                                {selectedConv.status === 'open' ? 'Abierta' : selectedConv.status === 'closed' ? 'Cerrada' : 'Seguimiento'}
                            </span>
                        </div>

                        <div className="contact-actions">
                            {selectedConv.status === 'open' && (
                                <>
                                    <button className="btn btn-secondary" onClick={handleCloseConversation}>
                                        Cerrar conversación
                                    </button>
                                    <button className="btn btn-ghost" onClick={handleMarkAsFollowUp}>
                                        Marcar seguimiento
                                    </button>
                                </>
                            )}
                            {selectedConv.status === 'closed' && (
                                <button className="btn btn-primary" onClick={handleReopenConversation}>
                                    Reabrir conversación
                                </button>
                            )}
                        </div>

                        <div className="contact-section">
                            <h4>Etiquetas</h4>
                            <div className="tags">
                                <span className="tag">Cliente VIP</span>
                                <span className="tag">Soporte</span>
                                <button className="add-tag-btn" onClick={() => handleAddTag('Nueva')}>+</button>
                            </div>
                        </div>

                        <div className="contact-section">
                            <h4>Notas</h4>
                            <div className="notes">
                                <div className="note">
                                    <p>Cliente interesado en plan premium</p>
                                    <span className="note-date">Ayer, 15:30</span>
                                </div>
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleAddNote}>
                                Agregar nota
                            </button>
                        </div>

                        <div className="contact-section">
                            <h4>Información</h4>
                            <div className="info-item">
                                <span className="info-label">Canal</span>
                                <span className="info-value">WhatsApp</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Primera interacción</span>
                                <span className="info-value">15 Ene 2026</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Total conversaciones</span>
                                <span className="info-value">5</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ConversationsPage;
