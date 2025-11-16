const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// Importar configuración de base de datos
const { connectDB } = require("./config/db");

// Importar rutas para actividad 4.4
const apiUsersRoutes = require("./routes/api-users");
const usersViewsRoutes = require("./routes/users-views");

// Importar rutas anteriores (mantener compatibilidad)
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

// Configurar cookie-parser para cookies firmadas (JWT)
app.use(cookieParser(process.env.COOKIE_SECRET));

// Configuración de sesiones con MongoDB Atlas (para compatibilidad con Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      dbName: process.env.MONGO_DB_NAME,
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

// Inicializar Passport (mantener compatibilidad con actividad 3.4)
const passport = require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Middleware global para compatibilidad con Passport
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = !!req.user;
  res.locals.isAdmin = req.user?.role === "admin";
  next();
});

// Rutas para Actividad 4.4 - JWT
app.use("/api/users", apiUsersRoutes);
app.use("/users", usersViewsRoutes);

// Rutas para API de sesiones (Entrega Backend II)
const apiSessionsRoutes = require("./routes/api-sessions");
app.use("/api/sessions", apiSessionsRoutes);

// Rutas anteriores (mantener compatibilidad con actividades previas)
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
      console.log("📝 Rutas Actividad 4.4 (JWT):");
      console.log("   GET  /users/login - Vista login JWT");
      console.log("   POST /users/login - Procesar login JWT");
      console.log("   GET  /users/current - Vista usuario actual (protegida)");
      console.log("   POST /users/logout - Cerrar sesión JWT");
      console.log("   ");
      console.log("📡 API REST:");
      console.log("   GET    /api/users - Obtener todos los usuarios");
      console.log("   POST   /api/users - Crear usuario");
      console.log("   GET    /api/users/:id - Obtener usuario por ID");
      console.log("   PUT    /api/users/:id - Actualizar usuario");
      console.log("   DELETE /api/users/:id - Eliminar usuario");
      console.log("   POST   /api/users/login - Login con JWT");
      console.log("   POST   /api/users/logout - Logout JWT");
      console.log("   ");
      console.log("🔐 API Sessions (Entrega Backend II):");
      console.log("   POST /api/sessions/login - Login con JWT");
      console.log("   POST /api/sessions/register - Registro con JWT");
      console.log(
        "   GET  /api/sessions/current - Validar usuario logueado (JWT)"
      );
      console.log("   POST /api/sessions/logout - Logout");
      console.log("   ");
      console.log("🔗 Rutas anteriores (compatibilidad):");
      console.log("   GET  /login - Login Passport");
      console.log("   GET  /products - Productos");
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
