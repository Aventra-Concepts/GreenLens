import { storage } from "../storage";
import { db } from "../db";
import { studentUsers, users } from "@shared/schema";
import { eq, and, lt, isNull, or } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class StudentConversionService {
  // Calculate conversion date based on registration and graduation year
  static calculateConversionDate(createdAt: Date, expectedGraduation: string, adminExtensionCount: number = 0): Date {
    const registrationDate = new Date(createdAt);
    const baseConversionDate = new Date(registrationDate);
    
    // Add 3 years from registration as base conversion period
    baseConversionDate.setFullYear(baseConversionDate.getFullYear() + 3);
    
    // If graduation year is provided and is earlier than 3-year mark, use graduation year
    if (expectedGraduation) {
      const graduationYear = parseInt(expectedGraduation);
      if (!isNaN(graduationYear)) {
        const graduationDate = new Date(graduationYear, 5, 30); // June 30th of graduation year
        if (graduationDate < baseConversionDate) {
          baseConversionDate.setTime(graduationDate.getTime());
        }
      }
    }
    
    // Add admin extensions (1 year each)
    baseConversionDate.setFullYear(baseConversionDate.getFullYear() + adminExtensionCount);
    
    return baseConversionDate;
  }

  // Check students eligible for conversion
  static async getStudentsEligibleForConversion(): Promise<any[]> {
    const currentDate = new Date();
    
    return await db
      .select()
      .from(studentUsers)
      .where(
        and(
          eq(studentUsers.isActive, true),
          eq(studentUsers.isConverted, false),
          eq(studentUsers.verificationStatus, 'approved'),
          or(
            // Students past 3 years from registration
            lt(studentUsers.conversionScheduledFor, currentDate),
            // Students who completed graduation
            eq(studentUsers.graduationCompleted, true)
          )
        )
      );
  }

  // Convert student to regular user
  static async convertStudentToUser(studentId: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const student = await storage.getStudentUser(studentId);
      if (!student) {
        return { success: false, error: "Student not found" };
      }

      if (student.isConverted) {
        return { success: false, error: "Student already converted" };
      }

      // Create new regular user account
      const newUser = await storage.createUser({
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        location: student.universityName || 'Not specified',
        password: 'temp_password_' + Math.random().toString(36), // Generate temporary password
        profileImageUrl: null,
        isAuthor: false,
        authorVerified: false,
        // emailVerified: student.emailVerified, // Field not available in users table
        preferredLanguage: 'en',
        timezone: 'UTC',
      });

      // Update student record to mark as converted
      await storage.updateStudentUser(studentId, {
        isConverted: true,
        convertedUserId: newUser.id,
        conversionDate: new Date(),
        isActive: false, // Deactivate student account
      });

      // Log the conversion activity
      await storage.logUserActivity({
        userId: newUser.id,
        activityType: 'student_conversion',
        activityData: {
          originalStudentId: studentId,
          conversionReason: 'automatic_conversion',
          conversionDate: new Date().toISOString(),
        },
      });

      return { success: true, userId: newUser.id };
    } catch (error) {
      console.error('Error converting student to user:', error);
      return { success: false, error: 'Conversion failed' };
    }
  }

  // Extend student status by 1 year (admin function)
  static async extendStudentStatus(studentId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const student = await storage.getStudentUser(studentId);
      if (!student) {
        return { success: false, error: "Student not found" };
      }

      if (student.isConverted) {
        return { success: false, error: "Cannot extend converted student" };
      }

      const currentExtensionCount = student.adminExtensionCount || 0;
      const newExtensionCount = currentExtensionCount + 1;
      
      // Calculate new conversion date
      const newConversionDate = this.calculateConversionDate(
        student.createdAt,
        student.expectedGraduation || '',
        newExtensionCount
      );

      // Update student with extension
      await storage.updateStudentUser(studentId, {
        adminExtensionCount: newExtensionCount,
        lastExtensionDate: new Date(),
        extensionExpiryDate: newConversionDate,
        conversionScheduledFor: newConversionDate,
      });

      // Log the extension activity
      await storage.logUserActivity({
        userId: adminId,
        activityType: 'student_extension',
        activityData: {
          studentId: studentId,
          extensionCount: newExtensionCount,
          newConversionDate: newConversionDate.toISOString(),
          extendedBy: adminId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error extending student status:', error);
      return { success: false, error: 'Extension failed' };
    }
  }

  // Mark student as graduated
  static async markStudentGraduated(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await storage.updateStudentUser(studentId, {
        graduationCompleted: true,
        graduationCompletionDate: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking student as graduated:', error);
      return { success: false, error: 'Update failed' };
    }
  }

  // Calculate student discount (10% off)
  static calculateStudentDiscount(originalAmount: number): { discountedAmount: number; discountValue: number } {
    const discountPercentage = 0.10; // 10%
    const discountValue = originalAmount * discountPercentage;
    const discountedAmount = originalAmount - discountValue;
    
    return {
      discountedAmount: Math.round(discountedAmount * 100) / 100, // Round to 2 decimal places
      discountValue: Math.round(discountValue * 100) / 100,
    };
  }

  // Check if student is eligible for discount
  static async isStudentEligibleForDiscount(studentId: string): Promise<boolean> {
    try {
      const student = await storage.getStudentUser(studentId);
      if (!student) return false;
      
      return (
        student.isActive &&
        !student.isConverted &&
        student.verificationStatus === 'approved' &&
        student.discountApplied === true
      );
    } catch (error) {
      console.error('Error checking student discount eligibility:', error);
      return false;
    }
  }

  // Update conversion scheduled dates for all students
  static async updateAllStudentConversionDates(): Promise<void> {
    try {
      const activeStudents = await db
        .select()
        .from(studentUsers)
        .where(
          and(
            eq(studentUsers.isActive, true),
            eq(studentUsers.isConverted, false)
          )
        );

      for (const student of activeStudents) {
        const conversionDate = this.calculateConversionDate(
          student.createdAt || new Date(),
          student.expectedGraduation || '',
          student.adminExtensionCount || 0
        );

        await storage.updateStudentUser(student.id, {
          conversionScheduledFor: conversionDate,
        });
      }

      console.log(`Updated conversion dates for ${activeStudents.length} students`);
    } catch (error) {
      console.error('Error updating student conversion dates:', error);
    }
  }

  // Run automatic conversion process (to be called daily via cron)
  static async runAutomaticConversion(): Promise<{ convertedCount: number; errors: string[] }> {
    try {
      const eligibleStudents = await this.getStudentsEligibleForConversion();
      let convertedCount = 0;
      const errors: string[] = [];

      console.log(`Found ${eligibleStudents.length} students eligible for conversion`);

      for (const student of eligibleStudents) {
        const result = await this.convertStudentToUser(student.id);
        if (result.success) {
          convertedCount++;
          console.log(`Successfully converted student ${student.email} to user ${result.userId}`);
        } else {
          errors.push(`Failed to convert student ${student.email}: ${result.error}`);
          console.error(`Failed to convert student ${student.email}:`, result.error);
        }
      }

      return { convertedCount, errors };
    } catch (error) {
      console.error('Error running automatic conversion:', (error as Error).message);
      return { convertedCount: 0, errors: [(error as Error).message] };
    }
  }
}