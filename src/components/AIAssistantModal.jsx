import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Shield, RotateCcw, AlertTriangle, ChevronRight, User } from 'lucide-react';
import { askMJCompanyAssistant } from '../services/ragAssistantService';
import { useAuth } from '../context/AuthContext';

export default function AIAssistantModal() {
  const { userRole, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const effectiveRole = (userRole || 'vendedor').toLowerCase();

  // Role labels and badges
  const roleBadges = {
    vendedor: { label: 'Vendedor / POS', color: '#15803d', bg: '#dcfce7' },
    supervisor: { label: 'Supervisor Turno', color: '#0369a1', bg: '#e0f2fe' },
    admin: { label: 'Administrador', color: '#7c3aed', bg: '#f3e8ff' },
    superadmin: { label: 'Superadmin Google', color: '#b45309', bg: '#fef3c7' }
  };

  const currentBadge = roleBadges[effectiveRole] || roleBadges.vendedor;

  // Suggested questions based on active role
  const roleQuestions = {
    vendedor: [
      '¿Cómo hago un cobro con QR?',
      '¿Cómo registro un cobro mixto (efectivo + QR)?',
      '¿Cómo registro un préstamo o fianza interna?',
      '¿Cómo se realiza el cierre de caja de turno?'
    ],
    supervisor: [
      '¿Cómo realizo un conteo ciego de inventario?',
      '¿Cómo autorizo mermas o bajas de productos?',
      '¿Cómo registro un depósito bancario de caja?',
      '¿Cómo superviso el turno activo del vendedor?'
    ],
    admin: [
      '¿Cómo doy de alta a un nuevo vendedor o supervisor?',
      '¿Cómo aplico multas o sanciones a vendedores?',
      '¿Cómo actualizo los precios de costo y venta?',
      '¿Cómo funciona la conciliación de flujo de caja?'
    ],
    superadmin: [
      '¿Cuáles son las cuentas Google de Superadmin autorizadas?',
      '¿Cómo exporto un respaldo completo de Firestore?',
      '¿Dónde se auditan los registros de seguridad globales?'
    ]
  };

  const suggestions = roleQuestions[effectiveRole] || roleQuestions.vendedor;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await askMJCompanyAssistant(text, effectiveRole, messages);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: 'Ocurrió un inconveniente al consultar el manual. Por favor reintenta en unos instantes.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div 
        id="mj-ai-assistant-launcher"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'linear-gradient(135deg, #1b4d3e 0%, #2e7d32 100%)',
          color: '#ffffff',
          padding: '0.75rem 1.15rem',
          borderRadius: '50px',
          boxShadow: '0 8px 24px rgba(27, 77, 62, 0.35), 0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
          border: '1.5px solid rgba(255,255,255,0.25)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(27, 77, 62, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(27, 77, 62, 0.35)';
        }}
        title="Asistente RAG con IA Generativa MJ-Company"
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bot size={22} color="#ffffff" />
          <Sparkles 
            size={12} 
            color="#fef08a" 
            style={{ 
              position: 'absolute', 
              top: '-4px', 
              right: '-6px',
              animation: 'spin 4s linear infinite'
            }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.2 }}>
            Asistente MJ
          </span>
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 500, 
            opacity: 0.9, 
            background: 'rgba(255,255,255,0.2)',
            padding: '1px 6px',
            borderRadius: '10px',
            marginTop: '2px'
          }}>
            {currentBadge.label}
          </span>
        </div>
      </div>

      {/* Assistant Modal / Drawer */}
      {isOpen && (
        <div 
          id="mj-ai-assistant-modal"
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '580px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden',
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1b4d3e 0%, #215737 100%)',
            color: '#ffffff',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                    Asistente MJ
                  </h4>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: currentBadge.bg,
                    color: currentBadge.color,
                    textTransform: 'uppercase'
                  }}>
                    {effectiveRole}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.74rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={11} /> Manual oficial jerárquico verificado
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Reiniciar chat"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar asistente"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            backgroundColor: 'var(--bg-secondary, #f8fafc)'
          }}>
            {/* Empty State with Role Greetings and Quick Suggestions */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5e9',
                  color: '#1b4d3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <Sparkles size={24} />
                </div>
                <h5 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                  ¡Hola! ¿En qué puedo guiarte hoy?
                </h5>
                <p style={{ margin: '0.35rem 0 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
                  Tengo acceso exclusivo al manual oficial para <strong>{currentBadge.label}</strong>.
                </p>

                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Consultas habituales de tu rol:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                    {suggestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        style={{
                          textAlign: 'left',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color, #e2e8f0)',
                          backgroundColor: 'var(--card-bg, #ffffff)',
                          color: 'var(--text-primary, #334155)',
                          fontSize: '0.79rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#215737';
                          e.currentTarget.style.backgroundColor = '#f0fdf4';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                          e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
                        }}
                      >
                        <span>{q}</span>
                        <ChevronRight size={14} color="#94a3b8" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render conversation messages */}
            {messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '86%',
                  padding: '0.75rem 0.95rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  backgroundColor: msg.sender === 'user' ? '#1b4d3e' : 'var(--card-bg, #ffffff)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary, #1e293b)',
                  boxShadow: msg.sender === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px', padding: '0 4px' }}>
                  {msg.sender === 'user' ? (currentUser?.name || 'Tú') : 'Asistente MJ'}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1b4d3e', padding: '0.5rem 0' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={14} />
                </div>
                <span style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-secondary, #64748b)' }}>
                  Consultando manual oficial de {effectiveRole}...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Pregunta sobre el rol ${effectiveRole}...`}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-primary, #1e293b)',
                fontSize: '0.84rem',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#1b4d3e'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color, #cbd5e1)'}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                backgroundColor: '#1b4d3e',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem',
                borderRadius: '8px',
                cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (!inputValue.trim() || isLoading) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Enviar consulta"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
