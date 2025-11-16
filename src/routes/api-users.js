const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// CRUD para usuarios - API REST

// GET /api/users - Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// POST /api/users - Crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, password, role = "user" } = req.body;

    // Validar campos requeridos
    if (!first_name || !last_name || !email || !password) {
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

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = new User({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      age: req.body.age || 25, // Campo requerido por el schema
      role: role,
    });

    const savedUser = await newUser.save();

    // Retornar usuario sin contraseña
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      message: "Usuario creado exitosamente",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;

    const updateData = {};
    if (first_name) updateData.first_name = first_name.trim();
    if (last_name) updateData.last_name = last_name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// POST /api/users/login - Autenticación con JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
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

    res.json({
      status: "success",
      message: "Login exitoso",
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
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

// POST /api/users/logout - Cerrar sesión
router.post("/logout", (req, res) => {
  res.clearCookie("currentUser");
  res.json({
    status: "success",
    message: "Logout exitoso",
  });
});

module.exports = router;
