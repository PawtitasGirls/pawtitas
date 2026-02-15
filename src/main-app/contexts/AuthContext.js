import React, { createContext, useContext, useMemo, useState } from 'react';
import { normalizeRole, ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    role: null,
    token: null,
    tokenStream: null, 
  });

  const setAuthFromLogin = (loginResponse) => {
    const role = normalizeRole(loginResponse?.userData?.rol, loginResponse?.admin);
    const token = loginResponse?.token || null;
    const tokenStream = loginResponse?.tokenStream ?? null; // 👈 leído del backend

    if (loginResponse?.admin) {
      setAuth({
        user: loginResponse?.userData || { id: null },
        role: ROLES.ADMIN,
        token,
        tokenStream,
      });
      return;
    }

    setAuth({
      user: loginResponse?.userData || null,
      role,
      token,
      tokenStream,
    });
  };

  const updateUser = (nextUser) => {
    setAuth((prev) => ({
      ...prev,
      user: nextUser ? { ...(prev.user || {}), ...nextUser } : prev.user,
    }));
  };

  const clearAuth = () =>
    setAuth({
      user: null,
      role: null,
      token: null,
      tokenStream: null, // 👈 importante limpiar
    });

  const value = useMemo(
    () => ({
      ...auth,              // 👈 expone user, role, token y tokenStream
      setAuthFromLogin,
      clearAuth,
      updateUser,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
