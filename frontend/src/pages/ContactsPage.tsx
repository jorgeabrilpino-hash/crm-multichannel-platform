import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Mail, Phone, Download, X, ChevronLeft, ChevronRight, MessageSquare, Trash2, User } from 'lucide-react';
import './ContactsPage.css';

const initialContacts = [
    { id: '1', name: 'María García', email: 'maria@email.com', phone: '+57 300 123 4567', tags: ['VIP', 'Soporte'], lastContact: '2h', conversations: 5, createdAt: '2026-01-10' },
    { id: '2', name: 'Carlos López', email: 'carlos@email.com', phone: '+57 310 987 6543', tags: ['Nuevo'], lastContact: '1d', conversations: 2, createdAt: '2026-01-12' },
    { id: '3', name: 'Ana Martínez', email: 'ana@email.com', phone: '+57 320 456 7890', tags: ['Premium'], lastContact: '3d', conversations: 12, createdAt: '2026-01-05' },
    { id: '4', name: 'Pedro Sánchez', email: 'pedro@email.com', phone: '+57 315 111 2222', tags: ['Prospecto', 'B2B'], lastContact: '5d', conversations: 1, createdAt: '2026-01-08' },
    { id: '5', name: 'Laura Díaz', email: 'laura@email.com', phone: '+57 312 333 4444', tags: ['VIP'], lastContact: '1w', conversations: 8, createdAt: '2026-01-01' },
    { id: '6', name: 'Jorge Ramírez', email: 'jorge@email.com', phone: '+57 318 555 6666', tags: ['Soporte'], lastContact: '2w', conversations: 3, createdAt: '2025-12-28' },
    { id: '7', name: 'Sofía Castro', email: 'sofia@email.com', phone: '+57 301 777 8888', tags: ['Premium', 'VIP'], lastContact: '3h', conversations: 15, createdAt: '2025-12-20' },
    { id: '8', name: 'Andrés Moreno', email: 'andres@email.com', phone: '+57 314 999 0000', tags: ['Nuevo'], lastContact: '6h', conversations: 1, createdAt: '2026-01-14' },
    { id: '9', name: 'Valentina Torres', email: 'vale@email.com', phone: '+57 320 111 2233', tags: ['B2B'], lastContact: '4d', conversations: 6, createdAt: '2026-01-06' },
    { id: '10', name: 'Diego Herrera', email: 'diego@email.com', phone: '+57 311 444 5566', tags: ['Prospecto'], lastContact: '1w', conversations: 2, createdAt: '2025-12-25' },
];

const availableTags = ['VIP', 'Premium', 'Nuevo', 'Prospecto', 'B2B', 'Soporte'];

