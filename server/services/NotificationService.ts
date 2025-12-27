import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Debug: Log environment variables
console.log('🔧 NotificationService initializing...');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');

// Email Configuration
let emailTransporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  // If using Gmail, it's better to use the 'service' property
  const isGmail = process.env.SMTP_HOST?.includes('gmail');
  
  emailTransporter = nodemailer.createTransport({
    ...(isGmail ? { service: 'gmail' } : {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
    }),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add timeouts to prevent hanging
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
  console.log(`✅ SMTP configured successfully (${isGmail ? 'Gmail' : 'Custom'})`);
} else {
  console.warn('⚠️  SMTP not configured. Email notifications will be skipped.');
}

// Twilio Configuration
let twilioClient: ReturnType<typeof twilio> | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio configured successfully');
} else {
  console.warn('⚠️  Twilio not configured. SMS notifications will be skipped.');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SMSOptions {
  to: string;
  message: string;
}

export class NotificationService {
  /**
   * Send email notification
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!emailTransporter) {
      console.warn('Email not configured. Skipping email notification.');
      return false;
    }

    try {
      await emailTransporter.sendMail({
        from: `"Rapid Response Hub" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });
      console.log(`✅ Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio not configured. Skipping SMS notification.');
      return false;
    }

    try {
      await twilioClient.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to,
      });
      console.log(`✅ SMS sent to ${options.to}`);
      return true;
    } catch (error: unknown) {
      const twilioError = error as { code?: number; message?: string; moreInfo?: string };
      console.error('❌ SMS send error:', {
        to: options.to,
        code: twilioError.code,
        message: twilioError.message,
        moreInfo: twilioError.moreInfo
      });
      
      // Common Twilio trial account error
      if (twilioError.code === 21608 || twilioError.code === 21211) {
        console.error('⚠️  TRIAL ACCOUNT: The phone number is not verified. Go to Twilio Console → Verified Caller IDs → Add the number.');
      }
      return false;
    }
  }

  /**
   * Send SOS Alert to emergency contacts
   */
  static async sendSOSAlerts(
    userName: string,
    userPhone: string | undefined,
    location: { address?: string; lat: number; lng: number },
    contacts: Array<{ name: string; phone: string; email?: string }>,
    alertType: string = 'emergency'
  ): Promise<{ emailsSent: number; smsSent: number }> {
    let emailsSent = 0;
    let smsSent = 0;

    const locationText = location.address || `${location.lat}, ${location.lng}`;
    const googleMapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    // SMS Message - Ultra short for trial accounts (160 char limit including Twilio prefix)
    const smsMessage = `SOS! ${userName} needs help at ${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;

    // Email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-box { background: #fee; border-left: 4px solid #c00; padding: 15px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #c00; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 10px 0;
          }
          .info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="color: #c00;">🚨 EMERGENCY SOS ALERT</h1>
          
          <div class="alert-box">
            <h2>Immediate Attention Required</h2>
            <p><strong>${userName}</strong> has triggered an <strong>${alertType}</strong> SOS alert and may need immediate assistance.</p>
          </div>

          <div class="info">
            <h3>Location Details</h3>
            <p><strong>Address:</strong> ${locationText}</p>
            <p><strong>Coordinates:</strong> ${location.lat}, ${location.lng}</p>
            ${userPhone ? `<p><strong>Contact:</strong> ${userPhone}</p>` : ''}
          </div>

          <a href="${googleMapsLink}" class="button">📍 View Location on Google Maps</a>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            <strong>What to do:</strong><br>
            1. Try to contact ${userName} immediately<br>
            2. If you cannot reach them, call emergency services (911)<br>
            3. Share the location with first responders if needed
          </p>

          <p style="color: #999; font-size: 12px;">
            This alert was sent from Rapid Response Hub Emergency System.<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      </body>
      </html>
    `;

    // Send to all emergency contacts
    for (const contact of contacts) {
      // Send SMS
      if (contact.phone) {
        const smsSuccess = await this.sendSMS({
          to: contact.phone,
          message: smsMessage,
        });
        if (smsSuccess) smsSent++;
      }

      // Send Email if available
      if (contact.email) {
        const emailSuccess = await this.sendEmail({
          to: contact.email,
          subject: `🚨 EMERGENCY: ${userName} needs help!`,
          html: emailHtml,
        });
        if (emailSuccess) emailsSent++;
      }
    }

    return { emailsSent, smsSent };
  }

  /**
   * Send incident update notification
   */
  static async sendIncidentUpdate(
    email: string,
    incidentTitle: string,
    status: string,
    updateMessage: string
  ): Promise<boolean> {
    const html = `
      <h2>Incident Status Update</h2>
      <p><strong>Incident:</strong> ${incidentTitle}</p>
      <p><strong>New Status:</strong> ${status}</p>
      <p>${updateMessage}</p>
      <p style="color: #666; font-size: 12px;">Rapid Response Hub</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Incident Update: ${incidentTitle}`,
      html,
    });
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Welcome to Rapid Response Hub!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining Rapid Response Hub. You can now:</p>
        <ul>
          <li>Report emergencies and incidents in your area</li>
          <li>View real-time incident updates</li>
          <li>Set up emergency contacts for SOS alerts</li>
          <li>Help verify community-reported incidents</li>
        </ul>
        <p>Stay safe and help keep your community safe!</p>
        <p style="color: #666;">The Rapid Response Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Rapid Response Hub',
      html,
    });
  }
}
