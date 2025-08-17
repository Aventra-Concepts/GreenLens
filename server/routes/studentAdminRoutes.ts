import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../auth";
import { StudentConversionService } from "../services/studentConversionService";
import { db } from "../db";
import { studentUsers } from "@shared/schema";
import { eq, and, count } from "drizzle-orm";

const router = Router();

// Get students eligible for conversion (Admin only)
router.get('/students/eligible-conversion', requireAuth, requireAdmin, async (req, res) => {
  try {
    const eligibleStudents = await storage.getStudentsEligibleForConversion();
    res.json(eligibleStudents);
  } catch (error) {
    console.error('Error getting eligible students:', error);
    res.status(500).json({ error: 'Failed to get eligible students' });
  }
});

// Extend student status by 1 year (Admin only)
router.post('/students/:studentId/extend', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const result = await StudentConversionService.extendStudentStatus(studentId, adminId);
    
    if (result.success) {
      res.json({ message: 'Student status extended successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error extending student status:', error);
    res.status(500).json({ error: 'Failed to extend student status' });
  }
});

// Mark student as graduated (Admin only)
router.post('/students/:studentId/graduate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const result = await StudentConversionService.markStudentGraduated(studentId);
    
    if (result.success) {
      res.json({ message: 'Student marked as graduated successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error marking student as graduated:', error);
    res.status(500).json({ error: 'Failed to mark student as graduated' });
  }
});

// Manually convert student to user (Admin only)
router.post('/students/:studentId/convert', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const result = await StudentConversionService.convertStudentToUser(studentId);
    
    if (result.success) {
      res.json({ 
        message: 'Student converted to user successfully',
        userId: result.userId 
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error converting student:', error);
    res.status(500).json({ error: 'Failed to convert student' });
  }
});

// Run automatic conversion process (Admin only)
router.post('/students/run-conversion', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await StudentConversionService.runAutomaticConversion();
    
    res.json({
      message: 'Automatic conversion process completed',
      convertedCount: result.convertedCount,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error running automatic conversion:', error);
    res.status(500).json({ error: 'Failed to run automatic conversion' });
  }
});

// Get student discount eligibility and calculate discount
router.get('/students/:studentId/discount', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount } = req.query;
    
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Valid amount required' });
    }
    
    const isEligible = await StudentConversionService.isStudentEligibleForDiscount(studentId);
    
    if (isEligible) {
      const discount = StudentConversionService.calculateStudentDiscount(Number(amount));
      res.json({
        eligible: true,
        originalAmount: Number(amount),
        discountedAmount: discount.discountedAmount,
        discountValue: discount.discountValue,
        discountPercentage: 10
      });
    } else {
      res.json({
        eligible: false,
        originalAmount: Number(amount),
        discountedAmount: Number(amount),
        discountValue: 0,
        discountPercentage: 0
      });
    }
  } catch (error) {
    console.error('Error calculating student discount:', error);
    res.status(500).json({ error: 'Failed to calculate discount' });
  }
});

// Update all student conversion dates (Admin only)
router.post('/students/update-conversion-dates', requireAuth, requireAdmin, async (req, res) => {
  try {
    await StudentConversionService.updateAllStudentConversionDates();
    res.json({ message: 'All student conversion dates updated successfully' });
  } catch (error) {
    console.error('Error updating conversion dates:', error);
    res.status(500).json({ error: 'Failed to update conversion dates' });
  }
});

// Get conversion statistics
router.get('/students/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalStudents = await db
      .select({ count: count() })
      .from(studentUsers)
      .where(eq(studentUsers.verificationStatus, 'verified'));

    const activeStudents = await db
      .select({ count: count() })
      .from(studentUsers)
      .where(and(
        eq(studentUsers.verificationStatus, 'verified'),
        eq(studentUsers.isActive, true),
        eq(studentUsers.isConverted, false)
      ));

    const convertedStudents = await db
      .select({ count: count() })
      .from(studentUsers)
      .where(eq(studentUsers.isConverted, true));

    const eligibleStudents = await storage.getStudentsEligibleForConversion();
    
    const extensionData = await db
      .select({ count: count() })
      .from(studentUsers)
      .where(and(
        eq(studentUsers.verificationStatus, 'verified'),
        eq(studentUsers.adminExtensionGranted, true)
      ));

    res.json({
      totalStudents: totalStudents[0]?.count || 0,
      activeStudents: activeStudents[0]?.count || 0,
      convertedStudents: convertedStudents[0]?.count || 0,
      eligibleForConversion: eligibleStudents.length,
      extensionsGranted: extensionData[0]?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;