const mongoose = require("mongoose");

/**
 * Schema de Producto para MongoDB Atlas
 * Colección: products
 * Base de datos: backendII
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título del producto es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede exceder 100 caracteres"],
      minlength: [3, "El título debe tener al menos 3 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
    },
    code: {
      type: String,
      required: [true, "El código del producto es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "El código no puede exceder 20 caracteres"],
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "El precio debe ser mayor que 0",
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      validate: {
        validator: Number.isInteger,
        message: "El stock debe ser un número entero",
      },
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true,
      maxlength: [50, "La categoría no puede exceder 50 caracteres"],
    },
    thumbnails: {
      type: [String],
      default: [],
      validate: {
        validator: function (array) {
          return array.length <= 5;
        },
        message: "No se pueden agregar más de 5 imágenes",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Deshabilita el campo __v
  }
);

// Índices para optimizar consultas
productSchema.index({ code: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Método estático para obtener productos activos
productSchema.statics.getActiveProducts = function () {
  return this.find({ status: true }).sort({ createdAt: -1 });
};

// Método estático para buscar por categoría
productSchema.statics.findByCategory = function (category) {
  return this.find({ category: new RegExp(category, "i"), status: true });
};

// Método de instancia para actualizar stock
productSchema.methods.updateStock = function (quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return this.save();
  } else {
    throw new Error("Stock insuficiente");
  }
};

// Método de instancia para verificar disponibilidad
productSchema.methods.isAvailable = function (quantity = 1) {
  return this.status && this.stock >= quantity;
};

// Virtual para el precio formateado
productSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toLocaleString("es-AR")}`;
});

// Virtual para verificar si está en stock
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// Incluir virtuals en JSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
