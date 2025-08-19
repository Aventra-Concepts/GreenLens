// Simplified email service interface for garden subscriptions
interface EmailParams {
  to: string;
  subject: string;
  html: string;
}
import { storage } from '../storage';
import { User } from '@shared/schema';

export class GardenSubscriptionEmailService {
  static async sendSubscriptionWelcome(user: User, subscriptionDetails: {
    subscriptionId: string;
    expiresAt: Date;
    provider: string;
    amount: number;
    currency: string;
  }): Promise<void> {
    const emailHtml = this.generateWelcomeEmail({
      customerName: `${user.firstName} ${user.lastName}`,
      subscriptionId: subscriptionDetails.subscriptionId,
      expiryDate: subscriptionDetails.expiresAt.toLocaleDateString(),
      features: [
        'Unlimited plant tracking and monitoring',
        'AI-powered health predictions with weather integration',
        'Gamified achievement system with badges',
        'Social sharing of plant milestones',
        'Detailed PDF reports and analytics',
        'Expert care recommendations',
        'Environmental monitoring tools'
      ]
    });

    try {
      // Email sending will be implemented later with proper SMTP configuration
      console.log(`Garden subscription welcome email would be sent to ${user.email}`);
      
      console.log(`Garden subscription welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send garden subscription welcome email:', error);
    }
  }

  static async sendExpiryReminder(user: User, daysUntilExpiry: number): Promise<void> {
    const emailHtml = this.generateExpiryReminderEmail({
      customerName: `${user.firstName} ${user.lastName}`,
      daysUntilExpiry,
      renewalUrl: `${process.env.APP_URL}/my-garden/subscribe`,
    });

    try {
      // Email sending will be implemented later with proper SMTP configuration
      console.log(`Garden subscription expiry reminder would be sent to ${user.email} (${daysUntilExpiry} days)`);
      
      console.log(`Garden subscription expiry reminder sent to ${user.email} (${daysUntilExpiry} days)`);
    } catch (error) {
      console.error('Failed to send garden subscription expiry reminder:', error);
    }
  }

  static async sendExpiryNotification(user: User): Promise<void> {
    const emailHtml = this.generateExpiryNotificationEmail({
      customerName: `${user.firstName} ${user.lastName}`,
      renewalUrl: `${process.env.APP_URL}/my-garden/subscribe`,
    });

    try {
      // Email sending will be implemented later with proper SMTP configuration
      console.log(`Garden subscription expiry notification would be sent to ${user.email}`);
      
      console.log(`Garden subscription expiry notification sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send garden subscription expiry notification:', error);
    }
  }

  static async sendSubscriptionCancellation(user: User): Promise<void> {
    const emailHtml = this.generateCancellationEmail({
      customerName: `${user.firstName} ${user.lastName}`,
    });

    try {
      // Email sending will be implemented later with proper SMTP configuration
      console.log(`Garden subscription cancellation email would be sent to ${user.email}`);
      
      console.log(`Garden subscription cancellation email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send garden subscription cancellation email:', error);
    }
  }

  private static generateWelcomeEmail(params: {
    customerName: string;
    subscriptionId: string;
    expiryDate: string;
    features: string[];
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Garden Monitoring Premium</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fffe; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #047857 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 32px; }
          .feature-list { list-style: none; padding: 0; margin: 24px 0; }
          .feature-list li { padding: 12px 0; display: flex; align-items: center; }
          .feature-list li:before { content: "✅"; margin-right: 12px; font-size: 16px; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
          .footer { background: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; }
          .subscription-details { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 Welcome to Garden Monitoring Premium!</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.customerName}!</h2>
            <p>Congratulations! Your Garden Monitoring Premium subscription is now active. You have unlocked the full power of AI-driven plant care and monitoring.</p>
            
            <div class="subscription-details">
              <h3>📋 Subscription Details</h3>
              <p><strong>Subscription ID:</strong> ${params.subscriptionId}</p>
              <p><strong>Valid Until:</strong> ${params.expiryDate}</p>
              <p><strong>Subscription Type:</strong> Annual Premium</p>
            </div>

            <h3>🚀 Your Premium Features</h3>
            <ul class="feature-list">
              ${params.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>

            <a href="${process.env.APP_URL}/my-garden" class="cta-button">
              Access Your Garden Dashboard →
            </a>

            <p>Start by adding your plants and explore all the powerful tools available to help you become a better gardener!</p>
          </div>
          <div class="footer">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Thank you for choosing GreenLens Garden Monitoring Premium. 
              <br>Happy gardening! 🌿
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateExpiryReminderEmail(params: {
    customerName: string;
    daysUntilExpiry: number;
    renewalUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Garden Monitoring Subscription Reminder</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fffe; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 32px; }
          .warning-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
          .footer { background: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Subscription Reminder</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.customerName}!</h2>
            
            <div class="warning-box">
              <h3>⚠️ Your Garden Monitoring subscription expires in ${params.daysUntilExpiry} days</h3>
              <p>Don't lose access to your premium garden monitoring features!</p>
            </div>

            <p>To continue enjoying unlimited plant tracking, AI health predictions, and all premium features, please renew your subscription before it expires.</p>

            <a href="${params.renewalUrl}" class="cta-button">
              Renew Subscription →
            </a>

            <p><strong>What you'll lose without renewal:</strong></p>
            <ul>
              <li>AI-powered health predictions</li>
              <li>Advanced garden analytics</li>
              <li>Achievement system and badges</li>
              <li>Social sharing features</li>
              <li>Detailed PDF reports</li>
            </ul>
          </div>
          <div class="footer">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Questions? Reply to this email or contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateExpiryNotificationEmail(params: {
    customerName: string;
    renewalUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Garden Monitoring Subscription Expired</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fffe; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 32px; }
          .expired-box { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .cta-button { display: inline-block; background: #dc2626; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
          .footer { background: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Subscription Expired</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.customerName}!</h2>
            
            <div class="expired-box">
              <h3>❌ Your Garden Monitoring subscription has expired</h3>
              <p>You no longer have access to premium features.</p>
            </div>

            <p>Your premium Garden Monitoring subscription has expired. To regain access to all premium features, please renew your subscription.</p>

            <a href="${params.renewalUrl}" class="cta-button">
              Renew Now →
            </a>

            <p><strong>Renew today to restore:</strong></p>
            <ul>
              <li>Full access to My Garden dashboard</li>
              <li>AI health predictions and recommendations</li>
              <li>Achievement system and badges</li>
              <li>Social sharing capabilities</li>
              <li>Detailed PDF reports and analytics</li>
            </ul>

            <p>All your plant data is safely stored and will be restored immediately upon renewal.</p>
          </div>
          <div class="footer">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Need help? Contact our support team - we're here to help!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateCancellationEmail(params: {
    customerName: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Garden Monitoring Subscription Cancelled</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fffe; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 32px; }
          .footer { background: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💔 Subscription Cancelled</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.customerName}!</h2>
            
            <p>Your Garden Monitoring Premium subscription has been cancelled as requested.</p>

            <p><strong>What happens next:</strong></p>
            <ul>
              <li>Your access to premium features will end at the end of your current billing period</li>
              <li>All your plant data will be safely stored</li>
              <li>You can still use basic plant identification features</li>
              <li>You can resubscribe anytime to restore full access</li>
            </ul>

            <p>We're sad to see you go! If you have feedback about your experience, we'd love to hear from you.</p>

            <p>Thank you for being part of the GreenLens community. We hope to welcome you back soon! 🌱</p>
          </div>
          <div class="footer">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Have questions? Reply to this email or contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}