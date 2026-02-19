export const ROLES = {
  DUENIO: 'duenio',
  PRESTADOR: 'prestador',
  ADMIN: 'admin',
};

export const ROLE_BLOCKED_ROUTES = {
  [ROLES.DUENIO]: [
    'PanelAdmin', 
    'ValidarUsuario'
  ],
  [ROLES.PRESTADOR]: [
    'PanelAdmin',
    'ValidarUsuario',
    'Cuidadores',
    'Paseadores',
    'Salud',
    'Mapa',
  ],
  [ROLES.ADMIN]: [
    'Mapa', 
    'Chat', 
    'Conversacion', 
    'MisConexiones', 
    'Resenas',
    'ResenasRecibidas',
  ],
};

export const normalizeRole = (backendRole, isAdmin = false) => {
  if (isAdmin) return ROLES.ADMIN;
  if (!backendRole) return null;

  const roleUpper = String(backendRole).toUpperCase();
  if (roleUpper === 'DUENIO') return ROLES.DUENIO;
  if (roleUpper === 'PRESTADOR') return ROLES.PRESTADOR;
  if (roleUpper === 'ADMIN') return ROLES.ADMIN;

  return null;
};

export const isRouteAllowed = (role, routeName) => {
  if (!role) return true;
  const blocked = ROLE_BLOCKED_ROUTES[role] || [];
  return !blocked.includes(routeName);
};

