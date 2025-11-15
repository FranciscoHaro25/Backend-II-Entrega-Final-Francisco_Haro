const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
require("dotenv").config();

// Importar configuración de base de datos
const { connectDB } = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const viewRoutes = require("./routes/views");

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar conexión a MongoDB Atlas
async function initializeDatabase() {
  try {
    await connectDB();
    console.log("🚀 Base de datos inicializada correctamente");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB Atlas:", error.message);
    console.log("⚠️  Continuando en modo desarrollo temporal");
    console.log(
      "🔧 Para usar MongoDB Atlas, resuelve los problemas de conectividad de red"
    );
    console.log(
      "🚀 Servidor iniciado - las funciones básicas están disponibles"
    );
  }
}

// Configuración de Handlebars
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      eq: function (a, b) {
        return a === b;
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Configuración de sesiones con MongoDB Atlas
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      dbName: "backendII",
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 horas
      touchAfter: 24 * 3600, // No actualizar sesión más de una vez cada 24 horas
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: true, // Prevenir acceso desde JavaScript del cliente
      secure: process.env.NODE_ENV === "production", // HTTPS en producción
    },
  })
);

// Middleware global para pasar datos de sesión a las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

// Usar las rutas
app.use("/", viewRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

// Ruta de fallback para manejar errores 404
app.use("*", (req, res) => {
  res.status(404).render("error", {
    title: "Página no encontrada",
    message: "La página que buscas no existe.",
    statusCode: 404,
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).render("error", {
    title: "Error del servidor",
    message: "Ha ocurrido un error interno del servidor.",
    statusCode: 500,
  });
});

// Inicializar servidor y base de datos
async function startServer() {
  try {
    // Conectar a la base de datos primero
    await initializeDatabase();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log("📝 Rutas disponibles:");
      console.log("   GET  /login - Página de login");
      console.log("   GET  /register - Página de registro");
      console.log(
        "   GET  /products - Página de productos (requiere autenticación)"
      );
      console.log("   POST /auth/login - Procesar login");
      console.log("   POST /auth/register - Procesar registro");
      console.log("   POST /auth/logout - Cerrar sesión");
      console.log("   GET  /auth/debug/users - Ver usuarios (desarrollo)");
    });

    // Manejo de cierre graceful
    process.on("SIGTERM", async () => {
      console.log("🛑 Cerrando servidor...");
      await dbConnection.disconnect();
      server.close(() => {
        console.log("👋 Servidor cerrado correctamente");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
}

// Iniciar aplicación
startServer();

module.exports = app;
