import { MailService } from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from "../db";
import { subscriptions, users, subscriptionReminders } from "@shared/schema";
import { eq, and, lte, gte } from "drizzle-orm";

export class SubscriptionEmailService {
  private mailService: MailService;
  private templatesPath: string;
  
  constructor() {
    this.mailService = new MailService();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.templatesPath = path.join(__dirname, '../templates/emails');
    
    // Initialize SendGrid if API key is available
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    } else {
      console.warn('SENDGRID_API_KEY not found. Email notifications will not work.');
    }
  }

  // Load and process email template
  private async loadTemplate(templateName: string, variables: Record<string, string>): Promise<string> {
    const templatePath = path.join(this.templatesPath, templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return template;
  }

  // Send 15-day expiry reminder
  async send15DayExpiryReminder(subscriptionId: string): Promise<boolean> {
    try {
      const [subscription] = await db
        .select({
          userId: subscriptions.userId,
          planType: subscriptions.planType,
          endDate: subscriptions.endDate,
          amount: subscriptions.amount,
          currency: subscriptions.currency,
          userEmail: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription || !subscription.endDate) {
        throw new Error('Subscription not found or no end date');
      }

      const expiryDate = new Date(subscription.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const renewalUrl = `${process.env.APP_URL || 'https://greenlens.replit.app'}/subscription/renew?plan=${subscription.planType}`;

      const variables = {
        firstName: subscription.firstName,
        planType: subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1),
        expiryDate,
        renewalUrl,
        amount: subscription.amount,
        currency: subscription.currency,
      };

      const emailHTML = await this.loadTemplate('15-day-expiry-reminder.html', variables);

      await this.mailService.send({
        to: subscription.userEmail,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@greenlens.ai',
          name: 'GreenLens Team'
        },
        subject: '🌿 Your GreenLens subscription expires in 15 days',
        html: emailHTML,
      });

      return true;
    } catch (error) {
      console.error('Failed to send 15-day expiry reminder:', error);
      return false;
    }
  }

  // Send 7-day expiry reminder
  async send7DayExpiryReminder(subscriptionId: string): Promise<boolean> {
    try {
      const [subscription] = await db
        .select({
          userId: subscriptions.userId,
          planType: subscriptions.planType,
          endDate: subscriptions.endDate,
          amount: subscriptions.amount,
          currency: subscriptions.currency,
          userEmail: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription || !subscription.endDate) {
        throw new Error('Subscription not found or no end date');
      }

      const expiryDate = new Date(subscription.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const renewalUrl = `${process.env.APP_URL || 'https://greenlens.replit.app'}/subscription/renew?plan=${subscription.planType}&urgent=true`;

      const variables = {
        firstName: subscription.firstName,
        planType: subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1),
        expiryDate,
        renewalUrl,
        amount: subscription.amount,
        currency: subscription.currency,
      };

      const emailHTML = await this.loadTemplate('7-day-expiry-reminder.html', variables);

      await this.mailService.send({
        to: subscription.userEmail,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@greenlens.ai',
          name: 'GreenLens Team'
        },
        subject: '🚨 URGENT: Your GreenLens subscription expires in 7 days!',
        html: emailHTML,
      });

      return true;
    } catch (error) {
      console.error('Failed to send 7-day expiry reminder:', error);
      return false;
    }
  }

  // Send renewal confirmation email
  async sendRenewalConfirmation(subscriptionId: string, transactionId: string, paymentProvider: string): Promise<boolean> {
    try {
      const [subscription] = await db
        .select({
          userId: subscriptions.userId,
          planType: subscriptions.planType,
          endDate: subscriptions.endDate,
          amount: subscriptions.amount,
          currency: subscriptions.currency,
          userEmail: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const nextRenewalDate = subscription.endDate 
        ? new Date(subscription.endDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Monthly renewal';

      const dashboardUrl = `${process.env.APP_URL || 'https://greenlens.replit.app'}/dashboard`;

      const variables = {
        firstName: subscription.firstName,
        planType: subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1),
        amount: subscription.amount,
        currency: subscription.currency,
        paymentProvider: paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1),
        nextRenewalDate,
        transactionId,
        dashboardUrl,
      };

      const emailHTML = await this.loadTemplate('renewal-confirmation.html', variables);

      await this.mailService.send({
        to: subscription.userEmail,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@greenlens.ai',
          name: 'GreenLens Team'
        },
        subject: '🌿 Welcome back! Your GreenLens subscription is renewed',
        html: emailHTML,
      });

      return true;
    } catch (error) {
      console.error('Failed to send renewal confirmation:', error);
      return false;
    }
  }

  // Schedule expiry reminder emails for a subscription
  async scheduleExpiryReminders(subscriptionId: string): Promise<void> {
    try {
      const [subscription] = await db
        .select({
          userId: subscriptions.userId,
          endDate: subscriptions.endDate,
        })
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription || !subscription.endDate) {
        return;
      }

      const endDate = new Date(subscription.endDate);
      const fifteenDaysBefore = new Date(endDate);
      fifteenDaysBefore.setDate(endDate.getDate() - 15);
      
      const sevenDaysBefore = new Date(endDate);
      sevenDaysBefore.setDate(endDate.getDate() - 7);

      // Check if reminders already exist to avoid duplicates
      const existingReminders = await db
        .select()
        .from(subscriptionReminders)
        .where(and(
          eq(subscriptionReminders.subscriptionId, subscriptionId),
          eq(subscriptionReminders.sent, false)
        ));

      const hasExisting15Day = existingReminders.some(r => r.reminderType === '15_days_before_expiry');
      const hasExisting7Day = existingReminders.some(r => r.reminderType === '7_days_before_expiry');

      // Schedule 15-day reminder if not already scheduled
      if (!hasExisting15Day && fifteenDaysBefore > new Date()) {
        await db.insert(subscriptionReminders).values({
          userId: subscription.userId,
          subscriptionId: subscriptionId,
          reminderType: '15_days_before_expiry',
          scheduledFor: fifteenDaysBefore,
        });
      }

      // Schedule 7-day reminder if not already scheduled
      if (!hasExisting7Day && sevenDaysBefore > new Date()) {
        await db.insert(subscriptionReminders).values({
          userId: subscription.userId,
          subscriptionId: subscriptionId,
          reminderType: '7_days_before_expiry',
          scheduledFor: sevenDaysBefore,
        });
      }
    } catch (error) {
      console.error('Failed to schedule expiry reminders:', error);
    }
  }

  // Process pending reminders (called by scheduler)
  async processPendingReminders(): Promise<{ sent: number; failed: number }> {
    const results = { sent: 0, failed: 0 };
    
    try {
      // Get pending reminders that are due to be sent
      const pendingReminders = await db
        .select()
        .from(subscriptionReminders)
        .where(and(
          eq(subscriptionReminders.sent, false),
          lte(subscriptionReminders.scheduledFor, new Date())
        ));

      for (const reminder of pendingReminders) {
        let success = false;
        
        try {
          switch (reminder.reminderType) {
            case '15_days_before_expiry':
              success = await this.send15DayExpiryReminder(reminder.subscriptionId);
              break;
            case '7_days_before_expiry':
              success = await this.send7DayExpiryReminder(reminder.subscriptionId);
              break;
            default:
              console.log(`Unknown reminder type: ${reminder.reminderType}`);
              continue;
          }

          if (success) {
            // Mark reminder as sent
            await db
              .update(subscriptionReminders)
              .set({
                sent: true,
                sentAt: new Date(),
              })
              .where(eq(subscriptionReminders.id, reminder.id));
            
            results.sent++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`Failed to process reminder ${reminder.id}:`, error);
          results.failed++;
        }
      }
    } catch (error) {
      console.error('Failed to process pending reminders:', error);
    }

    return results;
  }

  // Check if SendGrid is properly configured
  isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }
}

export const subscriptionEmailService = new SubscriptionEmailService();