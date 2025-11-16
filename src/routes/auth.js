const express = require("express");
const router = express.Router();
const passport = require("passport");
const { redirectIfAuthenticated, logActivity } = require("../middleware/auth");
const userService = require("../services/userService");

// POST /auth/register - Procesar registro de usuario con Passport
router.post(
  "/register",
  redirectIfAuthenticated,
  logActivity("Intento de registro"),
  (req, res, next) => {
    passport.authenticate("local-register", (err, user, info) => {
      if (err) {
        console.error("Error en autenticación de registro:", err);
        return res.render("register", {
          title: "Registro",
          error: "Error interno del servidor",
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          age: req.body.age,
        });
      }

      if (!user) {
        return res.render("register", {
          title: "Registro",
          error: info ? info.message : "Error en el registro",
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          age: req.body.age,
        });
      }

      // Login automático después del registro exitoso
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error creando sesión después del registro:", err);
          return res.render("register", {
            title: "Registro",
            error: "Usuario creado pero error al iniciar sesión",
          });
        }

        console.log(
          `✅ Usuario registrado y logueado: ${user.email} (${user.role})`
        );
        res.redirect("/products");
      });
    })(req, res, next);
  }
);

// POST /auth/login - Procesar login de usuario con Passport
router.post(
  "/login",
  redirectIfAuthenticated,
  logActivity("Intento de login"),
  (req, res, next) => {
    passport.authenticate("local-login", (err, user, info) => {
      if (err) {
        console.error("Error en autenticación de login:", err);
        return res.render("login", {
          title: "Iniciar Sesión",
          error: "Error interno del servidor",
          email: req.body.email,
        });
      }

      if (!user) {
        return res.render("login", {
          title: "Iniciar Sesión",
          error: info ? info.message : "Credenciales incorrectas",
          email: req.body.email,
        });
      }

      // Iniciar sesión con Passport
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error creando sesión:", err);
          return res.render("login", {
            title: "Iniciar Sesión",
            error: "Error al crear la sesión",
            email: req.body.email,
          });
        }

        console.log(`✅ Login exitoso: ${user.email} (${user.role})`);
        res.redirect("/products");
      });
    })(req, res, next);
  }
);

// POST /auth/logout - Cerrar sesión con Passport
router.post("/logout", logActivity("Logout"), (req, res) => {
  const userEmail = req.user?.email || "Usuario desconocido";

  req.logout((err) => {
    if (err) {
      console.error("Error cerrando sesión con Passport:", err);
      return res.redirect("/products");
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destruyendo sesión:", err);
        return res.redirect("/products");
      }

      console.log(`👋 Sesión cerrada: ${userEmail}`);
      res.redirect("/login?message=Sesión cerrada correctamente");
    });
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
          first_name: user.first_name,
          last_name: user.last_name,
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

// ===============================
// RUTAS DE GITHUB OAUTH
// ===============================

// GET /auth/github - Iniciar autenticación con GitHub
router.get("/github", logActivity("Inicio OAuth GitHub"), (req, res, next) => {
  console.log("🚀 Iniciando autenticación con GitHub...");
  passport.authenticate("github", {
    scope: ["user:email"],
  })(req, res, next);
});

// GET /auth/github/callback - Callback de GitHub OAuth
router.get(
  "/github/callback",
  logActivity("Callback OAuth GitHub"),
  (req, res, next) => {
    passport.authenticate(
      "github",
      {
        failureRedirect:
          "/login?error=Error en autenticación con GitHub. Por favor intenta nuevamente.",
        failureFlash: false,
      },
      (err, user, info) => {
        if (err) {
          console.error("❌ Error en callback de GitHub:", err);
          return res.redirect(
            "/login?error=Error interno del servidor durante la autenticación con GitHub"
          );
        }

        if (!user) {
          console.log("❌ Autenticación con GitHub fallida:", info);
          return res.redirect(
            "/login?error=No se pudo completar la autenticación con GitHub"
          );
        }

        // Iniciar sesión manualmente
        req.logIn(user, (err) => {
          if (err) {
            console.error(
              "❌ Error al crear sesión después de GitHub OAuth:",
              err
            );
            return res.redirect(
              "/login?error=Error al iniciar sesión después de autenticación con GitHub"
            );
          }

          console.log(
            `✅ Login exitoso con GitHub: ${user.email} (${user.role}) - ID: ${user._id}`
          );
          res.redirect(
            "/products?message=¡Bienvenido! Has iniciado sesión con GitHub exitosamente"
          );
        });
      }
    )(req, res, next);
  }
);

module.exports = router;
