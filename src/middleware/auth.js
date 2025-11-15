/**
 * Middleware para verificar si el usuario está autenticado
 * Protege rutas que requieren login
 */
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect(
      "/login?message=Debes iniciar sesión para acceder a esta página"
    );
  }
  next();
};

/**
 * Middleware para verificar si el usuario es administrador
 * Solo permite acceso a usuarios con rol 'admin'
 */
const requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect(
      "/login?message=Debes iniciar sesión para acceder a esta página"
    );
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", {
      title: "Acceso denegado",
      message: "No tienes permisos para acceder a esta sección.",
      statusCode: 403,
    });
  }

  next();
};

/**
 * Middleware para redirigir usuarios ya autenticados
 * Evita que vean páginas de login/register si ya están logueados
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/products");
  }
  next();
};

/**
 * Middleware para agregar información del usuario a las vistas
 * Permite acceso a datos del usuario en todos los templates
 */
const addUserToViews = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === "admin";
  next();
};

/**
 * Middleware para logging de actividades de autenticación
 */
const logActivity = (action) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userInfo = req.session.user
      ? `Usuario: ${req.session.user.email} (${req.session.user.role})`
      : "Usuario no autenticado";

    console.log(`[${timestamp}] ${action} - ${userInfo} - IP: ${req.ip}`);
    next();
  };
};

module.exports = {
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated,
  addUserToViews,
  logActivity,
};
