import type { User } from '@shared/schema';

interface WhatsAppMessage {
  to: string;
  body: string;
}

interface WhatsAppServiceResult {
  success: boolean;
  message: string;
  messageSid?: string;
}

export class WhatsAppService {
  private twilioAccountSid: string | undefined;
  private twilioAuthToken: string | undefined;
  private twilioWhatsAppNumber: string | undefined;

  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  /**
   * Check if WhatsApp service is configured
   */
  isConfigured(): boolean {
    return !!(this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppNumber);
  }

  /**
   * Validate if user can use WhatsApp features
   * - Must have Pro or Premium plan
   * - Must have verified phone number
   */
  canUserAccessWhatsApp(user: User): { allowed: boolean; reason?: string } {
    // Check if user has Pro or Premium plan
    if (!user.subscriptionPlanId || (user.subscriptionPlanId !== 'pro' && user.subscriptionPlanId !== 'premium')) {
      return {
        allowed: false,
        reason: 'WhatsApp sharing is only available for Pro and Premium plan subscribers'
      };
    }

    // Check if user has a phone number
    if (!user.phoneNumber) {
      return {
        allowed: false,
        reason: 'Please add and verify your phone number to use WhatsApp sharing'
      };
    }

    // Check if phone number is verified
    if (!user.phoneVerifiedAt) {
      return {
        allowed: false,
        reason: 'Please verify your phone number to use WhatsApp sharing'
      };
    }

    return { allowed: true };
  }

  /**
   * Send WhatsApp message to user's registered phone number only
   * Security: Always uses the phone number from the user record, never from request payload
   */
  async sendToRegisteredNumber(user: User, messageBody: string): Promise<WhatsAppServiceResult> {
    // Validate configuration
    if (!this.isConfigured()) {
      console.error('WhatsApp service not configured - missing Twilio credentials');
      return {
        success: false,
        message: 'WhatsApp service is not configured. Please contact support.'
      };
    }

    // Validate user access
    const accessCheck = this.canUserAccessWhatsApp(user);
    if (!accessCheck.allowed) {
      return {
        success: false,
        message: accessCheck.reason || 'Access denied'
      };
    }

    // Security: Use phone number from user record only (never from request)
    const recipientNumber = user.phoneNumber!;

    try {
      // Format the WhatsApp number (add whatsapp: prefix)
      const toWhatsApp = recipientNumber.startsWith('whatsapp:') 
        ? recipientNumber 
        : `whatsapp:${recipientNumber}`;
      
      const fromWhatsApp = this.twilioWhatsAppNumber!.startsWith('whatsapp:')
        ? this.twilioWhatsAppNumber!
        : `whatsapp:${this.twilioWhatsAppNumber!}`;

      // Prepare Twilio API request
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
      const auth = Buffer.from(`${this.twilioAccountSid!}:${this.twilioAuthToken!}`).toString('base64');

      const params = new URLSearchParams();
      params.append('To', toWhatsApp);
      params.append('From', fromWhatsApp);
      params.append('Body', messageBody);

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Twilio API error:', data);
        return {
          success: false,
          message: data.message || 'Failed to send WhatsApp message'
        };
      }

      // Log successful send for audit
      console.log(`WhatsApp message sent successfully to ${recipientNumber} (user: ${user.email}), SID: ${data.sid}`);

      return {
        success: true,
        message: 'WhatsApp message sent successfully',
        messageSid: data.sid
      };

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        message: 'An error occurred while sending WhatsApp message'
      };
    }
  }

  /**
   * Send plant care sheet via WhatsApp
   */
  async sharePlantCareSheet(user: User, plantName: string, shareUrl: string): Promise<WhatsAppServiceResult> {
    const message = `🌿 *${plantName} - Care Sheet*\n\nHere's your plant care information:\n${shareUrl}\n\n- Sent from GreenLens Garden Dashboard`;
    return this.sendToRegisteredNumber(user, message);
  }

  /**
   * Send shared plant link via WhatsApp
   */
  async sharePlantProfile(user: User, plantName: string, shareUrl: string): Promise<WhatsAppServiceResult> {
    const message = `🌱 *Check out my ${plantName}!*\n\nI'm tracking my plant's progress on GreenLens. Take a look:\n${shareUrl}\n\n- Shared from GreenLens`;
    return this.sendToRegisteredNumber(user, message);
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
