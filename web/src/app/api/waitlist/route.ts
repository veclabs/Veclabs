import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    // Email to you — notification that someone joined
    await resend.emails.send({
      from: 'waitlist@veclabs.xyz',
      to: 'veclabs@outlook.com',  // replace with your actual email
      subject: `New waitlist signup: ${email}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #F0EDE6; padding: 32px;">
          <p style="color: #2D7A45; margin-bottom: 16px;">› new waitlist signup</p>
          <p style="margin-bottom: 8px;">email: ${email}</p>
          <p style="color: #3A3A3A; font-size: 12px; margin-top: 24px;">veclabs.xyz waitlist</p>
        </div>
      `,
    })

    // Email to them — confirmation
    await resend.emails.send({
      from: 'waitlist@veclabs.xyz',
      to: email,
      subject: "You're on the VecLabs waitlist.",
      html: `
        <div style="font-family: monospace; background: #000; color: #F0EDE6; padding: 32px; max-width: 480px;">
          <p style="color: #2D7A45; margin-bottom: 24px;">› veclabs waitlist</p>
          
          <p style="margin-bottom: 16px; font-size: 16px;">You're on the list.</p>
          
          <p style="color: #3A3A3A; line-height: 1.7; margin-bottom: 24px;">
            We'll reach out when the hosted service is ready.<br/>
            Free tier for the first 500 developers.
          </p>
          
          <div style="border-top: 1px solid #111; padding-top: 24px; margin-top: 24px;">
            <p style="color: #2D7A45; margin-bottom: 8px;">› until then</p>
            <p style="color: #3A3A3A; margin-bottom: 6px; font-size: 13px;">
              SDK on npm: npm install @veclabs/solvec
            </p>
            <p style="color: #3A3A3A; margin-bottom: 6px; font-size: 13px;">
              GitHub: github.com/veclabs/veclabs
            </p>
            <p style="color: #3A3A3A; font-size: 13px;">
              Demo: veclabs.xyz/demo
            </p>
          </div>
          
          <p style="color: #1A1A1A; font-size: 11px; margin-top: 32px;">
            veclabs.xyz · MIT Licensed · Built with Rust and Solana
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}