const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware para verificar JWT desde cookie
const verifyJWT = (req, res, next) => {
  const token = req.signedCookies.currentUser;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verificando JWT:", error);
    res.clearCookie("currentUser");
    req.user = null;
    next();
  }
};

// Middleware para requerir autenticación
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  next();
};

// Middleware para redirigir si ya está autenticado
const redirectIfAuthenticated = (req, res, next) => {
  if (req.user) {
    return res.redirect("/users/current");
  }
  next();
};

// Aplicar middleware de JWT a todas las rutas
router.use(verifyJWT);

// GET /users/login - Vista de login
router.get("/login", redirectIfAuthenticated, (req, res) => {
  const error = req.query.error;

  res.render("jwt-login", {
    title: "Login - Actividad 4.4",
    error: error,
    layout: "main",
  });
});

// POST /users/login - Procesar login (redirección desde vista)
router.post("/login", redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hacer petición a la API interna
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      // Extraer token de la respuesta (necesitamos una forma de obtenerlo)
      // Por ahora, haremos la lógica directamente aquí
      const bcrypt = require("bcrypt");
      const User = require("../models/User");
      const jwt = require("jsonwebtoken");

      // Buscar usuario
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.redirect("/users/login?error=Login failed!");
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.redirect("/users/login?error=Login failed!");
      }

      // Generar JWT
      const tokenPayload = {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Almacenar JWT en cookie firmada
      res.cookie("currentUser", token, {
        signed: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        secure: process.env.NODE_ENV === "production",
      });

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      res.redirect("/users/current");
    } else {
      res.redirect("/users/login?error=Login failed!");
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.redirect("/users/login?error=Login failed!");
  }
});

// GET /users/current - Vista de usuario actual (protegida)
router.get("/current", requireAuth, (req, res) => {
  res.render("current-user", {
    title: "Usuario Actual - Actividad 4.4",
    user: req.user,
    layout: "main",
  });
});

// POST /users/logout - Cerrar sesión
router.post("/logout", (req, res) => {
  res.clearCookie("currentUser");
  res.redirect("/users/login");
});

module.exports = router;
