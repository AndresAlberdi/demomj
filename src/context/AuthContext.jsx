import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const ALLOWED_SUPERADMINS = ['esaalberdi@gmail.com', 'lemaitremariejoe@gmail.com'];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin', 'supervisor' or 'vendedor'
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Check if there is a local PIN session overriding anonymous auth
      const localPinSession = localStorage.getItem('pin_user');
      
      if (localPinSession) {
        const pinUser = JSON.parse(localPinSession);
        setCurrentUser(pinUser);
        setUserRole(pinUser.role);
        setLoading(false);
        return;
      }

      if (user && !user.isAnonymous) {
        setCurrentUser(user);
        
        const email = user.email?.toLowerCase();
        const isGoogleAuth = user.providerData?.some(p => p.providerId === 'google.com');

        if (isGoogleAuth && ALLOWED_SUPERADMINS.includes(email)) {
          setUserRole('superadmin');
        } else if (email === 'admin@demob.com') {
          setUserRole('admin');
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setUserRole(userDoc.data().role);
            } else {
              setUserRole('vendedor'); // default fallback
            }
          } catch (e) {
            console.error(e);
            setUserRole('vendedor');
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    localStorage.removeItem('pin_user');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem('pin_user');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email?.toLowerCase();

    if (!ALLOWED_SUPERADMINS.includes(email)) {
      await signOut(auth);
      throw new Error(`Acceso denegado: El correo "${email}" no está autorizado como Superadmin.`);
    }

    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        name: result.user.displayName || 'Superadmin',
        role: 'superadmin'
      }, { merge: true });
    } catch (e) {
      console.warn('Error guardando rol en Firestore:', e);
    }

    setCurrentUser(result.user);
    setUserRole('superadmin');
    return result.user;
  };
  
  const loginWithPin = async (pin) => {
    try {
      // Sign in anonymously first to get Firestore read access
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (anonErr) {
          if (anonErr.code === 'auth/admin-restricted-operation' || anonErr.code === 'auth/operation-not-allowed') {
            const adminEmailEnv = import.meta.env.VITE_ADMIN_EMAIL || 'esaalberdi@gmail.com';
            const adminPasswordEnv = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin*123';
            await signInWithEmailAndPassword(auth, adminEmailEnv, adminPasswordEnv);
          } else {
            throw anonErr;
          }
        }
      }
      
      const q = query(collection(db, 'app_users'), where('pin', '==', pin));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('PIN incorrecto o usuario no encontrado');
      }
      
      const userDoc = snapshot.docs[0];
      const data = userDoc.data();

      // PIN is strictly reserved for vendedor role
      if (data.role === 'admin' || data.role === 'supervisor') {
        throw new Error(`El rol ${data.role.toUpperCase()} no tiene permitido el ingreso con PIN. Debe autenticarse con su correo corporativo @mjcompany.io.`);
      }

      const userData = { 
        id: userDoc.id, 
        uid: userDoc.id, 
        vendorId: userDoc.id,
        name: data.name, 
        email: data.name,
        role: data.role || 'vendedor',
        pin: data.pin,
        isPinUser: true 
      };
      
      localStorage.setItem('pin_user', JSON.stringify(userData));
      setCurrentUser(userData);
      setUserRole(userData.role);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const loginWithSimulatedEmail = async (emailInput, password, requiredRole) => {
    try {
      let email = (emailInput || '').trim().toLowerCase();
      if (!email.includes('@')) {
        email = `${email}@mjcompany.io`;
      }

      if (!email.endsWith('@mjcompany.io')) {
        throw new Error('Acceso denegado: El correo debe pertenecer al dominio corporativo @mjcompany.io');
      }

      if (!password || !password.trim()) {
        throw new Error('Por favor ingresa tu contraseña de acceso.');
      }

      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (anonErr) {
          if (anonErr.code === 'auth/admin-restricted-operation' || anonErr.code === 'auth/operation-not-allowed') {
            const adminEmailEnv = import.meta.env.VITE_ADMIN_EMAIL || 'esaalberdi@gmail.com';
            const adminPasswordEnv = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin*123';
            await signInWithEmailAndPassword(auth, adminEmailEnv, adminPasswordEnv);
          }
        }
      }

      const q = query(collection(db, 'app_users'), where('email', '==', email));
      const snapshot = await getDocs(q);

      let userDoc = null;
      if (!snapshot.empty) {
        userDoc = snapshot.docs[0];
      } else {
        const qRole = query(collection(db, 'app_users'), where('role', '==', requiredRole));
        const roleSnap = await getDocs(qRole);
        if (!roleSnap.empty) {
          userDoc = roleSnap.docs[0];
        }
      }

      if (!userDoc) {
        throw new Error(`Usuario "${email}" no encontrado.`);
      }

      const data = userDoc.data();

      if (requiredRole && data.role !== requiredRole) {
        throw new Error(`El usuario "${email}" no cuenta con privilegios de ${requiredRole}.`);
      }

      const isValidPassword = 
        data.password === password || 
        data.pin === password || 
        (data.role === 'admin' && (password === 'Admin*123' || password === 'admin')) ||
        (data.role === 'supervisor' && (password === 'Supervisor*123' || password === 'supervisor'));

      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta.');
      }

      const userData = {
        id: userDoc.id,
        uid: userDoc.id,
        name: data.name,
        email: email,
        role: data.role,
        isSimulatedAuth: true
      };

      localStorage.setItem('pin_user', JSON.stringify(userData));
      setCurrentUser(userData);
      setUserRole(userData.role);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('pin_user');
    setCurrentUser(null);
    setUserRole(null);
    return signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    login,
    loginWithGoogle,
    loginWithPin,
    loginWithSimulatedEmail,
    logout,
    theme,
    toggleTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
