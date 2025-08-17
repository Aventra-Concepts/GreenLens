import sgMail from '@sendgrid/mail';

// Configure SendGrid API key if available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return false;
      }

      const msg = {
        to: options.to,
        from: 'noreply@greenlens.app', // Use your verified sender email
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await sgMail.send(msg);
      console.log('Email sent successfully to:', options.to);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendExpertApplicationConfirmation(email: string, firstName: string): Promise<boolean> {
    const subject = 'Expert Application Received - GreenLens';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Application Received Successfully!</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for applying to become a GreenLens plant expert. We have received your application and it is now under review.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d; margin-top: 0;">What happens next?</h3>
          <ul style="color: #374151;">
            <li>Our team will review your application and qualifications</li>
            <li>Review process typically takes 3-5 business days</li>
            <li>You'll be notified via email once your application is processed</li>
            <li>Approved experts will receive detailed onboarding instructions</li>
          </ul>
        </div>

        <p>If you have any questions about your application, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        The GreenLens Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Dear ${firstName},

      Thank you for applying to become a GreenLens plant expert. We have received your application and it is now under review.

      What happens next?
      - Our team will review your application and qualifications
      - Review process typically takes 3-5 business days
      - You'll be notified via email once your application is processed
      - Approved experts will receive detailed onboarding instructions

      If you have any questions about your application, please don't hesitate to contact our support team.

      Best regards,
      The GreenLens Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  static async sendExpertApplicationNotificationToAdmin(application: any): Promise<boolean> {
    const subject = 'New Expert Application - GreenLens Admin';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Expert Application Received</h2>
        <p>A new expert application has been submitted and requires review.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Application Details:</h3>
          <ul style="color: #374151;">
            <li><strong>Name:</strong> ${application.firstName} ${application.lastName}</li>
            <li><strong>Email:</strong> ${application.email}</li>
            <li><strong>Specialization:</strong> ${application.specialization}</li>
            <li><strong>Experience:</strong> ${application.experience} years</li>
            <li><strong>Location:</strong> ${application.cityName}, ${application.countryName}</li>
            <li><strong>Application ID:</strong> ${application.id}</li>
          </ul>
        </div>

        <p>Please review the application in the admin panel.</p>
        
        <p>Best regards,<br>
        GreenLens System</p>
      </div>
    `;

    const text = `
      New Expert Application Received

      Application Details:
      - Name: ${application.firstName} ${application.lastName}
      - Email: ${application.email}
      - Specialization: ${application.specialization}
      - Experience: ${application.experience} years
      - Location: ${application.cityName}, ${application.countryName}
      - Application ID: ${application.id}

      Please review the application in the admin panel.
    `;

    // Send to admin email (you can configure this)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@greenlens.app';

    return this.sendEmail({
      to: adminEmail,
      subject,
      text,
      html,
    });
  }

  static async sendExpertApplicationStatusUpdate(email: string, firstName: string, status: string, reviewNotes?: string): Promise<boolean> {
    let subject = '';
    let statusMessage = '';
    let statusColor = '';

    switch (status) {
      case 'approved':
        subject = 'Congratulations! Your Expert Application has been Approved - GreenLens';
        statusMessage = 'We are pleased to inform you that your application to become a GreenLens plant expert has been approved!';
        statusColor = '#22c55e';
        break;
      case 'rejected':
        subject = 'Expert Application Update - GreenLens';
        statusMessage = 'Thank you for your interest in becoming a GreenLens plant expert. After careful review, we are unable to proceed with your application at this time.';
        statusColor = '#dc2626';
        break;
      case 'under_review':
        subject = 'Expert Application Under Review - GreenLens';
        statusMessage = 'Your application is currently under detailed review by our team.';
        statusColor = '#f59e0b';
        break;
      default:
        subject = 'Expert Application Update - GreenLens';
        statusMessage = 'Your application status has been updated.';
        statusColor = '#6b7280';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Application Status Update</h2>
        <p>Dear ${firstName},</p>
        <p>${statusMessage}</p>
        
        ${reviewNotes ? `
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Review Notes:</h3>
          <p style="color: #374151;">${reviewNotes}</p>
        </div>
        ` : ''}

        ${status === 'approved' ? `
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d; margin-top: 0;">Next Steps:</h3>
          <ul style="color: #374151;">
            <li>You will receive detailed onboarding instructions shortly</li>
            <li>Complete your expert profile setup</li>
            <li>Review our expert guidelines and best practices</li>
            <li>Start helping plant enthusiasts worldwide!</li>
          </ul>
        </div>
        ` : ''}

        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        The GreenLens Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Dear ${firstName},

      ${statusMessage}

      ${reviewNotes ? `Review Notes: ${reviewNotes}` : ''}

      ${status === 'approved' ? `
      Next Steps:
      - You will receive detailed onboarding instructions shortly
      - Complete your expert profile setup
      - Review our expert guidelines and best practices
      - Start helping plant enthusiasts worldwide!
      ` : ''}

      If you have any questions, please don't hesitate to contact our support team.

      Best regards,
      The GreenLens Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  // Consultation request confirmation email
  static async sendConsultationRequestConfirmation(email: string, name: string, consultationId: string): Promise<boolean> {
    const subject = 'Consultation Request Received - GreenLens';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Consultation Request Received!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for booking a consultation with our plant experts. We have received your request and will process it shortly.</p>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Consultation ID: ${consultationId}</h3>
          <p style="color: #374151; margin-bottom: 0;">Please keep this ID for your records.</p>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d; margin-top: 0;">Next Steps:</h3>
          <ul style="color: #374151;">
            <li>Complete your payment to confirm the consultation</li>
            <li>Once paid, an expert will be assigned within 24 hours</li>
            <li>You'll receive a call at your preferred date and time</li>
            <li>Get personalized plant care advice from certified experts</li>
          </ul>
        </div>

        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        The GreenLens Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Dear ${name},

      Thank you for booking a consultation with our plant experts. We have received your request and will process it shortly.

      Consultation ID: ${consultationId}
      Please keep this ID for your records.

      Next Steps:
      - Complete your payment to confirm the consultation
      - Once paid, an expert will be assigned within 24 hours
      - You'll receive a call at your preferred date and time
      - Get personalized plant care advice from certified experts

      If you have any questions, please don't hesitate to contact our support team.

      Best regards,
      The GreenLens Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  // Admin notification for new consultation request
  static async sendConsultationRequestNotificationToAdmin(consultation: any): Promise<boolean> {
    const subject = 'New Consultation Request - GreenLens Admin';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Consultation Request</h2>
        <p>A new consultation request has been submitted and requires processing.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Request Details:</h3>
          <ul style="color: #374151;">
            <li><strong>Consultation ID:</strong> ${consultation.id}</li>
            <li><strong>Name:</strong> ${consultation.name}</li>
            <li><strong>Email:</strong> ${consultation.email}</li>
            <li><strong>Preferred Date:</strong> ${new Date(consultation.preferredDate).toLocaleDateString()}</li>
            <li><strong>Time Slot:</strong> ${consultation.preferredTimeSlot}</li>
            <li><strong>Problem:</strong> ${consultation.problemDescription}</li>
            <li><strong>Amount:</strong> $${consultation.amount}</li>
          </ul>
        </div>

        <p>Please review and assign an expert once payment is confirmed.</p>
        
        <p>Best regards,<br>
        GreenLens System</p>
      </div>
    `;

    const text = `
      New Consultation Request

      Request Details:
      - Consultation ID: ${consultation.id}
      - Name: ${consultation.name}
      - Email: ${consultation.email}
      - Preferred Date: ${new Date(consultation.preferredDate).toLocaleDateString()}
      - Time Slot: ${consultation.preferredTimeSlot}
      - Problem: ${consultation.problemDescription}
      - Amount: $${consultation.amount}

      Please review and assign an expert once payment is confirmed.
    `;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@greenlens.app';

    return this.sendEmail({
      to: adminEmail,
      subject,
      text,
      html,
    });
  }

  // Payment confirmation for consultation
  static async sendConsultationPaymentConfirmation(email: string, name: string, consultationId: string): Promise<boolean> {
    const subject = 'Payment Confirmed - Expert Consultation Scheduled - GreenLens';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your payment has been successfully processed and your expert consultation is now confirmed.</p>
        
        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin-top: 0;">Consultation ID: ${consultationId}</h3>
          <p style="color: #374151;">Status: <strong>Payment Confirmed</strong></p>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d; margin-top: 0;">What happens next?</h3>
          <ul style="color: #374151;">
            <li>An expert will be assigned to your case within 24 hours</li>
            <li>You'll receive another email with expert details and final scheduling</li>
            <li>The expert will call you at your preferred date and time</li>
            <li>Follow-up recommendations will be sent via email after the consultation</li>
          </ul>
        </div>

        <p>Thank you for choosing GreenLens expert consultation services!</p>
        
        <p>Best regards,<br>
        The GreenLens Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Dear ${name},

      Your payment has been successfully processed and your expert consultation is now confirmed.

      Consultation ID: ${consultationId}
      Status: Payment Confirmed

      What happens next?
      - An expert will be assigned to your case within 24 hours
      - You'll receive another email with expert details and final scheduling
      - The expert will call you at your preferred date and time
      - Follow-up recommendations will be sent via email after the consultation

      Thank you for choosing GreenLens expert consultation services!

      Best regards,
      The GreenLens Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  // Status update for consultation requests
  static async sendConsultationStatusUpdate(email: string, name: string, status: string, notes?: string): Promise<boolean> {
    let subject = '';
    let statusMessage = '';
    let statusColor = '';

    switch (status) {
      case 'assigned':
        subject = 'Expert Assigned - Your Consultation is Ready - GreenLens';
        statusMessage = 'Great news! An expert has been assigned to your consultation request.';
        statusColor = '#059669';
        break;
      case 'scheduled':
        subject = 'Consultation Scheduled - GreenLens';
        statusMessage = 'Your consultation has been scheduled and confirmed.';
        statusColor = '#2563eb';
        break;
      case 'completed':
        subject = 'Consultation Completed - Thank You - GreenLens';
        statusMessage = 'Your consultation has been completed successfully.';
        statusColor = '#059669';
        break;
      case 'cancelled':
        subject = 'Consultation Cancelled - GreenLens';
        statusMessage = 'Your consultation request has been cancelled.';
        statusColor = '#dc2626';
        break;
      default:
        subject = 'Consultation Update - GreenLens';
        statusMessage = 'Your consultation status has been updated.';
        statusColor = '#6b7280';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Consultation Status Update</h2>
        <p>Dear ${name},</p>
        <p>${statusMessage}</p>
        
        ${notes ? `
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374141; margin-top: 0;">Additional Notes:</h3>
          <p style="color: #374141;">${notes}</p>
        </div>
        ` : ''}

        ${status === 'assigned' || status === 'scheduled' ? `
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
          <ul style="color: #374141;">
            <li>Check your email for detailed scheduling information</li>
            <li>Ensure you're available at the scheduled time</li>
            <li>Prepare any questions you'd like to ask the expert</li>
            <li>Have your plant photos ready if needed</li>
          </ul>
        </div>
        ` : ''}

        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        The GreenLens Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Dear ${name},

      ${statusMessage}

      ${notes ? `Additional Notes: ${notes}` : ''}

      ${status === 'assigned' || status === 'scheduled' ? `
      Next Steps:
      - Check your email for detailed scheduling information
      - Ensure you're available at the scheduled time
      - Prepare any questions you'd like to ask the expert
      - Have your plant photos ready if needed
      ` : ''}

      If you have any questions, please don't hesitate to contact our support team.

      Best regards,
      The GreenLens Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}