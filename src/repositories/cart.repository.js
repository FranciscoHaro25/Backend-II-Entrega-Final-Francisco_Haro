const cartDAO = require("../dao/cart.dao");
const productRepository = require("./product.repository");

class CartRepository {
  async createCart(userId) {
    return await cartDAO.create({ user: userId, products: [] });
  }

  async getCartById(id) {
    return await cartDAO.findById(id);
  }

  async getCartByUser(userId) {
    return await cartDAO.findByUser(userId);
  }

  async getOrCreateCart(userId) {
    let cart = await cartDAO.findByUser(userId);
    if (!cart) {
      cart = await this.createCart(userId);
    }
    return cart;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await cartDAO.findById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new Error("Producto no encontrado");
    }

    if (product.stock < quantity) {
      throw new Error("Stock insuficiente");
    }

    // Normalizar productId a string para comparación consistente
    const productIdStr = productId.toString();

    const existingProductIndex = cart.products.findIndex((p) => {
      // Manejar tanto productos poblados como no poblados
      const itemProductId = p.product._id
        ? p.product._id.toString()
        : p.product.toString();
      return itemProductId === productIdStr;
    });

    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    cart.totalAmount = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return await cart.save();
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await cartDAO.findById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    // Normalizar productId a string para comparación consistente
    const productIdStr = productId.toString();

    cart.products = cart.products.filter((p) => {
      const itemProductId = p.product._id
        ? p.product._id.toString()
        : p.product.toString();
      return itemProductId !== productIdStr;
    });

    cart.totalAmount = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return await cart.save();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await cartDAO.findById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    // Normalizar productId a string para comparación consistente
    const productIdStr = productId.toString();

    const productIndex = cart.products.findIndex((p) => {
      const itemProductId = p.product._id
        ? p.product._id.toString()
        : p.product.toString();
      return itemProductId === productIdStr;
    });

    if (productIndex === -1) {
      throw new Error("Producto no está en el carrito");
    }

    if (quantity <= 0) {
      return await this.removeProductFromCart(cartId, productId);
    }

    cart.products[productIndex].quantity = quantity;
    cart.totalAmount = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return await cart.save();
  }

  async clearCart(cartId) {
    return await cartDAO.clearCart(cartId);
  }

  async deleteCart(cartId) {
    return await cartDAO.delete(cartId);
  }
}

module.exports = new CartRepository();
