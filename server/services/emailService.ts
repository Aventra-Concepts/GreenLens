// Simple email service for development
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