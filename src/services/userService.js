const User = require("../models/User");
const bcrypt = require("bcrypt");

// Servicio simple para operaciones de usuarios
class UserService {
  // Crear usuario
  async createUser(userData) {
    const {
      first_name,
      last_name,
      email,
      password,
      age,
      role = "user",
    } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("Este email ya está registrado");
    }

    // Encriptar contraseña con bcrypt.hashSync como pide la consigna
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear usuario
    const user = new User({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      age: parseInt(age),
      role: role,
    });

    return await user.save();
  }

  // Buscar usuario por email
  async findUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    return await User.find({}).select("-password");
  }
}

module.exports = new UserService();
