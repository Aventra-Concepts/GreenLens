import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { storage } from "../storage";

const scryptAsync = promisify(scrypt);

interface AdminAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    twoFactorEnabled: boolean;
  };
  token?: string;
  requiresTwoFactor?: boolean;
  error?: string;
}

interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  pendingModerations: number;
  systemAlerts: number;
  revenue: number;
  plantIdentifications: number;
  onlineUsers: number;
  activeIdentifications: number;
  pendingOrders: number;
  serverLoad: number;
  failedLogins: number;
  suspiciousActivity: number;
  activeAdminSessions: number;
}

export class AdminAuthService {
  private static adminSessions = new Map<string, {
    userId: string;
    createdAt: Date;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }>();

  private static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  private static async comparePasswords(supplied: string, stored: string): Promise<boolean> {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  private static generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  static async authenticateAdmin(credentials: {
    email: string;
    password: string;
    totpCode?: string;
    backupCode?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdminAuthResult> {
    try {
      const user = await storage.getUserByEmail(credentials.email);
      
      if (!user || !user.isAdmin) {
        return { success: false, error: "Invalid admin credentials" };
      }

      // Verify password
      const passwordValid = await this.comparePasswords(credentials.password, user.password);
      if (!passwordValid) {
        return { success: false, error: "Invalid admin credentials" };
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        if (!credentials.totpCode && !credentials.backupCode) {
          return { success: false, requiresTwoFactor: true };
        }

        // Verify TOTP or backup code
        let twoFactorValid = false;
        if (credentials.totpCode) {
          // TODO: Implement TOTP verification
          twoFactorValid = this.verifyTOTP(user.id, credentials.totpCode);
        } else if (credentials.backupCode) {
          // TODO: Implement backup code verification
          twoFactorValid = await this.verifyBackupCode(user.id, credentials.backupCode);
        }

        if (!twoFactorValid) {
          return { success: false, error: "Invalid two-factor authentication code" };
        }
      }

      // Generate session token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

      // Store session
      this.adminSessions.set(token, {
        userId: user.id,
        createdAt: new Date(),
        expiresAt,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent
      });

      // Update last login
      await storage.updateUserLastLogin(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin || false,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      };
    } catch (error) {
      console.error("Admin authentication error:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  static async logout(token: string): Promise<void> {
    this.adminSessions.delete(token);
  }

  static async verifyToken(token: string): Promise<AdminAuthResult> {
    const session = this.adminSessions.get(token);
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        this.adminSessions.delete(token);
      }
      return { success: false, error: "Session expired" };
    }

    try {
      const user = await storage.getUser(session.userId);
      if (!user || !user.isAdmin) {
        this.adminSessions.delete(token);
        return { success: false, error: "Invalid session" };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin || false,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return { success: false, error: "Token verification failed" };
    }
  }

  static async setupTwoFactor(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const secret = speakeasy.generateSecret({
      name: `GreenLens Admin (${user.email})`,
      issuer: "GreenLens"
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      randomBytes(4).toString("hex").toUpperCase()
    );

    // TODO: Store secret and backup codes in database
    
    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes
    };
  }

  static async enableTwoFactor(userId: string, totpCode: string): Promise<boolean> {
    // TODO: Verify TOTP code and enable 2FA
    try {
      await storage.updateUser(userId, { twoFactorEnabled: true });
      return true;
    } catch (error) {
      console.error("Enable 2FA error:", error);
      return false;
    }
  }

  static async disableTwoFactor(userId: string, password: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      const passwordValid = await this.comparePasswords(password, user.password);
      if (!passwordValid) return false;

      await storage.updateUser(userId, { twoFactorEnabled: false });
      return true;
    } catch (error) {
      console.error("Disable 2FA error:", error);
      return false;
    }
  }

  private static verifyTOTP(userId: string, token: string): boolean {
    // TODO: Implement TOTP verification with stored secret
    // For now, accept any 6-digit code for demo purposes
    return /^\d{6}$/.test(token);
  }

  private static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    // TODO: Implement backup code verification
    // For now, accept any alphanumeric code for demo purposes
    return /^[A-Z0-9]{8}$/.test(code);
  }

  static async logAdminAction(
    adminId: string, 
    action: string, 
    details: any, 
    ipAddress?: string
  ): Promise<void> {
    try {
      await storage.logUserActivity({
        userId: adminId,
        action,
        details,
        ipAddress,
        userAgent: "Admin Dashboard"
      });
    } catch (error) {
      console.error("Log admin action error:", error);
    }
  }

  static async getAdminAnalytics(dateRange: { start: Date; end: Date }): Promise<AdminAnalytics> {
    try {
      // Get basic user statistics
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(u => u.isActive).length;
      const newUsers = allUsers.filter(u => 
        new Date(u.createdAt) >= dateRange.start && 
        new Date(u.createdAt) <= dateRange.end
      ).length;

      // Calculate mock analytics (would be real queries in production)
      const analytics: AdminAnalytics = {
        totalUsers,
        activeUsers,
        newUsers,
        pendingModerations: 12, // Mock data
        systemAlerts: 3,
        revenue: 45600,
        plantIdentifications: 1250,
        onlineUsers: Math.floor(activeUsers * 0.15),
        activeIdentifications: 8,
        pendingOrders: 24,
        serverLoad: 45,
        failedLogins: 15,
        suspiciousActivity: 2,
        activeAdminSessions: this.adminSessions.size
      };

      return analytics;
    } catch (error) {
      console.error("Get admin analytics error:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        pendingModerations: 0,
        systemAlerts: 0,
        revenue: 0,
        plantIdentifications: 0,
        onlineUsers: 0,
        activeIdentifications: 0,
        pendingOrders: 0,
        serverLoad: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        activeAdminSessions: 0
      };
    }
  }

  static getActiveAdminSessions(): number {
    // Clean expired sessions
    const now = new Date();
    for (const [token, session] of this.adminSessions.entries()) {
      if (session.expiresAt < now) {
        this.adminSessions.delete(token);
      }
    }
    return this.adminSessions.size;
  }
}