import nodemailer from 'nodemailer';
import { db } from "../db";
import { ebookPurchases, ebooks, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Email service for handling e-book purchase confirmations and notifications
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration (e.g., SendGrid, AWS SES, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: Use Ethereal Email for testing
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    }
  }

  // Send purchase confirmation email
  async sendPurchaseConfirmation(purchaseId: string): Promise<void> {
    const [purchase] = await db
      .select({
        id: ebookPurchases.id,
        purchaseOrderId: ebookPurchases.purchaseOrderId,
        purchasePrice: ebookPurchases.purchasePrice,
        currency: ebookPurchases.currency,
        customerEmail: ebookPurchases.customerEmail,
        customerName: ebookPurchases.customerName,
        ebookTitle: ebooks.title,
        ebookAuthor: ebooks.authorName,
        downloadCount: ebookPurchases.downloadCount,
        maxDownloads: ebookPurchases.maxDownloads,
      })
      .from(ebookPurchases)
      .innerJoin(ebooks, eq(ebookPurchases.ebookId, ebooks.id))
      .where(eq(ebookPurchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    const downloadLink = `${process.env.APP_URL}/download/${purchase.id}`;
    
    const emailHtml = this.generatePurchaseConfirmationHTML({
      customerName: purchase.customerName || 'Valued Customer',
      orderNumber: purchase.purchaseOrderId,
      bookTitle: purchase.ebookTitle,
      authorName: purchase.ebookAuthor,
      purchaseAmount: `${purchase.currency} ${purchase.purchasePrice}`,
      downloadLink,
      maxDownloads: purchase.maxDownloads,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@greenlens.com',
    });

    await this.transporter.sendMail({
      from: `"GreenLens E-Books" <${process.env.FROM_EMAIL || 'noreply@greenlens.com'}>`,
      to: purchase.customerEmail,
      subject: `Your E-Book Purchase Confirmation - Order #${purchase.purchaseOrderId}`,
      html: emailHtml,
    });

    // Mark email as sent
    await db
      .update(ebookPurchases)
      .set({
        confirmationEmailSent: true,
        receiptEmailSent: true,
        downloadLinkEmailSent: true,
      })
      .where(eq(ebookPurchases.id, purchaseId));
  }

  // Send download link email
  async sendDownloadLink(purchaseId: string): Promise<void> {
    const [purchase] = await db
      .select({
        customerEmail: ebookPurchases.customerEmail,
        customerName: ebookPurchases.customerName,
        purchaseOrderId: ebookPurchases.purchaseOrderId,
        ebookTitle: ebooks.title,
        maxDownloads: ebookPurchases.maxDownloads,
        downloadCount: ebookPurchases.downloadCount,
      })
      .from(ebookPurchases)
      .innerJoin(ebooks, eq(ebookPurchases.ebookId, ebooks.id))
      .where(eq(ebookPurchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    const downloadLink = `${process.env.APP_URL}/download/${purchaseId}`;
    const remainingDownloads = purchase.maxDownloads - purchase.downloadCount;

    const emailHtml = this.generateDownloadLinkHTML({
      customerName: purchase.customerName || 'Valued Customer',
      bookTitle: purchase.ebookTitle,
      downloadLink,
      remainingDownloads,
      orderNumber: purchase.purchaseOrderId,
    });

    await this.transporter.sendMail({
      from: `"GreenLens E-Books" <${process.env.FROM_EMAIL || 'noreply@greenlens.com'}>`,
      to: purchase.customerEmail,
      subject: `Download Your E-Book: ${purchase.ebookTitle}`,
      html: emailHtml,
    });
  }

  // Send author notification for new sale
  async sendAuthorSaleNotification(purchaseId: string): Promise<void> {
    const [purchase] = await db
      .select({
        authorEmail: users.email,
        authorName: users.firstName,
        ebookTitle: ebooks.title,
        purchasePrice: ebookPurchases.purchasePrice,
        authorEarnings: ebookPurchases.authorEarnings,
        currency: ebookPurchases.currency,
        purchaseOrderId: ebookPurchases.purchaseOrderId,
      })
      .from(ebookPurchases)
      .innerJoin(ebooks, eq(ebookPurchases.ebookId, ebooks.id))
      .innerJoin(users, eq(ebooks.authorId, users.id))
      .where(eq(ebookPurchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return; // No notification needed if data not found
    }

    const emailHtml = this.generateAuthorSaleNotificationHTML({
      authorName: purchase.authorName,
      bookTitle: purchase.ebookTitle,
      saleAmount: `${purchase.currency} ${purchase.purchasePrice}`,
      earnings: `${purchase.currency} ${purchase.authorEarnings}`,
      orderNumber: purchase.purchaseOrderId,
      dashboardLink: `${process.env.APP_URL}/author/dashboard`,
    });

    await this.transporter.sendMail({
      from: `"GreenLens Author Portal" <${process.env.FROM_EMAIL || 'noreply@greenlens.com'}>`,
      to: purchase.authorEmail,
      subject: `Great News! You Made a Sale - "${purchase.ebookTitle}"`,
      html: emailHtml,
    });
  }

  // Generate purchase confirmation email HTML
  private generatePurchaseConfirmationHTML(data: {
    customerName: string;
    orderNumber: string;
    bookTitle: string;
    authorName: string;
    purchaseAmount: string;
    downloadLink: string;
    maxDownloads: number;
    supportEmail: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .download-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Purchase Confirmed!</h1>
      <p>Thank you for your purchase from GreenLens E-Books</p>
    </div>
    
    <div class="content">
      <h2>Hello ${data.customerName}!</h2>
      
      <p>Your purchase has been successfully processed. You can now download your e-book using the link below.</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Book Title:</strong> ${data.bookTitle}</p>
        <p><strong>Author:</strong> ${data.authorName}</p>
        <p><strong>Amount Paid:</strong> ${data.purchaseAmount}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.downloadLink}" class="download-button">📖 Download Your E-Book</a>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4>⚠️ Important Download Information:</h4>
        <ul>
          <li>You can download this e-book up to ${data.maxDownloads} times</li>
          <li>Please save the file to your device after downloading</li>
          <li>The download link will expire after 30 days</li>
          <li>Keep this email for your records</li>
        </ul>
      </div>
      
      <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a>.</p>
      
      <p>Happy reading!</p>
      <p><strong>The GreenLens Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This email was sent regarding your purchase from GreenLens E-Books.</p>
      <p>© 2024 GreenLens. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Generate download link email HTML
  private generateDownloadLinkHTML(data: {
    customerName: string;
    bookTitle: string;
    downloadLink: string;
    remainingDownloads: number;
    orderNumber: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Your E-Book</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .download-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📖 Your E-Book is Ready!</h1>
    </div>
    
    <div class="content">
      <h2>Hello ${data.customerName}!</h2>
      
      <p>Your e-book "<strong>${data.bookTitle}</strong>" is ready for download.</p>
      
      <div style="text-align: center;">
        <a href="${data.downloadLink}" class="download-button">Download Now</a>
      </div>
      
      <p><strong>Downloads remaining:</strong> ${data.remainingDownloads}</p>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      
      <p>Please save the file to your device after downloading.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Generate author sale notification HTML
  private generateAuthorSaleNotificationHTML(data: {
    authorName: string;
    bookTitle: string;
    saleAmount: string;
    earnings: string;
    orderNumber: string;
    dashboardLink: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Sale Notification</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .dashboard-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .earnings-box { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
      <p>You just made a sale!</p>
    </div>
    
    <div class="content">
      <h2>Hello ${data.authorName}!</h2>
      
      <p>Great news! Someone just purchased your e-book "<strong>${data.bookTitle}</strong>".</p>
      
      <div class="earnings-box">
        <h3>💰 Your Earnings</h3>
        <p style="font-size: 24px; font-weight: bold; color: #22c55e; margin: 10px 0;">${data.earnings}</p>
        <p>Sale Amount: ${data.saleAmount}</p>
        <p>Order #${data.orderNumber}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.dashboardLink}" class="dashboard-button">View Your Dashboard</a>
      </div>
      
      <p>Keep up the great work! Your earnings will be processed according to your payment schedule.</p>
      
      <p><strong>The GreenLens Team</strong></p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const emailService = new EmailService();