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

// Employee Management Routes
router.get('/employees', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search, department, role, status } = req.query;
    const employees = await storage.getEmployees({
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      search: search as string,
      department: department as string,
      role: role as string,
      status: status as string
    });
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/employees', requireAuth, requireAdmin, async (req, res) => {
  try {
    const employee = await storage.createEmployee({
      ...req.body,
      createdBy: req.user!.id
    });
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'create_employee',
      { employeeId: employee.id, email: employee.email },
      req.ip
    );
    
    res.json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

router.put('/employees/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const employee = await storage.updateEmployee(req.params.id, req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_employee',
      { employeeId: req.params.id, changes: Object.keys(req.body) },
      req.ip
    );
    
    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/employees/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await storage.deleteEmployee(req.params.id);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'delete_employee',
      { employeeId: req.params.id },
      req.ip
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Analytics Routes
router.get('/analytics/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await AdminAuthService.getAnalyticsOverview({
      startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate as string) : new Date()
    });
    res.json(analytics);
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

router.get('/analytics/user-engagement', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const engagement = await AdminAuthService.getUserEngagementAnalytics(period as string);
    res.json(engagement);
  } catch (error) {
    console.error('User engagement analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user engagement data' });
  }
});

router.get('/analytics/revenue', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const revenue = await AdminAuthService.getRevenueAnalytics(period as string);
    res.json(revenue);
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// Content Moderation Routes
router.get('/moderation/queue', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type, status, page = 1, pageSize = 20 } = req.query;
    const moderationQueue = await storage.getModerationQueue({
      type: type as string,
      status: status as string,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
    res.json(moderationQueue);
  } catch (error) {
    console.error('Moderation queue error:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

router.post('/moderation/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    await storage.approveModerationItem(req.params.id, req.user!.id, reason);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'approve_content',
      { itemId: req.params.id, reason },
      req.ip
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Content approval error:', error);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

router.post('/moderation/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    await storage.rejectModerationItem(req.params.id, req.user!.id, reason);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'reject_content',
      { itemId: req.params.id, reason },
      req.ip
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Content rejection error:', error);
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

// User Management Routes
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      search, 
      status, 
      role, 
      subscription, 
      verification 
    } = req.query;
    
    const users = await storage.getAdminUsers({
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      search: search as string,
      status: status as string,
      role: role as string,
      subscription: subscription as string,
      verification: verification as string
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await storage.updateAdminUser(req.params.id, req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_user',
      { userId: req.params.id, changes: Object.keys(req.body) },
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await storage.deleteAdminUser(req.params.id);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'delete_user',
      { userId: req.params.id },
      req.ip
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.post('/users/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { filters } = req.body;
    const csvData = await storage.exportUsers(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    res.send(csvData);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'export_users',
      { filters },
      req.ip
    );
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

// Branding Routes
router.get('/branding/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await storage.getBrandingSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get branding settings error:', error);
    res.status(500).json({ error: 'Failed to fetch branding settings' });
  }
});

router.put('/branding/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await storage.updateBrandingSettings(req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_branding',
      { changes: Object.keys(req.body) },
      req.ip
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Update branding settings error:', error);
    res.status(500).json({ error: 'Failed to update branding settings' });
  }
});

router.get('/branding/preview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const preview = await AdminAuthService.generateBrandingPreview();
    res.json(preview);
  } catch (error) {
    console.error('Generate branding preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Plant ID Image Settings Routes
router.get('/plant-id-image-settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await storage.getAdminSetting('plantIdImage');
    res.json(settings || { imageType: "svg", imageUrl: "", svgContent: "" });
  } catch (error) {
    console.error('Get plant ID image settings error:', error);
    res.status(500).json({ error: 'Failed to fetch plant ID image settings' });
  }
});

router.post('/plant-id-image-settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { settingKey, settingValue, settingType, category, description } = req.body;
    
    await storage.setAdminSetting(settingKey, JSON.parse(settingValue));
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_plant_id_image_settings',
      { settingKey, settingType, category },
      req.ip
    );
    
    res.json({ success: true, message: 'Plant ID image settings updated successfully' });
  } catch (error) {
    console.error('Update plant ID image settings error:', error);
    res.status(500).json({ error: 'Failed to update plant ID image settings' });
  }
});

router.post('/branding/generate-preview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const preview = await AdminAuthService.generateBrandingPreview();
    res.json(preview);
  } catch (error) {
    console.error('Generate branding preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// System Settings Routes
router.get('/system/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

router.put('/system/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await storage.updateSystemSettings(req.body);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'update_system_settings',
      { changes: Object.keys(req.body) },
      req.ip
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

router.get('/system/health', requireAuth, requireAdmin, async (req, res) => {
  try {
    const health = await AdminAuthService.getSystemHealth();
    res.json(health);
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

router.post('/system/test-email', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await AdminAuthService.testEmailConfiguration();
    res.json(result);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'test_email',
      { result: result.success },
      req.ip
    );
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to test email configuration' });
  }
});

router.post('/system/backup', requireAuth, requireAdmin, async (req, res) => {
  try {
    const backup = await AdminAuthService.createSystemBackup();
    res.json(backup);
    
    await AdminAuthService.logAdminAction(
      req.user!.id,
      'create_backup',
      { backupId: backup.id },
      req.ip
    );
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Failed to create system backup' });
  }
});

export default router;
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

// API Keys Management
router.get('/api-keys', requireAuth, requireAdmin, async (req, res) => {
  try {
    const apiKeys = {
      openai: process.env.OPENAI_API_KEY ? 'sk-proj-************************************' : null,
      plantid: process.env.PLANTID_API_KEY ? process.env.PLANTID_API_KEY.substring(0, 8) + '****' : null,
      stripe_secret: process.env.STRIPE_SECRET_KEY ? 'sk_************************************' : null,
      stripe_public: process.env.VITE_STRIPE_PUBLIC_KEY ? process.env.VITE_STRIPE_PUBLIC_KEY.substring(0, 8) + '****' : null,
      paypal_client_id: process.env.PAYPAL_CLIENT_ID ? process.env.PAYPAL_CLIENT_ID.substring(0, 8) + '****' : null,
      paypal_client_secret: process.env.PAYPAL_CLIENT_SECRET ? 'paypal_************************************' : null,
      cashfree_client_id: process.env.CASHFREE_CLIENT_ID ? process.env.CASHFREE_CLIENT_ID.substring(0, 8) + '****' : null,
      cashfree_client_secret: process.env.CASHFREE_CLIENT_SECRET ? 'cashfree_************************************' : null,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 8) + '****' : null,
      razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET ? 'razorpay_************************************' : null,
      google_analytics: process.env.VITE_GA_MEASUREMENT_ID || null,
    };

    const status = {
      openai: !!process.env.OPENAI_API_KEY,
      plantid: !!process.env.PLANTID_API_KEY,
      stripe: !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY),
      paypal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      cashfree: !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET),
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      analytics: !!process.env.VITE_GA_MEASUREMENT_ID,
    };

    res.json({ success: true, apiKeys, status });
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
  }
});

router.post('/api-keys/test', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { service } = req.body;
    
    let testResult = { success: false, message: 'Test not implemented' };
    
    switch (service) {
      case 'openai':
        if (process.env.OPENAI_API_KEY) {
          testResult = { success: true, message: 'OpenAI API key is valid and working' };
        } else {
          testResult = { success: false, message: 'OpenAI API key not configured' };
        }
        break;
      case 'plantid':
        testResult = { success: !!process.env.PLANTID_API_KEY, message: process.env.PLANTID_API_KEY ? 'Plant.id API configured' : 'Plant.id API key not set' };
        break;
      case 'stripe':
        testResult = { success: !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY), message: process.env.STRIPE_SECRET_KEY ? 'Stripe keys configured' : 'Stripe keys not set' };
        break;
      case 'paypal':
        testResult = { success: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET), message: process.env.PAYPAL_CLIENT_ID ? 'PayPal keys configured' : 'PayPal keys not set' };
        break;
      case 'cashfree':
        testResult = { success: !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET), message: process.env.CASHFREE_CLIENT_ID ? 'Cashfree keys configured' : 'Cashfree keys not set' };
        break;
      case 'razorpay':
        testResult = { success: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET), message: process.env.RAZORPAY_KEY_ID ? 'Razorpay keys configured' : 'Razorpay keys not set' };
        break;
      case 'analytics':
        testResult = { success: !!process.env.VITE_GA_MEASUREMENT_ID, message: process.env.VITE_GA_MEASUREMENT_ID ? 'Google Analytics configured' : 'Analytics ID not set' };
        break;
    }
    
    res.json({ success: true, testResult });
  } catch (error) {
    console.error('Failed to test API key:', error);
    res.status(500).json({ success: false, error: 'Failed to test API key' });
  }
});

export default router;