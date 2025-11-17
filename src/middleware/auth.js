/**
 * Middleware para verificar si el usuario está autenticado
 * Protege rutas que requieren login (compatible con Passport)
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect(
      "/login?message=Debes iniciar sesión para acceder a esta página"
    );
  }
  next();
};

/**
 * Middleware para verificar si el usuario es administrador
 * Solo permite acceso a usuarios con rol 'admin' (compatible con Passport)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect(
      "/login?message=Debes iniciar sesión para acceder a esta página"
    );
  }

  if (req.user.role !== "admin") {
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
 * Evita que vean páginas de login/register si ya están logueados (compatible con Passport)
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.user) {
    return res.redirect("/products");
  }
  next();
};

/**
 * Middleware para agregar información del usuario a las vistas
 * Permite acceso a datos del usuario en todos los templates (compatible con Passport)
 */
const addUserToViews = (req, res, next) => {
  if (req.user) {
    // Convertir usuario a objeto plano para evitar problemas con Handlebars
    res.locals.user = req.user.toObject ? req.user.toObject() : req.user;
    res.locals.isAuthenticated = true;
    res.locals.isAdmin = req.user.role === "admin";
  } else {
    res.locals.user = null;
    res.locals.isAuthenticated = false;
    res.locals.isAdmin = false;
  }
  next();
};

/**
 * Middleware para logging de actividades de autenticación (compatible con Passport)
 */
const logActivity = (action) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userInfo = req.user
      ? `Usuario: ${req.user.email} (${req.user.role})`
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
