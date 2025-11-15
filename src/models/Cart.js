const mongoose = require("mongoose");

/**
 * Schema de Carrito para MongoDB Atlas
 * Colección: carts
 * Base de datos: backendII
 */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "El producto es obligatorio"],
        },
        quantity: {
          type: Number,
          required: [true, "La cantidad es obligatoria"],
          min: [1, "La cantidad debe ser al menos 1"],
          validate: {
            validator: Number.isInteger,
            message: "La cantidad debe ser un número entero",
          },
        },
        price: {
          type: Number,
          required: [true, "El precio es obligatorio"],
          min: [0, "El precio no puede ser negativo"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "El total no puede ser negativo"],
    },
    totalItems: {
      type: Number,
      default: 0,
      min: [0, "El total de items no puede ser negativo"],
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Deshabilita el campo __v
  }
);

// Índices para optimizar consultas
cartSchema.index({ user: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ createdAt: -1 });
cartSchema.index({ "products.product": 1 });

// Middleware pre-save para calcular totales
cartSchema.pre("save", function (next) {
  if (this.products && this.products.length > 0) {
    this.totalItems = this.products.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.totalAmount = this.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  } else {
    this.totalItems = 0;
    this.totalAmount = 0;
  }
  this.lastModified = new Date();
  next();
});

// Método estático para encontrar carrito activo del usuario
cartSchema.statics.findActiveCart = function (userId) {
  return this.findOne({ user: userId, status: "active" }).populate(
    "products.product"
  );
};

// Método estático para crear carrito para usuario
cartSchema.statics.createCartForUser = function (userId) {
  return this.create({
    user: userId,
    products: [],
    status: "active",
  });
};

// Método de instancia para agregar producto
cartSchema.methods.addProduct = function (productId, quantity, price) {
  const existingProduct = this.products.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingProduct) {
    existingProduct.quantity += quantity;
    existingProduct.addedAt = new Date();
  } else {
    this.products.push({
      product: productId,
      quantity: quantity,
      price: price,
      addedAt: new Date(),
    });
  }

  return this.save();
};

// Método de instancia para remover producto
cartSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Método de instancia para actualizar cantidad
cartSchema.methods.updateProductQuantity = function (productId, quantity) {
  const product = this.products.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (product) {
    if (quantity <= 0) {
      return this.removeProduct(productId);
    } else {
      product.quantity = quantity;
      product.addedAt = new Date();
      return this.save();
    }
  }
  throw new Error("Producto no encontrado en el carrito");
};

// Método de instancia para vaciar carrito
cartSchema.methods.clearCart = function () {
  this.products = [];
  return this.save();
};

// Método de instancia para marcar como completado
cartSchema.methods.markAsCompleted = function () {
  this.status = "completed";
  return this.save();
};

// Virtual para verificar si está vacío
cartSchema.virtual("isEmpty").get(function () {
  return this.products.length === 0;
});

// Virtual para el total formateado
cartSchema.virtual("formattedTotal").get(function () {
  return `$${this.totalAmount.toLocaleString("es-AR")}`;
});

// Incluir virtuals en JSON
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
