const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Configuración de Passport.js
// Implementamos estrategias Local y GitHub para manejar la autenticación

// Manejo de sesiones con Passport
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Error al obtener usuario de sesión:", error);
    done(error, null);
  }
});

// Estrategia local para login
passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // Buscar usuario por email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, {
            message: "Email o contraseña incorrectos",
          });
        }

        // Verificar contraseña usando bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return done(null, false, {
            message: "Email o contraseña incorrectos",
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Error en login:", error);
        return done(error);
      }
    }
  )
);

// Estrategia local para registro
passport.use(
  "local-register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
          return done(null, false, {
            message: "Este email ya está registrado",
          });
        }

        // Extraer datos del formulario
        const { first_name, last_name, age } = req.body;

        // Validar que todos los campos estén presentes
        if (!first_name || !last_name || !age) {
          return done(null, false, {
            message: "Todos los campos son obligatorios",
          });
        }

        // Encriptar contraseña con bcrypt usando hashSync como especifica la consigna
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        // Crear nuevo usuario
        const newUser = new User({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          age: parseInt(age),
          role: "user",
        });

        // Guardar usuario en la base de datos
        const savedUser = await newUser.save();
        return done(null, savedUser);
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        return done(error);
      }
    }
  )
);

// Estrategia de autenticación con GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar si ya existe un usuario con este GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Usuario existente, actualizar última conexión
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Si tiene email, verificar si ya existe una cuenta con ese email
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Vincular cuenta existente con GitHub
            user.githubId = profile.id;
            user.githubUsername = profile.username;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }
        }

        // Crear nuevo usuario desde GitHub
        const displayName = profile.displayName || profile.username;
        const nameParts = displayName.split(" ");
        const first_name = nameParts[0] || profile.username;
        const last_name = nameParts.slice(1).join(" ") || "GitHub";

        // Determinar email
        let email;
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value.toLowerCase();
        } else {
          email = `${profile.username.toLowerCase()}@github.example.com`;
        }

        // Determinar rol basado en configuración
        const adminGithubUsers = process.env.GITHUB_ADMIN_USERS
          ? process.env.GITHUB_ADMIN_USERS.split(",").map((user) => user.trim())
          : ["FranciscoHaro25"];

        const userRole = adminGithubUsers.includes(profile.username)
          ? "admin"
          : "user";

        // Crear nuevo usuario
        const newUser = new User({
          githubId: profile.id,
          githubUsername: profile.username,
          first_name: first_name,
          last_name: last_name,
          email: email,
          age: 25, // Edad por defecto
          role: userRole,
          password: null, // No necesita password para OAuth
          isActive: true,
          lastLogin: new Date(),
        });

        const savedUser = await newUser.save();
        return done(null, savedUser);
      } catch (error) {
        console.error("Error en autenticación GitHub:", error);
        return done(error, null);
      }
    }
  )
);

// Estrategia JWT para autenticación basada en tokens
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extraer JWT desde cookies firmadas
        (req) => {
          let token = null;
          if (req && req.signedCookies) {
            token = req.signedCookies["currentUser"];
          }
          return token;
        },
        // También desde el header Authorization como fallback
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        // Buscar usuario por ID del payload JWT
        const user = await User.findById(jwtPayload.id).select("-password");

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        console.error("Error en estrategia JWT:", error);
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
