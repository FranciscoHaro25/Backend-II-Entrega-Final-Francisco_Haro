const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/sessions/login - Login con JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
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

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      status: "success",
      message: "Login exitoso",
      access_token: token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// GET /api/sessions/current - Validar usuario logueado y devolver datos del JWT
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      // Si la autenticación JWT es exitosa, req.user contiene los datos del usuario
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Token JWT inválido o expirado",
        });
      }

      // Devolver datos del usuario asociados al JWT
      res.json({
        status: "success",
        message: "Usuario autenticado correctamente",
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
          role: user.role,
          cart: user.cart,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("Error en /current:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  }
);

// POST /api/sessions/logout - Logout (limpiar cookies si se usan)
router.post("/logout", (req, res) => {
  // Limpiar cookie si existe
  res.clearCookie("currentUser");

  res.json({
    status: "success",
    message: "Logout exitoso",
  });
});

// POST /api/sessions/register - Registro de usuario con JWT
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password, age } = req.body;

    // Validar campos requeridos
    if (!first_name || !last_name || !email || !password || !age) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Encriptar contraseña usando hashSync como especifica la consigna
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      age: parseInt(age),
      role: "user", // Valor por defecto según consigna
    });

    const savedUser = await newUser.save();

    // Generar JWT para login automático
    const tokenPayload = {
      id: savedUser._id,
      email: savedUser.email,
      first_name: savedUser.first_name,
      last_name: savedUser.last_name,
      role: savedUser.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      status: "success",
      message: "Usuario registrado exitosamente",
      access_token: token,
      user: {
        id: savedUser._id,
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        email: savedUser.email,
        age: savedUser.age,
        role: savedUser.role,
        cart: savedUser.cart,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
