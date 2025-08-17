// Email service for development and production
interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // For development, just log the email instead of sending
    console.log('=== EMAIL SENT ===');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('HTML Content:', params.html);
    console.log('==================');
    
    // In production, this would integrate with SendGrid or another email service
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

// EmailService class with specific methods for different email types
export class EmailService {
  // Expert application confirmation email
  static async sendExpertApplicationConfirmation(email: string, name: string, applicationId: string): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'Expert Application Received - GreenLens',
      html: `
        <h2>Expert Application Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for applying to become a plant expert with GreenLens. We have received your application.</p>
        <p><strong>Application ID:</strong> ${applicationId}</p>
        <p>Our team will review your qualifications and get back to you within 5-7 business days.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  // Admin notification for expert application
  static async sendExpertApplicationNotificationToAdmin(application: any): Promise<boolean> {
    return sendEmail({
      to: 'admin@greenlens.com',
      subject: 'New Expert Application - GreenLens Admin',
      html: `
        <h2>New Expert Application Received</h2>
        <p><strong>Applicant:</strong> ${application.fullName}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Specialization:</strong> ${application.specialization}</p>
        <p><strong>Experience:</strong> ${application.experienceYears} years</p>
        <p><strong>Application ID:</strong> ${application.id}</p>
        <p>Please review the application in the admin dashboard.</p>
      `
    });
  }

  // Expert application status update
  static async sendExpertApplicationStatusUpdate(email: string, name: string, status: string, adminNotes?: string): Promise<boolean> {
    const statusMessage = status === 'approved' 
      ? 'Congratulations! Your expert application has been approved.' 
      : 'Unfortunately, your expert application has been declined.';
      
    return sendEmail({
      to: email,
      subject: `Expert Application ${status === 'approved' ? 'Approved' : 'Declined'} - GreenLens`,
      html: `
        <h2>Expert Application Update</h2>
        <p>Dear ${name},</p>
        <p>${statusMessage}</p>
        ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  // Consultation request confirmation
  static async sendConsultationRequestConfirmation(email: string, name: string, consultationId: string): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'Consultation Request Received - GreenLens',
      html: `
        <h2>Consultation Request Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for requesting a consultation with our plant experts.</p>
        <p><strong>Consultation ID:</strong> ${consultationId}</p>
        <p>Please proceed with payment to confirm your consultation booking.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  // Admin notification for consultation request
  static async sendConsultationRequestNotificationToAdmin(consultation: any): Promise<boolean> {
    return sendEmail({
      to: 'admin@greenlens.com',
      subject: 'New Consultation Request - GreenLens Admin',
      html: `
        <h2>New Consultation Request</h2>
        <p><strong>Client:</strong> ${consultation.name}</p>
        <p><strong>Email:</strong> ${consultation.email}</p>
        <p><strong>Phone:</strong> ${consultation.phone}</p>
        <p><strong>Problem:</strong> ${consultation.plantProblem}</p>
        <p><strong>Consultation ID:</strong> ${consultation.id}</p>
        <p>Please assign an expert to this consultation.</p>
      `
    });
  }

  // Consultation payment confirmation
  static async sendConsultationPaymentConfirmation(email: string, name: string, consultationId: string, amount: number): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'Payment Confirmed - Consultation Booking - GreenLens',
      html: `
        <h2>Payment Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Your payment of $${amount} has been confirmed for consultation ID: ${consultationId}</p>
        <p>Our team will assign an expert and contact you within 24 hours to schedule your consultation.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  // Consultation status update
  static async sendConsultationStatusUpdate(email: string, name: string, status: string, expertName?: string, scheduledDate?: Date): Promise<boolean> {
    let message = '';
    
    switch (status) {
      case 'expert_assigned':
        message = `Your consultation has been assigned to ${expertName}. They will contact you soon to schedule the session.`;
        break;
      case 'scheduled':
        message = `Your consultation is scheduled for ${scheduledDate?.toLocaleDateString()} with ${expertName}.`;
        break;
      case 'completed':
        message = 'Your consultation has been completed. Thank you for using GreenLens!';
        break;
      default:
        message = `Your consultation status has been updated to: ${status}`;
    }

    return sendEmail({
      to: email,
      subject: 'Consultation Update - GreenLens',
      html: `
        <h2>Consultation Update</h2>
        <p>Dear ${name},</p>
        <p>${message}</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  // E-book platform emails
  static async sendEbookPurchaseConfirmation(email: string, ebookTitle: string, downloadUrl: string, downloadPassword: string): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'E-book Purchase Confirmation - GreenLens',
      html: `
        <h2>E-book Purchase Confirmed</h2>
        <p>Thank you for purchasing "${ebookTitle}" from GreenLens!</p>
        <p><strong>Download Link:</strong> <a href="${downloadUrl}">${downloadUrl}</a></p>
        <p><strong>Download Password:</strong> ${downloadPassword}</p>
        <p>Your download link is valid for your registered email address.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  static async sendStudentVerificationEmail(email: string, name: string): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'Student Registration - Verification Pending - GreenLens',
      html: `
        <h2>Student Registration Received</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering as a student with GreenLens!</p>
        <p>Your application is currently under review. You will receive an email notification once your student status is verified.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  static async sendStudentApprovalEmail(email: string, name: string): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'Student Status Approved - GreenLens',
      html: `
        <h2>Student Status Approved</h2>
        <p>Dear ${name},</p>
        <p>Congratulations! Your student status has been verified and approved.</p>
        <p>You can now enjoy student discounts on all e-books in our marketplace.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }

  static async sendStudentRejectionEmail(email: string, name: string, reason: string): Promise<boolean> {
    return sendEmail({
      to: email,
      subject: 'Student Application Update - GreenLens',
      html: `
        <h2>Student Application Update</h2>
        <p>Dear ${name},</p>
        <p>Unfortunately, we were unable to verify your student status at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you believe this is an error, please contact our support team.</p>
        <p>Best regards,<br>The GreenLens Team</p>
      `
    });
  }
}