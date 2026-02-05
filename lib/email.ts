import { Resend } from 'resend'

export async function sendWelcomeEmail({
  to,
  firstName,
  welcomeMessage,
  passwordSetupUrl
}: {
  to: string
  firstName: string
  welcomeMessage: string
  passwordSetupUrl: string
}) {
  try {
    // Initialize Resend client at runtime, not at import time
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'InnerCrowd <onboarding@resend.dev>', // Resend sandbox domain
      to: [to],
      subject: 'Welkom bij InnerCrowd - Stel je wachtwoord in',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .message {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Welkom bij InnerCrowd!</h1>
            </div>
            <div class="content">
              <h2>Hallo ${firstName},</h2>
              
              <div class="message">
                <p>${welcomeMessage}</p>
              </div>
              
              <p>Je account is succesvol aangemaakt. Klik op de knop hieronder om je wachtwoord in te stellen en direct aan de slag te gaan:</p>
              
              <div style="text-align: center;">
                <a href="${passwordSetupUrl}" class="button">Wachtwoord instellen</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Of kopieer deze link naar je browser:<br>
                <a href="${passwordSetupUrl}" style="color: #667eea;">${passwordSetupUrl}</a>
              </p>
              
              <p style="color: #dc2626; font-size: 14px; margin-top: 30px;">
                ⚠️ Deze link is 24 uur geldig.
              </p>
              
              <div class="footer">
                <p>Als je deze email niet verwachtte, kun je deze negeren.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('✅ Welcome email sent successfully:', data)
    return data
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
}
