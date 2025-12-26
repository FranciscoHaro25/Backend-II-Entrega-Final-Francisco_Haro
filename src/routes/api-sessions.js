const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const UserDTO = require("../dto/user.dto");
const userRepository = require("../repositories/user.repository");
const { sendPasswordResetEmail } = require("../services/mail.service");

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
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// GET /api/sessions/current - Validar usuario logueado y devolver DTO
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Token JWT inválido o expirado",
        });
      }

      // Usar DTO para no enviar información sensible
      res.json({
        status: "success",
        message: "Usuario autenticado correctamente",
        user: UserDTO.fromUser(user),
      });
    } catch (error) {
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
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// POST /api/sessions/forgot-password - Solicitar recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.render("forgot-password", {
        title: "Recuperar Contraseña",
        error: "El email es requerido",
      });
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return res.render("forgot-password", {
        title: "Recuperar Contraseña",
        success: true,
        message:
          "Si el email existe, recibirás un correo con las instrucciones",
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = Date.now() + 3600000; // 1 hora

    await userRepository.setResetToken(user._id, resetToken, resetExpires);

    // Enviar email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (mailError) {
      console.log("Error al enviar email:", mailError.message);
    }

    res.render("forgot-password", {
      title: "Recuperar Contraseña",
      success: true,
      message:
        "Te enviamos un correo con las instrucciones para restablecer tu contraseña",
    });
  } catch (error) {
    res.render("forgot-password", {
      title: "Recuperar Contraseña",
      error: "Error interno del servidor",
    });
  }
});

// POST /api/sessions/reset-password/:token - Restablecer contraseña
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password) {
      return res.render("reset-password", {
        title: "Restablecer Contraseña",
        token,
        error: "La nueva contraseña es requerida",
      });
    }

    if (password !== confirmPassword) {
      return res.render("reset-password", {
        title: "Restablecer Contraseña",
        token,
        error: "Las contraseñas no coinciden",
      });
    }

    if (password.length < 6) {
      return res.render("reset-password", {
        title: "Restablecer Contraseña",
        token,
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await userRepository.findByResetToken(token);
    if (!user) {
      return res.render("reset-password", {
        title: "Restablecer Contraseña",
        token,
        error: "El enlace de recuperación es inválido o ha expirado",
      });
    }

    // Verificar que no sea la misma contraseña
    if (await userRepository.isSamePassword(user, password)) {
      return res.render("reset-password", {
        title: "Restablecer Contraseña",
        token,
        error: "La nueva contraseña no puede ser igual a la anterior",
      });
    }

    await userRepository.changePassword(user._id, password);

    // Redirigir al login con mensaje de éxito
    res.redirect(
      "/login?message=Contraseña actualizada correctamente. Ya puedes iniciar sesión."
    );
  } catch (error) {
    res.render("reset-password", {
      title: "Restablecer Contraseña",
      token: req.params.token,
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
