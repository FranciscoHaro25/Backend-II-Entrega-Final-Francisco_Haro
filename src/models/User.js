const mongoose = require("mongoose");

// Schema de Usuario para la base de datos
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
    },
    last_name: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
      maxlength: [50, "El apellido no puede exceder 50 caracteres"],
      minlength: [2, "El apellido debe tener al menos 2 carteres"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      lowercase: true,
      trim: true,
      maxlength: [100, "El email no puede exceder 100 caracteres"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Formato de email inválido",
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password es obligatorio solo si no es usuario OAuth
        return !this.githubId;
      },
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    age: {
      type: Number,
      required: [true, "La edad es obligatoria"],
      min: [18, "Debes ser mayor de 18 años"],
      max: [120, "Edad máxima permitida es 120 años"],
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "El rol debe ser user o admin",
      },
      default: "user",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Campos para OAuth GitHub
    githubId: {
      type: String,
      unique: true,
      sparse: true, // Permite que sea único pero opcional
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    githubProfile: {
      avatar_url: String,
      html_url: String,
      name: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Remueve el campo __v
    collection: "users", // Nombre explícito de la colección
  }
);

// Índices para optimizar búsquedas en MongoDB Atlas
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: -1 });

// Virtual para nombre completo
userSchema.virtual("fullName").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// Virtual para verificar si la cuenta está bloqueada
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  this.loginAttempts = 0; // Resetear intentos fallidos
  this.lockUntil = null; // Remover bloqueo si existe
  return await this.save();
};

// Middleware antes de guardar
userSchema.pre("save", function (next) {
  next();
});

userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase().trim(),
    isActive: true,
  });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true }).select("-password");
};

userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true }).select("-password");
};

userSchema.statics.getStats = async function () {
  try {
    const totalUsers = await this.countDocuments();
    const activeUsers = await this.countDocuments({ isActive: true });
    const adminUsers = await this.countDocuments({
      role: "admin",
      isActive: true,
    });
    const regularUsers = await this.countDocuments({
      role: "user",
      isActive: true,
    });

    // Estadísticas por rol
    const roleStats = await this.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          avgAge: { $avg: "$age" },
          minAge: { $min: "$age" },
          maxAge: { $max: "$age" },
        },
      },
    ]);

    // Usuarios recientes (últimos 7 días)
    const recentUsers = await this.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isActive: true,
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers,
      recentUsers,
      roleStats,
      inactiveUsers: totalUsers - activeUsers,
    };
  } catch (error) {
    throw error;
  }
};

userSchema.statics.createDefaultAdmin = async function () {
  return null;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
