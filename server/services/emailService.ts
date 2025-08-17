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
}