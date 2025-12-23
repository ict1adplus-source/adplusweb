import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    console.log('📧 Would send email to:', email)
    console.log('🔢 With code:', code)
    
    // In production, implement actual email sending here
    // Example with Resend:
    /*
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'Ad Plus Digital <verify@adplusdigital.com>',
      to: [email],
      subject: 'Verify Your Email - Ad Plus Digital',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Ad Plus Digital</h1>
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} Ad Plus Digital. All rights reserved.
          </p>
        </div>
      `,
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Email would be sent in production',
      email: email,
      code: code 
    })
  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to send email',
      development_note: 'In development, check console for verification code'
    }, { status: 500 })
  }
}