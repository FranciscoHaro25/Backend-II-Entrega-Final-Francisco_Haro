const mongoose = require("mongoose");
require("dotenv").config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Configuración de conexión optimizada para MongoDB Atlas
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 segundos
        socketTimeoutMS: 45000, // 45 segundos
        maxPoolSize: 10, // Mantener hasta 10 conexiones de socket
        minPoolSize: 5, // Mantener al menos 5 conexiones de socket
        maxIdleTimeMS: 30000, // Cerrar conexiones después de 30 segundos de inactividad
      }; // Conectar a MongoDB Atlas
      this.connection = await mongoose.connect(
        process.env.MONGODB_URI,
        options
      );
      this.isConnected = true;

      console.log("🍃 Conectado exitosamente a MongoDB Atlas");
      console.log(`📊 Base de datos: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}`);

      // Eventos de conexión
      mongoose.connection.on("error", (error) => {
        console.error("❌ Error de conexión a MongoDB:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("🔌 Desconectado de MongoDB Atlas");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 Reconectado a MongoDB Atlas");
        this.isConnected = true;
      });

      // Cerrar conexión cuando la aplicación se cierre
      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error("❌ Error al conectar con MongoDB Atlas:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log("👋 Desconectado de MongoDB Atlas correctamente");
        this.isConnected = false;
      }
    } catch (error) {
      console.error("❌ Error al desconectar de MongoDB:", error);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    };
  }

  async createInitialAdminUser() {
    try {
      const User = require("../models/User");
      const { hashPassword } = require("../utils/auth");

      // Verificar si ya existe el usuario admin
      const existingAdmin = await User.findByEmail("adminCoder@coder.com");

      if (!existingAdmin) {
        const hashedPassword = await hashPassword("admin123");

        const adminUser = new User({
          firstName: "Admin",
          lastName: "Coder",
          email: "adminCoder@coder.com",
          password: hashedPassword,
          age: 30,
          role: "admin",
        });

        await adminUser.save();
        console.log("👤 Usuario administrador creado exitosamente");
      } else {
        console.log("👤 Usuario administrador ya existe");
      }
    } catch (error) {
      console.error("❌ Error al crear usuario administrador:", error);
    }
  }

  async getDBStats() {
    try {
      const User = require("../models/User");
      const stats = await User.getStats();
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });

      return {
        totalUsers,
        activeUsers,
        usersByRole: stats,
        connectionStatus: this.getConnectionStatus(),
      };
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error);
      return null;
    }
  }
}

// Crear instancia singleton
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
