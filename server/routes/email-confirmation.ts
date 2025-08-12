import { RequestHandler } from "express";

interface EmailData {
  to: string;
  firstName: string;
  businessName: string;
}

// Email template for demo confirmation
const createDemoConfirmationEmail = (firstName: string, businessName: string) => {
  return {
    subject: "Demo Request Confirmed - ChargeSource EV Infrastructure Platform",
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Request Confirmed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #6b7280; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
        .cta-button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .feature-list { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature-item { margin: 8px 0; }
        .feature-item::before { content: "⚡"; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ChargeSource</div>
            <p>EV Infrastructure Platform for Australian Electrical Contractors</p>
        </div>
        
        <div class="content">
            <h2>Demo Request Confirmed!</h2>
            
            <p>Hi ${firstName},</p>
            
            <p>Thank you for your interest in ChargeSource! We've received your demo request for <strong>${businessName}</strong> and we're excited to show you how our platform can transform your EV infrastructure projects.</p>
            
            <div class="highlight">
                <h3>What Happens Next?</h3>
                <ul>
                    <li><strong>Within 24 hours:</strong> Our team will contact you to schedule your personalized demo</li>
                    <li><strong>Demo Duration:</strong> 30-45 minutes tailored to your business needs</li>
                    <li><strong>Demo Format:</strong> Interactive online session with Q&A</li>
                </ul>
            </div>
            
            <h3>What You'll See in Your Demo:</h3>
            <div class="feature-list">
                <div class="feature-item">Project Planning Wizard with site assessment tools</div>
                <div class="feature-item">Smart Quoting Engine (CPQ) for dynamic pricing</div>
                <div class="feature-item">Procurement & Supplier Integration features</div>
                <div class="feature-item">Account & Project Management dashboard</div>
                <div class="feature-item">Integration capabilities with MYOB/Xero/QuickBooks</div>
            </div>
            
            <p>In the meantime, feel free to explore our website or contact us if you have any immediate questions.</p>
            
            <div style="text-align: center;">
                <a href="https://chargesource.com.au" class="cta-button">Visit Our Website</a>
            </div>
            
            <p>Looking forward to connecting with you soon!</p>
            
            <p>Best regards,<br>
            <strong>The ChargeSource Team</strong><br>
            Australian EV Infrastructure Specialists</p>
        </div>
        
        <div class="footer">
            <p><strong>ChargeSource Australia</strong></p>
            <p>📧 demo@chargesource.com.au | 📞 1800-CHARGE | 🌐 www.chargesource.com.au</p>
            <p>🇦🇺 Made in Australia | AS/NZS 3000 Compliant</p>
            <p style="margin-top: 15px; font-size: 12px;">
                You received this email because you requested a demo of ChargeSource. 
                If you didn't request this demo, please ignore this email.
            </p>
        </div>
    </div>
</body>
</html>
    `,
    text: `
Demo Request Confirmed - ChargeSource

Hi ${firstName},

Thank you for your interest in ChargeSource! We've received your demo request for ${businessName} and we're excited to show you how our platform can transform your EV infrastructure projects.

What Happens Next?
- Within 24 hours: Our team will contact you to schedule your personalized demo
- Demo Duration: 30-45 minutes tailored to your business needs
- Demo Format: Interactive online session with Q&A

What You'll See in Your Demo:
⚡ Project Planning Wizard with site assessment tools
⚡ Smart Quoting Engine (CPQ) for dynamic pricing
⚡ Procurement & Supplier Integration features
⚡ Account & Project Management dashboard
⚡ Integration capabilities with MYOB/Xero/QuickBooks

In the meantime, feel free to explore our website or contact us if you have any immediate questions.

Looking forward to connecting with you soon!

Best regards,
The ChargeSource Team
Australian EV Infrastructure Specialists

ChargeSource Australia
Email: demo@chargesource.com.au
Phone: 1800-CHARGE
Website: www.chargesource.com.au
🇦🇺 Made in Australia | AS/NZS 3000 Compliant
    `
  };
};

// This would integrate with your email service provider
// Examples: SendGrid, AWS SES, Mailgun, etc.
const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  try {
    // Example using SendGrid or similar service
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: 'demo@chargesource.com.au', name: 'ChargeSource Demo Team' },
    //     subject: subject,
    //     content: [
    //       { type: 'text/html', value: html },
    //       { type: 'text/plain', value: text }
    //     ]
    //   })
    // });

    // For demo purposes, we'll log the email and simulate success
    console.log(`Demo confirmation email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    return {
      success: true,
      messageId: `demo_email_${Date.now()}`,
      message: "Email sent successfully"
    };

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send confirmation email');
  }
};

export const handleDemoConfirmationEmail: RequestHandler = async (req, res) => {
  try {
    const { to, firstName, businessName }: EmailData = req.body;

    // Validate required fields
    if (!to || !firstName || !businessName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, firstName, businessName'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Create email content
    const emailContent = createDemoConfirmationEmail(firstName, businessName);

    // Send email
    const emailResult = await sendEmail(
      to,
      emailContent.subject,
      emailContent.html,
      emailContent.text
    );

    // Log for analytics
    console.log(`Demo confirmation email sent to ${to} for ${businessName}`);

    res.json({
      success: true,
      message: 'Confirmation email sent successfully',
      data: {
        messageId: emailResult.messageId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
