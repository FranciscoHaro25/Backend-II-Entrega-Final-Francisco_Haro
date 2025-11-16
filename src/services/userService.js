const User = require("../models/User");
const bcrypt = require("bcrypt");

/**
 * Servicio de usuarios refactorizado para trabajar con Passport.js
 * Elimina credenciales hardcodeadas y lógica manual de autenticación
 */
class UserService {
  /**
   * Crear nuevo usuario con validaciones
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado
   */
  async createUser(userData) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        age,
        role = "user",
      } = userData;

      // Validaciones básicas
      if (
        !firstName ||
        !lastName ||
        !email ||
        (!password && !userData.githubId) ||
        !age
      ) {
        throw new Error("Todos los campos son obligatorios");
      }

      if (!this.validateEmail(email)) {
        throw new Error("Formato de email inválido");
      }

      if (age < 18 || age > 120) {
        throw new Error("La edad debe estar entre 18 y 120 años");
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error("Este email ya está registrado");
      }

      // Hashear contraseña si se proporciona
      let hashedPassword = null;
      if (password) {
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Crear usuario
      const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        age: parseInt(age),
        role: role,
        githubId: userData.githubId || null,
        githubUsername: userData.githubUsername || null,
      });

      const savedUser = await user.save();
      console.log(
        `✅ Usuario creado en MongoDB Atlas: ${savedUser.email} (${savedUser.role})`
      );

      // Retornar usuario sin password
      return {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        age: savedUser.age,
        role: savedUser.role,
        githubUsername: savedUser.githubUsername,
        createdAt: savedUser.createdAt,
      };
    } catch (error) {
      console.error("❌ Error al crear usuario:", error.message);
      throw error;
    }
  }

  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error("Error buscando usuario por email:", error);
      throw error;
    }
  }

  /**
   * Buscar usuario por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error("Error buscando usuario por ID:", error);
      throw error;
    }
  }

  /**
   * Buscar usuario por GitHub ID
   * @param {string} githubId - ID de GitHub
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  async findUserByGithubId(githubId) {
    try {
      return await User.findOne({ githubId });
    } catch (error) {
      console.error("Error buscando usuario por GitHub ID:", error);
      throw error;
    }
  }

  /**
   * Verificar contraseña
   * @param {string} plainPassword - Contraseña en texto plano
   * @param {string} hashedPassword - Contraseña hasheada
   * @returns {Promise<boolean>} - True si coincide
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Error verificando contraseña:", error);
      return false;
    }
  }

  /**
   * Crear usuario administrador desde variables de entorno
   * Solo se ejecuta si no existe ningún admin y hay variables configuradas
   */
  async createAdminUserFromEnv() {
    // COMENTADO: No crear usuarios automáticamente
    // Todos los usuarios deben venir desde la base de datos
    console.log(
      "ℹ️ Creación automática de admin deshabilitada - usar base de datos"
    );
    return null;
  }

  /**
   * Obtener todos los usuarios (para debugging/admin)
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async getAllUsers() {
    try {
      const users = await User.find({}, { password: 0 }); // Excluir password
      return users;
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw error;
    }
  }

  /**
   * Actualizar último login
   * @param {string} userId - ID del usuario
   */
  async updateLastLogin(userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    } catch (error) {
      console.error("Error actualizando último login:", error);
    }
  }

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} - True si es válido
   */
  validateEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} - Estadísticas
   */
  async getUserStats() {
    try {
      const totalUsers = await User.countDocuments();
      const adminUsers = await User.countDocuments({ role: "admin" });
      const githubUsers = await User.countDocuments({
        githubId: { $exists: true, $ne: null },
      });
      const activeUsers = await User.countDocuments({ isActive: true });

      return {
        total: totalUsers,
        admins: adminUsers,
        githubUsers: githubUsers,
        active: activeUsers,
        regular: totalUsers - adminUsers,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const userService = new UserService();

// Crear admin automáticamente al importar el servicio (si no existe)
userService.createAdminUserFromEnv().catch(console.error);

module.exports = userService;
