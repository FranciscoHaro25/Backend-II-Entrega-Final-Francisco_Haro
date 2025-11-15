const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔍 DIAGNÓSTICO DE CONEXIÓN MONGODB ATLAS");
console.log("=====================================");
console.log("🔗 MONGO_URI:", process.env.MONGO_URI);
console.log("👤 Usuario:", process.env.MONGO_USER);
console.log("🏠 Cluster:", process.env.MONGO_CLUSTER_URL);
console.log("💾 Base de datos:", process.env.MONGO_DB_NAME);
console.log("=====================================");

async function testConnection() {
  try {
    console.log("🚀 Intentando conectar a MongoDB Atlas...");

    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ ¡ÉXITO! Conectado a MongoDB Atlas");
    console.log("📊 Base de datos:", connection.connection.name);
    console.log("🌐 Host:", connection.connection.host);
    console.log("⚡ Estado:", connection.connection.readyState);

    // Hacer un ping de prueba
    await mongoose.connection.db.admin().ping();
    console.log("🏓 Ping exitoso a la base de datos");

    // Listar colecciones
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📁 Colecciones disponibles:",
      collections.map((c) => c.name)
    );

    await mongoose.connection.close();
    console.log("👋 Conexión cerrada correctamente");
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN:");
    console.error("Tipo:", error.name);
    console.error("Mensaje:", error.message);
    console.error("Código:", error.code);

    if (error.code === "ENOTFOUND") {
      console.log("\n🔧 SOLUCIONES POSIBLES:");
      console.log("1. Verifica que el cluster esté activo en MongoDB Atlas");
      console.log("2. Confirma que la URL del cluster sea correcta");
      console.log("3. Verifica tu conexión a internet");
    }

    if (error.code === 8000) {
      console.log("\n🔧 PROBLEMA DE AUTENTICACIÓN:");
      console.log("1. Verifica el usuario y contraseña");
      console.log("2. Confirma que el usuario tenga permisos");
    }

    process.exit(1);
  }
}

testConnection();
