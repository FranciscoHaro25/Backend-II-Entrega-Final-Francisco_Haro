const express = require("express");
const router = express.Router();
const { redirectIfAuthenticated, logActivity } = require("../middleware/auth");
const userService = require("../services/userService");

// POST /auth/register - Procesar registro de usuario
router.post(
  "/register",
  redirectIfAuthenticated,
  logActivity("Intento de registro"),
  async (req, res) => {
    try {
      const { firstName, lastName, email, age, password } = req.body;

      // Crear usuario usando el servicio
      const newUser = await userService.createUser({
        firstName,
        lastName,
        email,
        age,
        password,
      });

      // Crear sesión
      req.session.user = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        age: newUser.age,
        role: newUser.role,
      };

      console.log(
        `✅ Usuario registrado en MongoDB: ${newUser.email} (${newUser.role})`
      );

      // Redirigir a productos
      res.redirect("/products");
    } catch (error) {
      console.error("Error en registro:", error);
      res.render("register", {
        title: "Registro",
        error: error.message,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age,
      });
    }
  }
);

// POST /auth/login - Procesar login de usuario
router.post(
  "/login",
  redirectIfAuthenticated,
  logActivity("Intento de login"),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Autenticar usuario usando el servicio
      const user = await userService.authenticateUser(email, password);

      // Crear sesión
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        role: user.role,
      };

      console.log(
        `✅ Login exitoso desde MongoDB: ${user.email} (${user.role})`
      );

      // Redirigir a productos
      res.redirect("/products");
    } catch (error) {
      console.error("Error en login:", error);
      res.render("login", {
        title: "Iniciar Sesión",
        error: error.message,
        email: req.body.email,
      });
    }
  }
);

// POST /auth/logout - Cerrar sesión
router.post("/logout", logActivity("Logout"), (req, res) => {
  const userEmail = req.session.user?.email || "Usuario desconocido";

  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.redirect("/products");
    }

    console.log(`👋 Sesión cerrada: ${userEmail}`);
    res.redirect("/login?message=Sesión cerrada correctamente");
  });
});

// GET /auth/logout - Cerrar sesión (alternativa)
router.get("/logout", logActivity("Logout"), (req, res) => {
  const userEmail = req.session.user?.email || "Usuario desconocido";

  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.redirect("/products");
    }

    console.log(`👋 Sesión cerrada: ${userEmail}`);
    res.redirect("/login?message=Sesión cerrada correctamente");
  });
});

// Ruta de desarrollo para ver usuarios registrados (solo en desarrollo)
if (process.env.NODE_ENV !== "production") {
  router.get("/debug/users", async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      const stats = await userService.getUserStats();

      res.json({
        message:
          "Usuarios registrados desde MongoDB Atlas (solo en desarrollo)",
        stats,
        users: users.map((user) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
        })),
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener usuarios",
        details: error.message,
      });
    }
  });
}

module.exports = router;
