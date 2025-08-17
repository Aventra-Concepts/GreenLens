import { storage } from "../storage";
import nodemailer from "nodemailer";

export class StudentVerificationService {
  // Send verification email to student
  static async sendVerificationEmail(email: string, firstName: string): Promise<boolean> {
    try {
      // For development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log(`Student verification email would be sent to: ${email}`);
        console.log(`Email content: Welcome ${firstName}, your student registration is being reviewed.`);
        return true;
      }

      // In production, configure nodemailer with your email service
      // const transporter = nodemailer.createTransporter({
      //   // Configure your email service here
      // });
      
      // For now, return true as we're in development
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  // Send approval email to student
  static async sendApprovalEmail(email: string, firstName: string): Promise<boolean> {
    try {
      // For development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log(`Student approval email would be sent to: ${email}`);
        console.log(`Email content: Congratulations ${firstName}, your student account has been approved! You now have access to student discounts.`);
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  }

  // Send rejection email to student
  static async sendRejectionEmail(email: string, firstName: string, reason?: string): Promise<boolean> {
    try {
      // For development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log(`Student rejection email would be sent to: ${email}`);
        console.log(`Email content: Hello ${firstName}, unfortunately your student verification was not approved. ${reason || 'Please contact support for more information.'}`);
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return false;
    }
  }

  // Validate student document
  static validateStudentDocument(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF and image files (JPG, PNG) are allowed.'
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 10MB.'
      };
    }

    return { valid: true };
  }

  // Check if student email belongs to educational institution
  static isEducationalEmail(email: string): boolean {
    const educationalDomains = [
      '.edu',
      '.ac.',
      '.edu.',
      'university',
      'college',
      'school'
    ];

    const emailLower = email.toLowerCase();
    return educationalDomains.some(domain => emailLower.includes(domain));
  }

  // Process graduation and convert to regular user
  static async processGraduation(studentId: string): Promise<boolean> {
    try {
      const student = await storage.getStudentUser(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Create regular user account with student's information
      const regularUser = await storage.createUser({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        password: student.password, // Already hashed
        location: student.country,
        preferredLanguage: 'en'
      });

      // Update student status to graduated
      await storage.updateStudentUser(studentId, {
        verificationStatus: 'graduated',
        graduatedAt: new Date(),
        convertedUserId: regularUser.id
      });

      // Send graduation notification email
      await this.sendGraduationEmail(student.email, student.firstName);

      return true;
    } catch (error) {
      console.error('Error processing graduation:', error);
      return false;
    }
  }

  // Send graduation email
  static async sendGraduationEmail(email: string, firstName: string): Promise<boolean> {
    try {
      // For development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log(`Graduation email would be sent to: ${email}`);
        console.log(`Email content: Congratulations ${firstName} on your graduation! Your account has been converted to a regular user account.`);
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error sending graduation email:', error);
      return false;
    }
  }

  // Get students approaching graduation
  static async getStudentsApproachingGraduation(): Promise<any[]> {
    try {
      const currentYear = new Date().getFullYear();
      const students = await storage.getStudentUsersByGraduationYear(currentYear.toString());
      
      return students.filter(student => 
        student.verificationStatus === 'approved' && 
        !student.graduatedAt
      );
    } catch (error) {
      console.error('Error getting students approaching graduation:', error);
      return [];
    }
  }

  // Auto-process graduations for current year
  static async autoProcessGraduations(): Promise<number> {
    try {
      const studentsToGraduate = await this.getStudentsApproachingGraduation();
      let processedCount = 0;

      for (const student of studentsToGraduate) {
        const success = await this.processGraduation(student.id);
        if (success) {
          processedCount++;
        }
      }

      console.log(`Auto-processed ${processedCount} student graduations`);
      return processedCount;
    } catch (error) {
      console.error('Error auto-processing graduations:', error);
      return 0;
    }
  }
}