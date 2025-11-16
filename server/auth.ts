import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as DBUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { authLimiter, validateEmail, validatePassword } from "./middleware/security";

declare global {
  namespace Express {
    interface User extends DBUser {}
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

  // Configure OAuth strategies (set up in routes.ts)

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
          
          // Check if user has a password (local auth) or is OAuth only
          if (!user.password) {
            return done(null, false, { message: 'Please sign in with your social account' });
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
  app.post("/api/register", authLimiter, async (req, res, next) => {
    try {
      const { email, firstName, lastName, location, password, country, dateOfBirth, ageVerified } = req.body;
      
      // Validate required fields including COPPA compliance
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // COPPA Age Verification
      if (!dateOfBirth || !ageVerified) {
        return res.status(400).json({ 
          message: "Age verification is required. You must be 13 or older to create an account." 
        });
      }

      // Verify age compliance (additional server-side check)
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        return res.status(400).json({ 
          message: "You must be at least 13 years old to create an account. This is required by COPPA for your protection." 
        });
      }

      // Enhanced email validation
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Enhanced password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user with safe defaults
      const hashedPassword = await hashPassword(password);
      
      // Create user data with all required fields including COPPA compliance
      const userData = {
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: location?.trim() || null,
        password: hashedPassword,
        profileImageUrl: null,
        country: country?.trim() || null,
        dateOfBirth: birthDate.toISOString().split('T')[0], // Store as date string
        ageVerified: true, // Confirmed during registration
        gmail: null,
        facebookId: null,
        githubId: null,
        twitterId: null,
        provider: 'local',
        isActive: true,
        isAdmin: false,
        isSuperAdmin: false,
        isAuthor: false,
        authorVerified: false,
        emailVerified: false,
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        preferredLanguage: 'en',
        timezone: 'UTC',
        preferredCurrency: 'USD',
        region: 'US',
        phoneNumber: null,
        phoneVerifiedAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        gardenMonitoringSubscriptionId: null,
        gardenMonitoringActive: false,
        gardenMonitoringExpiresAt: null,
        subscriptionStatus: 'none',
        subscriptionPlan: 'Free Plan',
        subscriptionPlanId: 'free',
      };

      const user = await storage.createUser(userData);

      // Send email verification (if email service is configured)
      // TODO: Implement email verification logic when SendGrid is configured
      
      // Return success message without auto-login
      res.status(201).json({ 
        message: "Registration successful! Please verify your email and then log in.",
        requiresEmailVerification: true,
        userId: user.id
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
  app.post("/api/login", authLimiter, (req, res, next) => {
    console.log(`🔐 Login attempt for: ${req.body.email}`);
    passport.authenticate("local", (err: any, user: DBUser | false, info: any) => {
      if (err) {
        console.error("❌ Login authentication error:", err);
        console.error("   Error details:", {
          message: err.message,
          stack: err.stack,
          code: err.code
        });
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        console.log(`⚠️ Login failed for ${req.body.email}: ${info?.message}`);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      console.log(`✅ User authenticated: ${user.email} (${user.id})`);
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Session login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        console.log(`🎉 Login successful for: ${user.email}`);
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
  // Check session-based admin authentication first
  if (req.session?.adminAuthenticated && req.session?.adminUser?.isAdmin) {
    return next();
  }
  
  // Fallback to passport-based authentication
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

// OAuth Strategy Setup
function setupOAuthStrategies() {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Check if user exists with Google ID
        let user = await storage.getUserByProviderId('google', profile.id);
        
        if (!user) {
          // Check if user exists with same email
          const emailUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          
          if (emailUser) {
            // Link Google account to existing user
            user = await storage.linkOAuthAccount(emailUser.id, 'google', profile.id);
          } else {
            // Create new user
            user = await storage.createOAuthUser({
              googleId: profile.id,
              email: profile.emails?.[0]?.value || '',
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              profileImageUrl: profile.photos?.[0]?.value,
              provider: 'google',
              emailVerified: true
            });
          }
        }
        
        await storage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await storage.getUserByProviderId('facebook', profile.id);
        
        if (!user) {
          const emailUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          
          if (emailUser) {
            user = await storage.linkOAuthAccount(emailUser.id, 'facebook', profile.id);
          } else {
            user = await storage.createOAuthUser({
              facebookId: profile.id,
              email: profile.emails?.[0]?.value || '',
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              profileImageUrl: profile.photos?.[0]?.value,
              provider: 'facebook',
              emailVerified: true
            });
          }
        }
        
        await storage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback"
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await storage.getUserByProviderId('github', profile.id);
        
        if (!user) {
          const emailUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          
          if (emailUser) {
            user = await storage.linkOAuthAccount(emailUser.id, 'github', profile.id);
          } else {
            user = await storage.createOAuthUser({
              githubId: profile.id,
              email: profile.emails?.[0]?.value || '',
              firstName: profile.displayName?.split(' ')[0] || '',
              lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
              profileImageUrl: profile.photos?.[0]?.value,
              provider: 'github',
              emailVerified: true
            });
          }
        }
        
        await storage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  // Twitter OAuth Strategy removed (security advisory GHSA-h6q6-9hqw-rwfv)
}

export { hashPassword, comparePasswords, setupOAuthStrategies };