function ContactsPage() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState(initialContacts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showNewContactModal, setShowNewContactModal] = useState(false);
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'name' | 'lastContact' | 'conversations'>('lastContact');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 5;

    // New contact form
    const [newContactForm, setNewContactForm] = useState({
        name: '',
        phone: '',
        email: '',
        tag: 'Nuevo'
    });

    // Filter and sort contacts
    const filteredContacts = useMemo(() => {
        let result = contacts.filter(c => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone.includes(searchTerm);

            const matchesTags = selectedTags.length === 0 ||
                selectedTags.some(tag => c.tags.includes(tag));

            return matchesSearch && matchesTags;
        });

        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'conversations') {
                comparison = a.conversations - b.conversations;
            } else {
                comparison = a.lastContact.localeCompare(b.lastContact);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [contacts, searchTerm, selectedTags, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleTagFilter = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        setCurrentPage(1);
    };

    const handleExportCSV = () => {
        const headers = ['Nombre', 'Email', 'Teléfono', 'Etiquetas', 'Conversaciones', 'Último Contacto'];
        const rows = filteredContacts.map(c => [
            c.name,
            c.email,
            c.phone,
            c.tags.join('; '),
            c.conversations.toString(),
            c.lastContact
        ]);

        const csvContent = '\uFEFF' + [ // BOM for Excel UTF-8
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `contactos_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success message
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 3000);
    };

    const handleOpenNewContactModal = () => {
        setNewContactForm({ name: '', phone: '', email: '', tag: 'Nuevo' });
        setShowNewContactModal(true);
    };

    const handleCreateContact = () => {
        if (!newContactForm.name.trim()) {
            alert('El nombre es requerido');
            return;
        }
        if (!newContactForm.phone.trim()) {
            alert('El teléfono es requerido');
            return;
        }

        const newContact = {
            id: Date.now().toString(),
            name: newContactForm.name.trim(),
            email: newContactForm.email.trim(),
            phone: newContactForm.phone.trim(),
            tags: [newContactForm.tag],
            lastContact: 'Ahora',
            conversations: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setContacts(prev => [newContact, ...prev]);
        setSelectedContact(newContact);
        setShowNewContactModal(false);
        setCurrentPage(1);
    };

    const handleDeleteContact = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este contacto?')) {
            setContacts(prev => prev.filter(c => c.id !== id));
            if (selectedContact?.id === id) {
                setSelectedContact(null);
            }
        }
    };

    const handleStartConversation = (contact: typeof contacts[0]) => {
        navigate('/conversations', {
            state: {
                newConversation: {
                    name: contact.name,
                    phone: contact.phone
                }
            }
        });
    };

    const handleAddTag = (contactId: string) => {
        const tag = prompt('Nueva etiqueta:');
        if (!tag) return;
        setContacts(prev => prev.map(c =>
            c.id === contactId ? { ...c, tags: [...c.tags, tag] } : c
        ));
        if (selectedContact?.id === contactId) {
            setSelectedContact(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null);
        }
    };

    const handleRemoveTag = (contactId: string, tag: string) => {
        setContacts(prev => prev.map(c =>
            c.id === contactId ? { ...c, tags: c.tags.filter(t => t !== tag) } : c
        ));
        if (selectedContact?.id === contactId) {
            setSelectedContact(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
        }
    };

    return (
        <div className="contacts-page animate-fade-in">
            {/* Success notification */}
            {showExportSuccess && (
                <div className="export-success-toast">
                    ✓ Archivo CSV exportado correctamente
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1>Contactos</h1>
                    <p>Gestiona tu base de contactos ({filteredContacts.length} total)</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        <Download size={18} />
                        Exportar CSV
                    </button>
                    <button className="btn btn-primary" onClick={handleOpenNewContactModal}>
                        <Plus size={18} />
                        Nuevo contacto
                    </button>
                </div>
            </div>

            <div className="contacts-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    {searchTerm && (
                        <button className="clear-btn" onClick={() => setSearchTerm('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button
                    className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    Filtros
                    {selectedTags.length > 0 && <span className="filter-count">{selectedTags.length}</span>}
                </button>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-header">
                        <span>Filtrar por etiquetas:</span>
                        {selectedTags.length > 0 && (
                            <button className="clear-filters" onClick={() => setSelectedTags([])}>
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    <div className="filter-tags">
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                className={`filter-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                                onClick={() => handleTagFilter(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="contacts-container">
                <div className="contacts-table-container">
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th onClick={() => { setSortBy('name'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                                    Contacto {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Teléfono</th>
                                <th>Etiquetas</th>
                                <th onClick={() => { setSortBy('lastContact'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                                    Último contacto {sortBy === 'lastContact' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => { setSortBy('conversations'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                                    Conversaciones {sortBy === 'conversations' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="no-results">
                                        No se encontraron contactos
                                    </td>
                                </tr>
                            ) : (
                                paginatedContacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className={selectedContact?.id === contact.id ? 'selected' : ''}
                                        onClick={() => setSelectedContact(contact)}
                                    >
                                        <td>
                                            <div className="contact-cell">
                                                <div className="avatar avatar-sm">
                                                    {contact.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="contact-info">
                                                    <span className="contact-name">{contact.name}</span>
                                                    <span className="contact-email">{contact.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{contact.phone}</td>
                                        <td>
                                            <div className="tags">
                                                {contact.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="tag">{tag}</span>
                                                ))}
                                                {contact.tags.length > 2 && (
                                                    <span className="tag more">+{contact.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{contact.lastContact}</td>
                                        <td>{contact.conversations}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button
                                                    className="btn btn-ghost"
                                                    title="Iniciar conversación"
                                                    onClick={(e) => { e.stopPropagation(); handleStartConversation(contact); }}
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    title="Eliminar"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="pagination-info">
                                Página {currentPage} de {totalPages}
                            </div>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {selectedContact && (
                    <div className="contact-detail">
                        <div className="detail-header">
                            <div className="avatar avatar-lg">
                                {selectedContact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3>{selectedContact.name}</h3>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleStartConversation(selectedContact)}
                            >
                                <MessageSquare size={16} />
                                Iniciar conversación
                            </button>
                        </div>

                        <div className="detail-section">
                            <h4>Información</h4>
                            <div className="detail-item">
                                <Mail size={16} />
                                <span>{selectedContact.email || 'Sin email'}</span>
                            </div>
                            <div className="detail-item">
                                <Phone size={16} />
                                <span>{selectedContact.phone}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Etiquetas</h4>
                            <div className="tags editable">
                                {selectedContact.tags.map((tag, i) => (
                                    <span key={i} className="tag">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(selectedContact.id, tag)}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                <button className="add-tag-btn" onClick={() => handleAddTag(selectedContact.id)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Estadísticas</h4>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-value">{selectedContact.conversations}</span>
                                    <span className="stat-label">Conversaciones</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{selectedContact.lastContact}</span>
                                    <span className="stat-label">Último contacto</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-actions">
                            <button className="btn btn-secondary" onClick={() => handleStartConversation(selectedContact)}>
                                Ver historial
                            </button>
                            <button className="btn btn-ghost text-danger" onClick={() => handleDeleteContact(selectedContact.id)}>
                                <Trash2 size={16} />
                                Eliminar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Contact Modal */}
            {showNewContactModal && (
                <div className="modal-overlay" onClick={() => setShowNewContactModal(false)}>
                    <div className="modal new-contact-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon">
                                <User size={24} />
                            </div>
                            <div>
                                <h3>Nuevo Contacto</h3>
                                <p>Agrega un nuevo contacto a tu base de datos</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowNewContactModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ej: Juan Pérez"
                                    value={newContactForm.name}
                                    onChange={(e) => setNewContactForm(prev => ({ ...prev, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Número de teléfono (WhatsApp) *</label>
                                <input
                                    type="tel"
                                    className="input"
                                    placeholder="+57 300 000 0000"
                                    value={newContactForm.phone}
                                    onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                />
                                <span className="input-hint">Incluye el código de país</span>
                            </div>

                            <div className="form-group">
                                <label>Correo electrónico (opcional)</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="correo@ejemplo.com"
                                    value={newContactForm.email}
                                    onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Etiqueta inicial</label>
                                <select
                                    className="input"
                                    value={newContactForm.tag}
                                    onChange={(e) => setNewContactForm(prev => ({ ...prev, tag: e.target.value }))}
                                >
                                    {availableTags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowNewContactModal(false)}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateContact}
                                disabled={!newContactForm.name.trim() || !newContactForm.phone.trim()}
                            >
                                <Plus size={16} />
                                Crear contacto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactsPage;
