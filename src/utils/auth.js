const bcrypt = require("bcrypt");

/**
 * Encripta una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña encriptada
 */
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error("Error al encriptar la contraseña");
  }
};

/**
 * Compara una contraseña en texto plano con su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña encriptada
 * @returns {Promise<boolean>} - Verdadero si coinciden
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Error al comparar contraseñas");
  }
};

/**
 * Valida el formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - Verdadero si el formato es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida la fortaleza de la contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - Objeto con isValid y mensaje
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 6 caracteres",
    };
  }

  return {
    isValid: true,
    message: "Contraseña válida",
  };
};

/**
 * Sanitiza datos de entrada del usuario
 * @param {string} input - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input.trim().toLowerCase();
};

module.exports = {
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword,
  sanitizeInput,
};
