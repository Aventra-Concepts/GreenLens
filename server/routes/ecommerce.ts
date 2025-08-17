import type { Express } from "express";
import { ecommerceStorage } from "../ecommerce";
import { storage } from "../storage";
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

  // E-commerce Payment Routes
  app.post("/api/ecommerce/checkout", async (req, res) => {
    try {
      const { cartItems, shippingAddress, billingAddress, currency = 'USD' } = req.body;
      const userId = req.user?.id;
      const guestEmail = req.body.guestEmail;

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate totals
      let subtotal = 0;
      const processedItems = [];

      for (const item of cartItems) {
        const product = await ecommerceStorage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }

        const itemTotal = Number(product.price) * item.quantity;
        subtotal += itemTotal;

        processedItems.push({
          productId: product.id,
          productName: product.name,
          productImage: Array.isArray(product.images) ? product.images[0] : null,
          sku: product.sku,
          price: product.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      // Check for student discount
      let discountAmount = 0;
      if (userId) {
        const user = await storage.getUser(userId);
        const studentUser = await storage.getStudentUser(userId);
        if (studentUser && studentUser.isVerified) {
          discountAmount = subtotal * 0.1; // 10% student discount
        }
      }

      // Calculate shipping (simplified)
      const shippingAmount = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
      const taxAmount = (subtotal - discountAmount) * 0.08; // 8% tax
      const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

      // Create payment session
      const { paymentService } = await import('../services/payments');
      
      const paymentSession = await paymentService.createProductCheckout({
        userId: userId || null,
        guestEmail,
        items: processedItems,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency,
        shippingAddress,
        billingAddress,
      });

      res.json({
        checkoutUrl: paymentSession.url,
        sessionId: paymentSession.id,
        currency,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        studentDiscountApplied: discountAmount > 0,
      });

    } catch (error) {
      console.error("Error creating e-commerce checkout:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Calculate cart totals with discounts
  app.post("/api/cart/calculate", async (req, res) => {
    try {
      const { cartItems, shippingCountry = 'US' } = req.body;
      const userId = req.user?.id;

      if (!cartItems || cartItems.length === 0) {
        return res.json({
          subtotal: 0,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          studentDiscountApplied: false,
        });
      }

      let subtotal = 0;
      for (const item of cartItems) {
        const product = await ecommerceStorage.getProduct(item.productId);
        if (product) {
          subtotal += Number(product.price) * item.quantity;
        }
      }

      // Check for student discount
      let discountAmount = 0;
      let studentDiscountApplied = false;
      if (userId) {
        const studentUser = await storage.getStudentUser(userId);
        if (studentUser && studentUser.isVerified) {
          discountAmount = subtotal * 0.1; // 10% student discount
          studentDiscountApplied = true;
        }
      }

      // Calculate shipping and tax
      const shippingAmount = subtotal > 50 ? 0 : 5.99;
      const taxAmount = (subtotal - discountAmount) * 0.08;
      const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

      res.json({
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        studentDiscountApplied,
      });

    } catch (error) {
      console.error("Error calculating cart totals:", error);
      res.status(500).json({ error: "Failed to calculate cart totals" });
    }
  });

  // Process successful payment and create order
  app.post("/api/ecommerce/complete-order", async (req, res) => {
    try {
      const { sessionId, paymentIntentId } = req.body;

      // Retrieve payment session details
      const { paymentService } = await import('../services/payments');
      const sessionDetails = await paymentService.getSessionDetails(sessionId);

      if (!sessionDetails || sessionDetails.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Create order with payment details
      const orderData = {
        userId: sessionDetails.metadata.userId || null,
        guestEmail: sessionDetails.metadata.guestEmail,
        subtotal: sessionDetails.metadata.subtotal,
        taxAmount: sessionDetails.metadata.taxAmount,
        shippingAmount: sessionDetails.metadata.shippingAmount,
        discountAmount: sessionDetails.metadata.discountAmount,
        totalAmount: sessionDetails.metadata.totalAmount,
        currency: sessionDetails.currency,
        paymentStatus: 'paid',
        paymentProvider: 'stripe',
        paymentIntentId,
        shippingAddress: JSON.parse(sessionDetails.metadata.shippingAddress || '{}'),
        billingAddress: JSON.parse(sessionDetails.metadata.billingAddress || '{}'),
      };

      const orderItems = JSON.parse(sessionDetails.metadata.items || '[]');
      const order = await ecommerceStorage.createOrder(orderData, orderItems);

      // Clear cart if user is logged in
      if (orderData.userId) {
        await ecommerceStorage.clearCart(sessionId, orderData.userId);
      }

      res.json({ success: true, order });

    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ error: "Failed to complete order" });
    }
  });
}