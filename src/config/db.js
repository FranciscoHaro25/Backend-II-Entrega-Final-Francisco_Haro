const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Configuración y conexión a MongoDB Atlas
 * Base de datos: backendII
 * Cluster: ClusterBackend
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Conectar a MongoDB Atlas
   */
  async connectDB() {
    try {
      // Configuración optimizada para MongoDB Atlas (sin opciones deprecadas)
      const mongoOptions = {
        serverSelectionTimeoutMS: 10000, // 10 segundos timeout
        socketTimeoutMS: 45000, // 45 segundos socket timeout
        maxPoolSize: 10, // Máximo 10 conexiones concurrentes
        minPoolSize: 2, // Mínimo 2 conexiones en el pool
        maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30 segundos
        heartbeatFrequencyMS: 10000, // Heartbeat cada 10 segundos
      };

      // Conectar usando MONGO_URL del .env
      this.connection = await mongoose.connect(
        process.env.MONGO_URL,
        mongoOptions
      );
      this.isConnected = true;

      // Logs de conexión exitosa
      console.log("✅ Conectado a MongoDB Atlas:", process.env.MONGO_DB_NAME);
      console.log(`📊 Base de datos: ${this.connection.connection.name}`);
      console.log(`🌐 Cluster: ClusterBackend`);
      console.log(`🏠 Host: ${this.connection.connection.host}`);

      // Configurar eventos de la conexión
      this.setupConnectionEvents();

      return this.connection;
    } catch (error) {
      console.error("🍃 ===============================================");
      console.error("❌ ERROR AL CONECTAR CON MONGODB ATLAS");
      console.error("🍃 ===============================================");
      console.error("💥 Error:", error.message);
      console.error("🔧 Verifica las credenciales y la conexión a internet");
      console.error("🍃 ===============================================");

      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Configurar eventos de conexión
   */
  setupConnectionEvents() {
    // Evento de error
    mongoose.connection.on("error", (error) => {
      console.error("❌ Error de conexión a MongoDB Atlas:", error.message);
      this.isConnected = false;
    });

    // Evento de desconexión
    mongoose.connection.on("disconnected", () => {
      console.log("🔌 Desconectado de MongoDB Atlas");
      this.isConnected = false;
    });

    // Evento de reconexión
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Reconectado a MongoDB Atlas exitosamente");
      this.isConnected = true;
    });

    // Evento de conexión perdida
    mongoose.connection.on("disconnecting", () => {
      console.log("⚠️  Perdiendo conexión con MongoDB Atlas...");
    });

    // Cerrar conexión al terminar la aplicación
    process.on("SIGINT", async () => {
      await this.disconnectDB();
      console.log("👋 Aplicación terminada correctamente");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnectDB();
      console.log("👋 Aplicación terminada por SIGTERM");
      process.exit(0);
    });
  }

  /**
   * Desconectar de MongoDB Atlas
   */
  async disconnectDB() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.connection.close();
        console.log("🍃 Desconectado de MongoDB Atlas correctamente");
        this.isConnected = false;
        this.connection = null;
      }
    } catch (error) {
      console.error("❌ Error al desconectar de MongoDB:", error.message);
    }
  }

  /**
   * Obtener estado de la conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      readyStateText: this.getReadyStateText(),
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: Object.keys(mongoose.connection.collections || {}),
    };
  }

  /**
   * Convertir readyState a texto legible
   */
  getReadyStateText() {
    const states = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };
    return states[mongoose.connection.readyState] || "Unknown";
  }

  /**
   * Verificar que la conexión esté activa
   */
  async pingDatabase() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error("❌ Ping a MongoDB falló:", error.message);
      return false;
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getDatabaseStats() {
    try {
      if (!this.isConnected) {
        throw new Error("No hay conexión activa a la base de datos");
      }

      const stats = await mongoose.connection.db.stats();
      return {
        database: stats.db,
        collections: stats.collections,
        documents: stats.objects,
        dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
        storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
        indexes: stats.indexes,
        indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error.message);
      return null;
    }
  }
}

// Crear instancia singleton de la conexión
const dbConnection = new DatabaseConnection();

/**
 * Función principal para conectar a la base de datos
 * Esta es la función que se debe importar y usar en app.js
 */
const connectDB = async () => {
  return await dbConnection.connectDB();
};

/**
 * Función para desconectar
 */
const disconnectDB = async () => {
  return await dbConnection.disconnectDB();
};

/**
 * Función para obtener el estado de la conexión
 */
const getConnectionStatus = () => {
  return dbConnection.getConnectionStatus();
};

/**
 * Función para hacer ping a la base de datos
 */
const pingDatabase = async () => {
  return await dbConnection.pingDatabase();
};

/**
 * Función para obtener estadísticas
 */
const getDatabaseStats = async () => {
  return await dbConnection.getDatabaseStats();
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  pingDatabase,
  getDatabaseStats,
  dbConnection,
};
