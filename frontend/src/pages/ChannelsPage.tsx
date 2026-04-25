import { useState, useEffect } from 'react';
import { MessageCircle, Facebook, Instagram, Globe, Plus, Check, X, RefreshCw, Copy, AlertCircle, CheckCircle, Settings, Info, Smartphone, QrCode, Loader } from 'lucide-react';
import './ChannelsPage.css';

const channelsData = [
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        icon: MessageCircle,
        status: 'connected',
        accounts: [
            { id: '1', name: 'Soporte Principal', phone: '+57 300 123 4567', status: 'active', messages: 1234, lastSync: 'Hace 2 min' },
        ],
        available: true,
    },
    {
        id: 'facebook',
        name: 'Facebook Messenger',
        icon: Facebook,
        status: 'disconnected',
        accounts: [],
        available: false,
        comingSoon: true,
    },
    {
        id: 'instagram',
        name: 'Instagram Direct',
        icon: Instagram,
        status: 'disconnected',
        accounts: [],
        available: false,
        comingSoon: true,
    },
    {
        id: 'webchat',
        name: 'Web Chat',
        icon: Globe,
        status: 'disconnected',
        accounts: [],
        available: false,
        comingSoon: true,
    },
];

const webhookLogs = [
    { id: '1', event: 'message.received', status: 'success', time: 'Hace 2 min', from: '+57 300 123 4567' },
    { id: '2', event: 'message.sent', status: 'success', time: 'Hace 5 min', from: 'Sistema' },
    { id: '3', event: 'message.delivered', status: 'success', time: 'Hace 5 min', from: '+57 310 987 6543' },
    { id: '4', event: 'message.read', status: 'success', time: 'Hace 10 min', from: '+57 300 123 4567' },
    { id: '5', event: 'webhook.error', status: 'error', time: 'Hace 1h', from: 'Meta API' },
];

