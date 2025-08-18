import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration - Using in-memory store for now due to Neon endpoint issues
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-session-secret-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.isActive) {
            return done(null, false, { message: 'Invalid credentials' });
          }
          
          const isPasswordValid = await comparePasswords(password, user.password);
          if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid credentials' });
          }
          
          // Update last login
          await storage.updateUserLastLogin(user.id);
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint with comprehensive error handling
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, firstName, lastName, location, password, country } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user with safe defaults
      const hashedPassword = await hashPassword(password);
      
      // Create user data with all required fields and safe defaults
      const userData = {
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: location?.trim() || null,
        password: hashedPassword,
        profileImageUrl: null,
        country: country?.trim() || null,
        isSuperAdmin: false,
        isAuthor: false,
        authorVerified: false,
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        preferredLanguage: 'en',
        timezone: 'UTC',
      };

      const user = await storage.createUser(userData);

      // Auto-login the user
      req.login(user, (err) => {
        if (err) {
          console.error('Auto-login error:', err);
          return res.status(201).json({ 
            message: "Registration successful, please login manually",
            userId: user.id
          });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific database errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('column') && errorMessage?.includes('does not exist')) {
        return res.status(500).json({ 
          message: "System maintenance required. Please try again in a few minutes." 
        });
      }
      
      if (errorMessage?.includes('duplicate key') || errorMessage?.includes('unique constraint')) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint - support both GET and POST for compatibility
  const logoutHandler = (req: any, res: any, next: any) => {
    console.log("🔥 Logout request received for user:", req.user?.email);
    
    req.logout((err: any) => {
      if (err) {
        console.error("❌ Logout error:", err);
        return next(err);
      }
      
      // Destroy the session completely
      req.session.destroy((destroyErr: any) => {
        if (destroyErr) {
          console.error("❌ Session destroy error:", destroyErr);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        console.log("✅ User logged out successfully and session destroyed");
        res.sendStatus(200);
      });
    });
  };
  
  app.post("/api/logout", logoutHandler);
  app.get("/api/logout", logoutHandler);

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.sendStatus(401);
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
}

// Admin authentication middleware
export function requireAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
}

// Middleware to protect routes
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

