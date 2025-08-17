import { Router } from 'express';
import { AdminAuthService } from '../services/adminAuthService';
import { storage } from '../storage';
import { requireAuth, requireAdmin } from '../auth';

const router = Router();

// Admin Authentication Routes
router.post('/auth/login', async (req, res) => {
  try {
    const result = await AdminAuthService.authenticateAdmin({
      email: req.body.email,
      password: req.body.password,
      totpCode: req.body.totpCode,
      backupCode: req.body.backupCode,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (result.success) {
      // Log admin login
      await AdminAuthService.logAdminAction(
        result.user!.id,
        'admin_login',
        { loginMethod: result.user!.twoFactorEnabled ? '2FA' : 'password' },
        req.ip
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/auth/logout', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await AdminAuthService.logout(token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

// Two-Factor Authentication Setup
router.post('/auth/setup-2fa', requireAuth, requireAdmin, async (req, res) => {
  try {
    const setup = await AdminAuthService.setupTwoFactor(req.user!.id);
    res.json(setup);
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup two-factor authentication' });
  }
});

router.post('/auth/enable-2fa', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { totpCode } = req.body;
    const success = await AdminAuthService.enableTwoFactor(req.user!.id, totpCode);
    
    if (success) {
      await AdminAuthService.logAdminAction(
        req.user!.id,
        'enable_2fa',
        { method: 'TOTP' },
        req.ip
      );
    }
    
    res.json({ success });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ success: false, error: 'Failed to enable two-factor authentication' });
  }
});

router.post('/auth/disable-2fa', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    const success = await AdminAuthService.disableTwoFactor(req.user!.id, password);
    
    if (success) {
      await AdminAuthService.logAdminAction(
        req.user!.id,
        'disable_2fa',
        {},
        req.ip
      );
    }
    
    res.json({ success });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ success: false, error: 'Failed to disable two-factor authentication' });
  }
});

// Dashboard Statistics
router.get('/dashboard/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    const analytics = await AdminAuthService.getAdminAnalytics(dateRange);
    const dashboardStats = {
      overview: {
        totalUsers: analytics.totalUsers || 0,
        activeUsers: analytics.activeUsers || 0,
        pendingModerations: analytics.pendingModerations || 0,
        systemAlerts: analytics.systemAlerts || 0,
        revenue: analytics.revenue || 0,
        plantIdentifications: analytics.plantIdentifications || 0,
      },
      realTime: {
        onlineUsers: analytics.onlineUsers || 0,
        activeIdentifications: analytics.activeIdentifications || 0,
        pendingOrders: analytics.pendingOrders || 0,
        serverLoad: analytics.serverLoad || 0,
      },
      security: {
        failedLogins: analytics.failedLogins || 0,
        suspiciousActivity: analytics.suspiciousActivity || 0,
        activeAdminSessions: analytics.activeAdminSessions || 0,
      }
    };

    res.json(dashboardStats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// User Management
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:userId/admin-status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;
    
    const user = await storage.updateUserAdminStatus(userId, isAdmin);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_user_admin_status',
      { targetUserId: userId, isAdmin },
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

router.patch('/users/:userId/active-status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    const user = await storage.updateUserActiveStatus(userId, isActive);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_user_active_status',
      { targetUserId: userId, isActive },
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    console.error('Update active status error:', error);
    res.status(500).json({ error: 'Failed to update active status' });
  }
});

// Employee Management
router.get('/employees', requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement getAllEmployees in storage
    const employees = await storage.getAllEmployees?.() || [];
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/employees', requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement createEmployee in storage
    const employee = await storage.createEmployee?.(req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'create_employee',
      { employeeId: employee?.id },
      req.ip
    );
    
    res.json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Content Moderation
router.get('/moderation/queue', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending', entityType } = req.query;
    // TODO: Implement getModerationQueue in storage
    const queue = await storage.getModerationQueue?.(status as string, entityType as string) || [];
    res.json(queue);
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

router.patch('/moderation/:itemId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status, reason, notes } = req.body;
    
    // TODO: Implement updateModerationItem in storage
    const item = await storage.updateModerationItem?.(itemId, {
      status,
      reason,
      notes,
      moderatorId: req.user!.id,
      reviewedAt: new Date()
    });
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'moderate_content',
      { itemId, status, reason },
      req.ip
    );
    
    res.json(item);
  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(500).json({ error: 'Failed to perform moderation action' });
  }
});

// Brand Management
router.get('/brand/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement getBrandSettings in storage
    const settings = await storage.getBrandSettings?.() || [];
    res.json(settings);
  } catch (error) {
    console.error('Get brand settings error:', error);
    res.status(500).json({ error: 'Failed to fetch brand settings' });
  }
});

router.post('/brand/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement createBrandSetting in storage
    const setting = await storage.createBrandSetting?.(req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_brand_setting',
      { key: req.body.key, category: req.body.category },
      req.ip
    );
    
    res.json(setting);
  } catch (error) {
    console.error('Create brand setting error:', error);
    res.status(500).json({ error: 'Failed to create brand setting' });
  }
});

router.patch('/brand/settings/:settingId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { settingId } = req.params;
    // TODO: Implement updateBrandSetting in storage
    const setting = await storage.updateBrandSetting?.(settingId, req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_brand_setting',
      { settingId, updates: req.body },
      req.ip
    );
    
    res.json(setting);
  } catch (error) {
    console.error('Update brand setting error:', error);
    res.status(500).json({ error: 'Failed to update brand setting' });
  }
});

// Analytics
router.get('/analytics/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };
    
    const analytics = await AdminAuthService.getAdminAnalytics(dateRange);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

router.get('/analytics/events', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { eventType, entityType, limit = 100 } = req.query;
    // TODO: Implement getAnalyticsEvents in storage
    const events = await storage.getAnalyticsEvents?.(
      eventType as string,
      entityType as string,
      parseInt(limit as string)
    ) || [];
    res.json(events);
  } catch (error) {
    console.error('Analytics events error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics events' });
  }
});

// System Settings
router.get('/system/health', requireAuth, requireAdmin, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
      database: 'connected',
      services: {
        authentication: 'operational',
        plantIdentification: 'operational',
        payments: 'operational',
        email: 'operational'
      }
    };
    res.json(health);
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

export default router;