function ChannelsPage() {
    const [channels, setChannels] = useState(channelsData);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showAPIModal, setShowAPIModal] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'channels' | 'webhooks' | 'logs'>('channels');
    const [qrStep, setQrStep] = useState<'loading' | 'ready' | 'scanning' | 'connected'>('loading');
    const [connectionMethod, setConnectionMethod] = useState<'qr' | 'api' | null>(null);

    const webhookUrl = 'https://api.tudominio.com/api/v1/whatsapp/webhook';
    const [verifyToken] = useState('crm_verify_token_' + Math.random().toString(36).substring(7));

    // Simular generación de QR
    useEffect(() => {
        if (showQRModal && qrStep === 'loading') {
            const timer = setTimeout(() => setQrStep('ready'), 2000);
            return () => clearTimeout(timer);
        }
    }, [showQRModal, qrStep]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSync = (channelId: string) => {
        console.log('Sincronizando canal:', channelId);
    };

    const handleDisconnect = (channelId: string, accountId: string) => {
        if (confirm('¿Estás seguro de desconectar esta cuenta?')) {
            setChannels(prev => prev.map(ch =>
                ch.id === channelId
                    ? { ...ch, accounts: ch.accounts.filter(a => a.id !== accountId), status: 'disconnected' }
                    : ch
            ));
        }
    };

    const handleOpenConnectionModal = () => {
        setConnectionMethod(null);
    };

    const handleSelectQR = () => {
        setConnectionMethod('qr');
        setQrStep('loading');
        setShowQRModal(true);
    };

    const handleSelectAPI = () => {
        setConnectionMethod('api');
        setShowAPIModal(true);
    };

    const handleSimulateScan = () => {
        setQrStep('scanning');
        setTimeout(() => {
            setQrStep('connected');
            // Add new account after connection
            setTimeout(() => {
                const newAccount = {
                    id: Date.now().toString(),
                    name: 'Nuevo Número',
                    phone: '+57 301 ' + Math.floor(Math.random() * 9000000 + 1000000),
                    status: 'active',
                    messages: 0,
                    lastSync: 'Ahora'
                };
                setChannels(prev => prev.map(ch =>
                    ch.id === 'whatsapp'
                        ? { ...ch, accounts: [...ch.accounts, newAccount], status: 'connected' }
                        : ch
                ));
                setShowQRModal(false);
                setQrStep('loading');
            }, 2000);
        }, 3000);
    };

    const handleConnectAPI = () => {
        const newAccount = {
            id: Date.now().toString(),
            name: 'API Business',
            phone: '+57 302 ' + Math.floor(Math.random() * 9000000 + 1000000),
            status: 'active',
            messages: 0,
            lastSync: 'Ahora'
        };
        setChannels(prev => prev.map(ch =>
            ch.id === 'whatsapp'
                ? { ...ch, accounts: [...ch.accounts, newAccount], status: 'connected' }
                : ch
        ));
        setShowAPIModal(false);
    };

    const handleTestWebhook = () => {
        alert('Webhook test enviado! Revisa los logs.');
    };

    const handleRegenerateToken = () => {
        if (confirm('¿Regenerar el token de verificación? Deberás actualizarlo en Meta.')) {
            console.log('Token regenerado');
        }
    };

    return (
        <div className="channels-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Canales e Integraciones</h1>
                    <p>Conecta y gestiona tus canales de comunicación</p>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'channels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('channels')}
                >
                    Canales
                </button>
                <button
                    className={`tab ${activeTab === 'webhooks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('webhooks')}
                >
                    Configuración Webhooks
                </button>
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Logs de Eventos
                </button>
            </div>

            {activeTab === 'channels' && (
                <div className="channels-grid">
                    {channels.map((channel) => (
                        <div key={channel.id} className={`channel-card ${channel.status === 'connected' ? 'connected' : ''}`}>
                            <div className="channel-header">
                                <div className={`channel-icon ${channel.id}`}>
                                    <channel.icon size={24} />
                                </div>
                                <div className="channel-info">
                                    <h3>{channel.name}</h3>
                                    <span className={`status-badge ${channel.status}`}>
                                        {channel.status === 'connected' ? (
                                            <><CheckCircle size={12} /> Conectado</>
                                        ) : channel.comingSoon ? (
                                            'Próximamente'
                                        ) : (
                                            <><X size={12} /> Desconectado</>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {channel.accounts.length > 0 ? (
                                <div className="channel-accounts">
                                    {channel.accounts.map((account) => (
                                        <div key={account.id} className="account-item">
                                            <div className="account-info">
                                                <span className="account-name">{account.name}</span>
                                                <span className="account-phone">{account.phone}</span>
                                                <span className="account-sync">Sincronizado: {account.lastSync}</span>
                                            </div>
                                            <div className="account-stats">
                                                <span className="stat">{account.messages.toLocaleString()} mensajes</span>
                                            </div>
                                            <div className={`account-status ${account.status}`}>
                                                <span className="status-dot"></span>
                                                {account.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </div>
                                            <button
                                                className="btn btn-ghost text-danger"
                                                onClick={() => handleDisconnect(channel.id, account.id)}
                                                title="Desconectar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button className="btn btn-secondary add-account-btn" onClick={handleSelectQR}>
                                        <Plus size={16} />
                                        Agregar número
                                    </button>
                                </div>
                            ) : (
                                <div className="channel-empty">
                                    {channel.comingSoon ? (
                                        <>
                                            <Info size={32} className="coming-soon-icon" />
                                            <p>Este canal estará disponible próximamente</p>
                                            <span className="coming-soon-text">Estamos trabajando para integrarlo</span>
                                        </>
                                    ) : (
                                        <>
                                            <p>No hay cuentas conectadas</p>
                                            <button className="btn btn-primary" onClick={handleSelectQR}>
                                                <Plus size={16} />
                                                Conectar
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {channel.status === 'connected' && (
                                <div className="channel-footer">
                                    <button className="btn btn-ghost" onClick={() => handleSync(channel.id)}>
                                        <RefreshCw size={16} />
                                        Sincronizar
                                    </button>
                                    <button className="btn btn-ghost">
                                        <Settings size={16} />
                                        Configurar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'webhooks' && (
                <div className="webhooks-section">
                    <div className="setup-card card">
                        <h2>Configuración de WhatsApp Business API</h2>
                        <p className="text-secondary">Sigue estos pasos para conectar tu número de WhatsApp</p>

                        <div className="setup-steps">
                            <div className="step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Crear App en Meta for Developers</h4>
                                    <p>Ve a <a href="https://developers.facebook.com" target="_blank" rel="noreferrer">developers.facebook.com</a> y crea una nueva app de tipo "Business"</p>
                                </div>
                            </div>

                            <div className="step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Agregar WhatsApp Product</h4>
                                    <p>En tu app, agrega el producto "WhatsApp" y configura un número de prueba o producción</p>
                                </div>
                            </div>

                            <div className="step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Configurar Webhook</h4>
                                    <p>En la sección de Webhooks, usa la siguiente URL y token:</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="webhook-config card">
                        <h3>Datos del Webhook</h3>

                        <div className="webhook-item">
                            <div className="webhook-info">
                                <span className="webhook-label">Callback URL</span>
                                <code className="webhook-url">{webhookUrl}</code>
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleCopy(webhookUrl, 'url')}
                            >
                                {copiedField === 'url' ? <Check size={16} /> : <Copy size={16} />}
                                {copiedField === 'url' ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>

                        <div className="webhook-item">
                            <div className="webhook-info">
                                <span className="webhook-label">Verify Token</span>
                                <code className="webhook-url">{verifyToken}</code>
                            </div>
                            <div className="webhook-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleCopy(verifyToken, 'token')}
                                >
                                    {copiedField === 'token' ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={handleRegenerateToken}
                                    title="Regenerar"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="webhook-status">
                            <span className="status-indicator active"></span>
                            <span>Webhook activo y recibiendo eventos</span>
                        </div>

                        <button className="btn btn-secondary" onClick={handleTestWebhook}>
                            Enviar Test
                        </button>
                    </div>

                    <div className="subscriptions-card card">
                        <h3>Suscripciones de Webhook</h3>
                        <p className="text-secondary">Eventos a los que está suscrito tu webhook</p>

                        <div className="subscriptions-list">
                            <div className="subscription-item active">
                                <CheckCircle size={16} />
                                <span>messages</span>
                            </div>
                            <div className="subscription-item active">
                                <CheckCircle size={16} />
                                <span>message_deliveries</span>
                            </div>
                            <div className="subscription-item active">
                                <CheckCircle size={16} />
                                <span>message_reads</span>
                            </div>
                            <div className="subscription-item">
                                <X size={16} />
                                <span>message_template_status_update</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="logs-section card">
                    <div className="logs-header">
                        <h2>Logs de Eventos</h2>
                        <button className="btn btn-ghost">
                            <RefreshCw size={16} />
                            Actualizar
                        </button>
                    </div>

                    <div className="logs-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Estado</th>
                                    <th>Origen</th>
                                    <th>Tiempo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {webhookLogs.map(log => (
                                    <tr key={log.id} className={log.status}>
                                        <td>
                                            <code>{log.event}</code>
                                        </td>
                                        <td>
                                            <span className={`log-status ${log.status}`}>
                                                {log.status === 'success' ? (
                                                    <><CheckCircle size={14} /> Éxito</>
                                                ) : (
                                                    <><AlertCircle size={14} /> Error</>
                                                )}
                                            </span>
                                        </td>
                                        <td>{log.from}</td>
                                        <td>{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="modal qr-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon whatsapp">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <h3>Conectar WhatsApp</h3>
                                <p>Escanea el código QR con tu teléfono</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowQRModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body qr-body">
                            {qrStep === 'loading' && (
                                <div className="qr-loading">
                                    <Loader size={48} className="spinning" />
                                    <p>Generando código QR...</p>
                                </div>
                            )}

                            {qrStep === 'ready' && (
                                <div className="qr-container">
                                    <div className="qr-code">
                                        <QrCode size={180} strokeWidth={1} />
                                        <div className="qr-overlay">
                                            <MessageCircle size={40} />
                                        </div>
                                    </div>
                                    <div className="qr-instructions">
                                        <h4>Instrucciones:</h4>
                                        <ol>
                                            <li>Abre WhatsApp en tu teléfono</li>
                                            <li>Toca <strong>Menú</strong> o <strong>Configuración</strong></li>
                                            <li>Selecciona <strong>Dispositivos vinculados</strong></li>
                                            <li>Toca <strong>Vincular un dispositivo</strong></li>
                                            <li>Apunta tu teléfono a esta pantalla para escanear el código</li>
                                        </ol>
                                    </div>
                                    <button className="btn btn-primary" onClick={handleSimulateScan}>
                                        <Smartphone size={16} />
                                        Simular escaneo (Demo)
                                    </button>
                                </div>
                            )}

                            {qrStep === 'scanning' && (
                                <div className="qr-loading">
                                    <Loader size={48} className="spinning" />
                                    <p>Conectando con WhatsApp...</p>
                                    <span className="text-secondary">No cierres esta ventana</span>
                                </div>
                            )}

                            {qrStep === 'connected' && (
                                <div className="qr-success">
                                    <div className="success-icon">
                                        <CheckCircle size={64} />
                                    </div>
                                    <h3>¡Conectado exitosamente!</h3>
                                    <p>Tu número de WhatsApp ha sido vinculado</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleSelectAPI}>
                                Usar API en su lugar
                            </button>
                            <button className="btn btn-ghost" onClick={() => setShowQRModal(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Setup Modal */}
            {showAPIModal && (
                <div className="modal-overlay" onClick={() => setShowAPIModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h3>Conectar via API</h3>
                                <p>Ingresa tus credenciales de Meta Business</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowAPIModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre de la cuenta</label>
                                <input type="text" className="input" placeholder="Ej: Soporte Principal" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number ID</label>
                                <input type="text" className="input" placeholder="Obtener de Meta Business" />
                                <span className="input-hint">Encuentra este ID en tu panel de Meta Business</span>
                            </div>
                            <div className="form-group">
                                <label>WABA ID</label>
                                <input type="text" className="input" placeholder="WhatsApp Business Account ID" />
                            </div>
                            <div className="form-group">
                                <label>Access Token</label>
                                <input type="password" className="input" placeholder="Token de acceso de Meta" />
                                <span className="input-hint">Token permanente o temporal de la API</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleSelectQR}>
                                Usar QR en su lugar
                            </button>
                            <button className="btn btn-primary" onClick={handleConnectAPI}>
                                <Check size={16} />
                                Conectar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChannelsPage;
