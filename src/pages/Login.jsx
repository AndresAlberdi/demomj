import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Loader2, KeyRound, UserCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('pin'); // 'pin', 'supervisor', 'admin' or 'superadmin'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { loginWithGoogle, loginWithPin, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuperadminSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al autenticar con Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await loginWithPin(pin);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión con PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="logo-container" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img 
              src="/logo.png" 
              alt="MJ-Company Logo" 
              style={{ width: '88px', height: '88px', borderRadius: '18px', objectFit: 'contain', background: 'rgba(255,255,255,0.95)', padding: '6px', boxShadow: '0 4px 14px rgba(33,87,55,0.15)' }} 
            />
          </div>
          <h1>
            MJ-Company
            {import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'snack-laestacion' && (
              <span className="demo-badge" style={{ 
                marginLeft: '8px', 
                fontSize: '13px', 
                background: '#1b4d3e', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                verticalAlign: 'middle',
                display: 'inline-block'
              }}>DEMO</span>
            )}
          </h1>
          <p>Sistema de Control, Inventario & POS</p>
        </div>
        
        <div className="tabs" style={{marginBottom: '1.5rem', display: 'flex', gap: '0.25rem'}}>
          <div className={`tab ${loginMethod === 'pin' ? 'active' : ''}`} onClick={() => setLoginMethod('pin')} style={{fontSize: '0.85rem', padding: '0.5rem'}}>
            <KeyRound size={14} style={{display: 'inline', marginRight: '0.25rem'}}/> Vendedor
          </div>
          <div className={`tab ${loginMethod === 'supervisor' ? 'active' : ''}`} onClick={() => setLoginMethod('supervisor')} style={{fontSize: '0.85rem', padding: '0.5rem'}}>
            <KeyRound size={14} style={{display: 'inline', marginRight: '0.25rem'}}/> Supervisor
          </div>
          <div className={`tab ${loginMethod === 'admin' ? 'active' : ''}`} onClick={() => setLoginMethod('admin')} style={{fontSize: '0.85rem', padding: '0.5rem'}}>
            <KeyRound size={14} style={{display: 'inline', marginRight: '0.25rem'}}/> Admin
          </div>
          <div className={`tab ${loginMethod === 'superadmin' ? 'active' : ''}`} onClick={() => setLoginMethod('superadmin')} style={{fontSize: '0.85rem', padding: '0.5rem', cursor: 'pointer'}} title="Superadmin">
            ⚙️ Superadmin
          </div>
        </div>

        {error && <div className="error-message" style={{marginBottom: '1.25rem'}}>{error}</div>}
        
        {/* Superadmin Panel - EXCLUSIVAMENTE CON GOOGLE */}
        {loginMethod === 'superadmin' && (
          <div className="superadmin-auth-panel" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <ShieldCheck size={36} style={{ color: '#215737', margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Acceso Restringido a Superadministración</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Solo se permite el ingreso con cuentas Google autorizadas
              </p>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSuperadminSubmit}
              className="btn btn-block google-signin-btn"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? (
                <span className="flex-center">
                  <Loader2 className="spinner" size={18} style={{marginRight: '0.5rem'}} /> Conectando con Google...
                </span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>
          </div>
        )}

        {/* PIN Form para Vendedor, Supervisor y Admin */}
        <form 
          onSubmit={handlePinSubmit}
          style={{ display: (loginMethod === 'pin' || loginMethod === 'supervisor' || loginMethod === 'admin') ? 'block' : 'none' }}
        >
          <div className="form-group">
            <label htmlFor="vendor-pin">PIN de Acceso</label>
            <input 
              id="vendor-pin"
              name="pin"
              type="password" 
              className="input-field" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              maxLength="6"
              required={loginMethod === 'pin' || loginMethod === 'supervisor' || loginMethod === 'admin'}
              style={{textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25rem'}}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isSubmitting || pin.length < 6}
          >
            {isSubmitting ? (
              <span className="flex-center"><Loader2 className="spinner" size={18} style={{marginRight: '0.5rem'}} /> Iniciando...</span>
            ) : (
              loginMethod === 'admin' ? 'Ingresar como Administrador' : (loginMethod === 'supervisor' ? 'Ingresar como Supervisor' : 'Ingresar al POS')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
