import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { storage } from '../storage';
import bcrypt from 'bcryptjs';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  totpCode?: string;
  backupCode?: string;
}

export interface AdminLoginResult {
  success: boolean;
  requiresTwoFactor?: boolean;
  user?: any;
  token?: string;
  error?: string;
}

export class AdminAuthService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  /**
   * Authenticate admin user with multi-factor authentication
   */
  static async authenticateAdmin(request: AdminLoginRequest): Promise<AdminLoginResult> {
    try {
      // Get user by email
      const user = await storage.getUserByEmail(request.email);
      if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        return { 
          success: false, 
          error: `Account locked. Try again in ${remainingTime} minutes.` 
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(request.password, user.password);
      if (!isValidPassword) {
        await this.handleFailedLogin(user.id);
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if 2FA is enabled
      const twoFactor = await storage.getAdminTwoFactor(user.id);
      if (twoFactor && twoFactor.isEnabled) {
        // Verify TOTP or backup code
        const isValidTwoFactor = await this.verifyTwoFactor(
          user.id, 
          request.totpCode, 
          request.backupCode
        );
        
        if (!isValidTwoFactor) {
          if (!request.totpCode && !request.backupCode) {
            return { success: false, requiresTwoFactor: true };
          }
          return { success: false, error: 'Invalid two-factor authentication code' };
        }
      }

      // Reset failed attempts and generate session
      await storage.resetFailedLoginAttempts(user.id);
      const sessionToken = await this.createAdminSession(user.id, request);

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
          isSuperAdmin: user.isSuperAdmin,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token: sessionToken
      };

    } catch (error) {
      console.error('Admin authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Setup two-factor authentication for admin user
   */
  static async setupTwoFactor(userId: string): Promise<TwoFactorSetup> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `GreenLens Admin (${user.email})`,
      issuer: 'GreenLens',
      length: 32
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Save to database (disabled until user confirms)
    await storage.setupAdminTwoFactor(userId, secret.base32, backupCodes);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Enable two-factor authentication after user confirmation
   */
  static async enableTwoFactor(userId: string, totpCode: string): Promise<boolean> {
    const twoFactor = await storage.getAdminTwoFactor(userId);
    if (!twoFactor) {
      return false;
    }

    // Verify the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    });

    if (isValid) {
      await storage.enableAdminTwoFactor(userId);
      await storage.updateUserTwoFactorStatus(userId, true);
      return true;
    }

    return false;
  }

  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(userId: string, password: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return false;
    }

    await storage.disableAdminTwoFactor(userId);
    await storage.updateUserTwoFactorStatus(userId, false);
    return true;
  }

  /**
   * Verify TOTP code or backup code
   */
  private static async verifyTwoFactor(
    userId: string, 
    totpCode?: string, 
    backupCode?: string
  ): Promise<boolean> {
    const twoFactor = await storage.getAdminTwoFactor(userId);
    if (!twoFactor || !twoFactor.isEnabled) {
      return false;
    }

    // Try TOTP code first
    if (totpCode) {
      const isValidTotp = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: 'base32',
        token: totpCode,
        window: 2
      });

      if (isValidTotp) {
        await storage.updateAdminTwoFactorLastUsed(userId);
        return true;
      }
    }

    // Try backup code
    if (backupCode && twoFactor.backupCodes) {
      const backupCodes = Array.isArray(twoFactor.backupCodes) 
        ? twoFactor.backupCodes 
        : JSON.parse(twoFactor.backupCodes as string);
      
      const isValidBackup = backupCodes.includes(backupCode);
      if (isValidBackup) {
        // Remove used backup code
        const updatedCodes = backupCodes.filter((code: string) => code !== backupCode);
        await storage.updateAdminTwoFactorBackupCodes(userId, updatedCodes);
        return true;
      }
    }

    return false;
  }

  /**
   * Create admin session with enhanced security
   */
  private static async createAdminSession(
    userId: string, 
    request: AdminLoginRequest & { ipAddress?: string; userAgent?: string }
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    await storage.createAdminSession({
      userId,
      token,
      ipAddress: request.ipAddress || '',
      userAgent: request.userAgent || '',
      expiresAt
    });

    return token;
  }

  /**
   * Validate admin session
   */
  static async validateSession(token: string): Promise<any> {
    const session = await storage.getAdminSession(token);
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return null;
    }

    return await storage.getUser(session.userId);
  }

  /**
   * Logout admin session
   */
  static async logout(token: string): Promise<void> {
    await storage.deactivateAdminSession(token);
  }

  /**
   * Handle failed login attempts
   */
  private static async handleFailedLogin(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    
    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
      await storage.lockUserAccount(userId, lockedUntil);
    } else {
      await storage.updateFailedLoginAttempts(userId, failedAttempts);
    }
  }

  /**
   * Generate backup codes for 2FA
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Get admin dashboard analytics
   */
  static async getAdminAnalytics(dateRange: { start: Date; end: Date }) {
    return await storage.getAdminAnalytics(dateRange);
  }

  /**
   * Log admin action for audit trail
   */
  static async logAdminAction(
    adminId: string, 
    action: string, 
    details: any,
    ipAddress?: string
  ): Promise<void> {
    await storage.logAnalyticsEvent({
      eventType: 'admin_action',
      entityType: 'admin',
      entityId: adminId,
      userId: adminId,
      properties: {
        action,
        details,
        ipAddress,
        timestamp: new Date()
      }
    });
  }
}