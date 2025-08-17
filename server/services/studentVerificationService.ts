import { db } from "../db";
import { studentUsers, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { sendEmail } from "./emailService";

export class StudentVerificationService {
  // Send verification email to student
  static async sendVerificationEmail(email: string, firstName: string) {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Student Registration Received - GreenLens</h2>
        
        <p>Dear ${firstName},</p>
        
        <p>Thank you for registering as a student on GreenLens! We have received your application and supporting documents.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1; margin-top: 0;">What happens next?</h3>
          <ul style="color: #374151;">
            <li>Our admin team will review your academic credentials and supporting documents</li>
            <li>Verification typically takes 1-3 business days</li>
            <li>You'll receive an email confirmation once your account is approved</li>
            <li>After approval, you'll enjoy 15% student discount on all e-books!</li>
          </ul>
        </div>
        
        <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>Status:</strong> Verification Pending<br>
            <strong>Expected Response:</strong> Within 3 business days
          </p>
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>
        <strong>GreenLens Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This email was sent to ${email}. If you did not register for a student account, please ignore this email.
        </p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Student Registration Received - Verification Pending",
      html: emailContent
    });
  }

  // Send approval email
  static async sendApprovalEmail(email: string, firstName: string) {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">🎉 Student Account Approved - GreenLens</h2>
        
        <p>Dear ${firstName},</p>
        
        <p>Congratulations! Your student account has been <strong style="color: #22c55e;">approved</strong> by our admin team.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #22c55e;">
          <h3 style="color: #15803d; margin-top: 0;">Your Student Benefits:</h3>
          <ul style="color: #374151;">
            <li><strong>15% discount</strong> on all e-books</li>
            <li>Access to student-exclusive content</li>
            <li>Priority customer support</li>
            <li>Academic resource recommendations</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://greenlens.repl.co/ebooks" 
             style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Browse E-books with Student Discount
          </a>
        </div>
        
        <p>You can now log in to your account and start enjoying your student benefits immediately!</p>
        
        <p>Happy learning!<br>
        <strong>GreenLens Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          Your student status will be automatically updated when you graduate. Please inform us of any changes to your academic status.
        </p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "🎉 Student Account Approved - Welcome to GreenLens!",
      html: emailContent
    });
  }

  // Send rejection email
  static async sendRejectionEmail(email: string, firstName: string, reason: string) {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Student Application Update - GreenLens</h2>
        
        <p>Dear ${firstName},</p>
        
        <p>Thank you for your interest in our student program. After reviewing your application, we are unable to approve your student account at this time.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #dc2626; margin-top: 0;">Reason for rejection:</h3>
          <p style="color: #374151; margin-bottom: 0;">${reason}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1; margin-top: 0;">Next Steps:</h3>
          <ul style="color: #374151;">
            <li>You can reapply with updated documentation</li>
            <li>Create a regular account to access our platform</li>
            <li>Contact support if you have questions about the requirements</li>
          </ul>
        </div>
        
        <p>We appreciate your understanding and encourage you to explore our platform as a regular user.</p>
        
        <p>Best regards,<br>
        <strong>GreenLens Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          If you believe this decision was made in error, please contact our support team with your application details.
        </p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Student Application Update - GreenLens",
      html: emailContent
    });
  }

  // Convert student to regular user after graduation
  static async convertStudentToRegularUser(studentId: string, adminId: string) {
    const [student] = await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.id, studentId))
      .limit(1);

    if (!student) {
      throw new Error('Student not found');
    }

    // Create regular user account
    const newUser = await db.insert(users).values({
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      country: student.country,
      password: student.password,
      emailVerified: student.emailVerified,
      isActive: true
    }).returning();

    // Update student record to mark as converted
    await db
      .update(studentUsers)
      .set({
        isConverted: true,
        convertedUserId: newUser[0].id,
        conversionDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(studentUsers.id, studentId));

    // Send conversion email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Account Upgraded - Congratulations Graduate! 🎓</h2>
        
        <p>Dear ${student.firstName},</p>
        
        <p>Congratulations on completing your studies! Your student account has been automatically converted to a regular user account.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d; margin-top: 0;">Account Changes:</h3>
          <ul style="color: #374151;">
            <li>Your account remains active with full access</li>
            <li>Student discount no longer applies</li>
            <li>You can still access previously purchased e-books</li>
            <li>All account data has been preserved</li>
          </ul>
        </div>
        
        <p>Thank you for being part of our student community. We wish you success in your career!</p>
        
        <p>Best regards,<br>
        <strong>GreenLens Team</strong></p>
      </div>
    `;

    await sendEmail({
      to: student.email,
      subject: "🎓 Account Upgraded - Congratulations Graduate!",
      html: emailContent
    });

    return newUser[0];
  }

  // Get pending student verifications for admin
  static async getPendingVerifications() {
    return await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.verificationStatus, 'pending'))
      .orderBy(studentUsers.createdAt);
  }

  // Get students approaching graduation (for manual review)
  static async getStudentsNearGraduation() {
    const currentYear = new Date().getFullYear();
    
    return await db
      .select()
      .from(studentUsers)
      .where(
        and(
          eq(studentUsers.verificationStatus, 'approved'),
          eq(studentUsers.isActive, true),
          eq(studentUsers.isConverted, false)
        )
      )
      .orderBy(studentUsers.expectedGraduation);
  }
}