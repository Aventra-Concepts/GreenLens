import type { Express } from "express";
import { ecommerceStorage } from "../ecommerce";
import { insertProductSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export function registerEcommerceRoutes(app: Express) {
  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const { search, category, sort } = req.query;
      const products = await ecommerceStorage.getProducts({
        search: search as string,
        category: category as string,
        sort: sort as string,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await ecommerceStorage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await ecommerceStorage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const updates = req.body;
      const product = await ecommerceStorage.updateProduct(req.params.id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await ecommerceStorage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Category Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await ecommerceStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Shopping Cart Routes
  app.get("/api/cart", async (req, res) => {
    try {
      const { sessionId } = req.query;
      const userId = req.user?.id;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const cartItems = await ecommerceStorage.getCartItems(sessionId as string, userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user?.id,
      });
      
      const cartItem = await ecommerceStorage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await ecommerceStorage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await ecommerceStorage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const { sessionId } = req.query;
      const userId = req.user?.id;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      await ecommerceStorage.clearCart(sessionId as string, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Order Routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      // Validate order data
      const validatedOrderData = insertOrderSchema.parse({
        ...orderData,
        userId: req.user?.id,
      });

      // Prepare order items
      const orderItems = items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName || "Product", // You'll need to fetch this
        productImage: item.productImage,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        totalPrice: Number(item.price) * item.quantity,
      }));

      const order = await ecommerceStorage.createOrder(validatedOrderData, orderItems);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await ecommerceStorage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.user?.id;
      const { guestEmail } = req.query;
      
      const orders = await ecommerceStorage.getOrders(userId, guestEmail as string);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await ecommerceStorage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.patch("/api/orders/:id/tracking", async (req, res) => {
    try {
      const { trackingNumber } = req.body;
      const order = await ecommerceStorage.addTrackingNumber(req.params.id, trackingNumber);
      res.json(order);
    } catch (error) {
      console.error("Error adding tracking number:", error);
      res.status(500).json({ error: "Failed to add tracking number" });
    }
  });
}