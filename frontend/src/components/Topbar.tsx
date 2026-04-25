import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Plus, X, MessageSquare } from 'lucide-react';
import './Topbar.css';

// Props interface
interface TopbarProps {
    onNewConversation?: (contact: { name: string; phone: string }) => void;
}

function Topbar({ onNewConversation }: TopbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ name: string; phone: string }>>([]);

    // Mock contacts for quick search
    const mockContacts = [
        { name: 'María García', phone: '+57 300 123 4567' },
        { name: 'Carlos López', phone: '+57 310 987 6543' },
        { name: 'Ana Martínez', phone: '+57 320 456 7890' },
        { name: 'Pedro Sánchez', phone: '+57 315 111 2222' },
        { name: 'Laura Díaz', phone: '+57 312 333 4444' },
    ];

    const handleSearch = (term: string) => {
        setContactName(term);
        if (term.length > 0) {
            const results = mockContacts.filter(c =>
                c.name.toLowerCase().includes(term.toLowerCase()) ||
                c.phone.includes(term)
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectContact = (contact: { name: string; phone: string }) => {
        setContactName(contact.name);
        setContactPhone(contact.phone);
        setSearchResults([]);
    };

    const handleStartConversation = () => {
        if (!contactName.trim()) {
            alert('Por favor ingresa un nombre');
            return;
        }
        if (!contactPhone.trim()) {
            alert('Por favor ingresa un teléfono');
            return;
        }

        // Navigate to conversations with the new contact
        navigate('/conversations', {
            state: {
                newConversation: {
                    name: contactName,
                    phone: contactPhone
                }
            }
        });

        // Reset and close
        setContactName('');
        setContactPhone('');
        setShowModal(false);
    };

    const handleOpenModal = () => {
        setShowModal(true);
        setContactName('');
        setContactPhone('');
        setSearchResults([]);
    };

    return (
        <>
            <header className="topbar">
                <div className="topbar-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar contactos, conversaciones..."
                        className="search-input"
                    />
                </div>

                <div className="topbar-actions">
                    <button className="btn btn-primary" onClick={handleOpenModal}>
                        <Plus size={18} />
                        <span>Nueva conversación</span>
                    </button>

                    <button className="notification-btn">
                        <Bell size={20} />
                        <span className="notification-badge">3</span>
                    </button>
                </div>
            </header>

            {/* New Conversation Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal new-conversation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3>Nueva Conversación</h3>
                                <p>Inicia una nueva conversación con un contacto</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Buscar o ingresar nombre</label>
                                <div className="search-input-wrapper">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Escribe el nombre del contacto..."
                                        value={contactName}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="search-results">
                                        {searchResults.map((contact, i) => (
                                            <button
                                                key={i}
                                                className="search-result-item"
                                                onClick={() => handleSelectContact(contact)}
                                            >
                                                <div className="avatar avatar-sm">
                                                    {contact.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="result-info">
                                                    <span className="result-name">{contact.name}</span>
                                                    <span className="result-phone">{contact.phone}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Número de teléfono (WhatsApp)</label>
                                <input
                                    type="tel"
                                    className="input"
                                    placeholder="+57 300 000 0000"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                                <span className="input-hint">Incluye el código de país (ej: +57 para Colombia)</span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleStartConversation}
                                disabled={!contactName.trim() || !contactPhone.trim()}
                            >
                                <MessageSquare size={16} />
                                Iniciar conversación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Topbar;
