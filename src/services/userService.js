const User = require("../models/User");
const {
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword,
} = require("../utils/auth");

/**
 * Servicio de usuarios para MongoDB Atlas
 * Maneja todas las operaciones CRUD de usuarios en la base de datos backendII
 */
class UserService {
  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado o error
   */
  async createUser(userData) {
    try {
      const { firstName, lastName, email, password, age } = userData;

      // Validaciones
      if (!firstName || !lastName || !email || !password || !age) {
        throw new Error("Todos los campos son obligatorios");
      }

      if (!validateEmail(email)) {
        throw new Error("Formato de email inválido");
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        throw new Error("La edad debe ser un número entre 18 y 120 años");
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error("Ya existe una cuenta con este correo electrónico");
      }

      // Encriptar contraseña
      const hashedPassword = await hashPassword(password);

      // Crear usuario
      const newUser = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        age: ageNum,
        role: email.toLowerCase() === "admincoder@coder.com" ? "admin" : "user",
      });

      const savedUser = await newUser.save();

      console.log(
        `✅ Usuario creado exitosamente en MongoDB Atlas: ${savedUser.email} (${savedUser.role})`
      );

      // Retornar datos sin contraseña
      return {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        age: savedUser.age,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      };
    } catch (error) {
      console.error(
        "❌ Error al crear usuario en MongoDB Atlas:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Autenticar usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} - Usuario autenticado o error
   */
  async authenticateUser(email, password) {
    try {
      if (!email || !password) {
        throw new Error("Email y contraseña son obligatorios");
      }

      if (!validateEmail(email)) {
        throw new Error("Formato de email inválido");
      }

      // Buscar usuario en la base de datos
      const user = await User.findByEmail(email);

      if (!user) {
        // Manejo especial para admin si no existe
        if (
          email.toLowerCase() === "admincoder@coder.com" &&
          password === "admin123"
        ) {
          return await this.createAdminUser();
        }
        throw new Error("Credenciales incorrectas");
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        throw new Error("Cuenta desactivada. Contacta al administrador");
      }

      // Verificar contraseña
      const isValidPassword = await comparePassword(password, user.password);

      // Manejo especial para admin con contraseña directa
      if (
        !isValidPassword &&
        email.toLowerCase() === "admincoder@coder.com" &&
        password === "admin123"
      ) {
        // Actualizar contraseña hasheada
        user.password = await hashPassword("admin123");
        await user.save();
      } else if (!isValidPassword) {
        throw new Error("Credenciales incorrectas");
      }

      // Actualizar último login
      await user.updateLastLogin();

      console.log(
        `✅ Login exitoso desde MongoDB Atlas: ${user.email} (${user.role})`
      );

      // Retornar datos del usuario sin contraseña
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        role: user.role,
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      console.error(
        "❌ Error en autenticación con MongoDB Atlas:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Crear usuario administrador por defecto
   * @returns {Promise<Object>} - Usuario admin creado
   */
  async createAdminUser() {
    try {
      const hashedPassword = await hashPassword("admin123");

      const adminUser = new User({
        firstName: "Admin",
        lastName: "Coder",
        email: "adminCoder@coder.com",
        password: hashedPassword,
        age: 30,
        role: "admin",
      });

      const savedUser = await adminUser.save();
      console.log(
        `✅ Usuario admin creado en MongoDB Atlas: ${savedUser.email}`
      );

      return {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        age: savedUser.age,
        role: savedUser.role,
      };
    } catch (error) {
      console.error("❌ Error al crear admin en MongoDB Atlas:", error.message);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} - Datos del usuario
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      return user;
    } catch (error) {
      console.error(
        "❌ Error al obtener usuario desde MongoDB Atlas:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios (para debug)
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async getAllUsers() {
    try {
      const users = await User.find({}, "-password").sort({ createdAt: -1 });
      return users;
    } catch (error) {
      console.error(
        "❌ Error al obtener usuarios desde MongoDB Atlas:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} - Estadísticas
   */
  async getUserStats() {
    try {
      const stats = await User.getStats();
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      return {
        totalUsers,
        activeUsers,
        recentUsers,
        usersByRole: stats,
      };
    } catch (error) {
      console.error(
        "❌ Error al obtener estadísticas desde MongoDB Atlas:",
        error.message
      );
      throw error;
    }
  }
}

module.exports = new UserService();
