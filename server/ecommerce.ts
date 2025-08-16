import { eq, desc, and, ilike, or } from "drizzle-orm";
import { db } from "./db";
import { 
  products, 
  cartItems, 
  orders, 
  orderItems, 
  categories,
  shippingRates,
  type Product,
  type CartItem,
  type Order,
  type OrderItem,
  type Category,
  type InsertProduct,
  type InsertCartItem,
  type InsertOrder,
  type InsertOrderItem,
  type InsertCategory,
  type ShippingRate
} from "@shared/schema";

export interface IEcommerceStorage {
  // Product Management
  getProducts(filters?: { search?: string; category?: string; sort?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Category Management
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Shopping Cart
  getCartItems(sessionId: string, userId?: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(sessionId: string, userId?: string): Promise<void>;
  
  // Order Management
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  getOrders(userId?: string, guestEmail?: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  addTrackingNumber(id: string, trackingNumber: string): Promise<Order>;
}

export class EcommerceStorage implements IEcommerceStorage {
  // Product Management
  async getProducts(filters?: { search?: string; category?: string; sort?: string }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    // Apply filters
    const conditions: any[] = [eq(products.isActive, true)];
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`),
          ilike(products.shortDescription, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(products.category, filters.category));
    }
    
    let baseQuery = db.select().from(products).where(and(...conditions));
    
    // Apply sorting
    switch (filters?.sort) {
      case 'price-low':
        baseQuery = baseQuery.orderBy(products.price);
        break;
      case 'price-high':
        baseQuery = baseQuery.orderBy(desc(products.price));
        break;
      case 'featured':
        baseQuery = baseQuery.orderBy(desc(products.isFeatured), products.name);
        break;
      default:
        baseQuery = baseQuery.orderBy(products.name);
    }
    
    return baseQuery;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Category Management
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Shopping Cart
  async getCartItems(sessionId: string, userId?: string): Promise<(CartItem & { product: Product })[]> {
    const conditions = [eq(cartItems.sessionId, sessionId)];
    
    if (userId) {
      conditions.push(eq(cartItems.userId, userId));
    }
    
    return db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(and(...conditions))
      .orderBy(desc(cartItems.createdAt));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, cartItem.sessionId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem.quantity + cartItem.quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string, userId?: string): Promise<void> {
    const conditions = [eq(cartItems.sessionId, sessionId)];
    
    if (userId) {
      conditions.push(eq(cartItems.userId, userId));
    }
    
    await db.delete(cartItems).where(and(...conditions));
  }

  // Order Management
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return db.transaction(async (tx) => {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Create order
      const [newOrder] = await tx
        .insert(orders)
        .values({ ...order, orderNumber })
        .returning();

      // Create order items
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));
      
      await tx.insert(orderItems).values(orderItemsWithOrderId);

      return newOrder;
    });
  }

  async getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    
    return { ...order, items };
  }

  async getOrders(userId?: string, guestEmail?: string): Promise<Order[]> {
    const conditions: any[] = [];
    
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }
    
    if (guestEmail) {
      conditions.push(eq(orders.guestEmail, guestEmail));
    }
    
    if (conditions.length === 0) {
      return [];
    }
    
    return db
      .select()
      .from(orders)
      .where(or(...conditions))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
      
    return updatedOrder;
  }

  async addTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        trackingNumber, 
        status: 'shipped',
        shippedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
      
    return updatedOrder;
  }
}

export const ecommerceStorage = new EcommerceStorage();