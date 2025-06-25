import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to, otp) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // must be verified in Resend // here used test domain
            to,
            subject: 'Your OTP for Password Reset',
            html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px;">
          <p>Hello,</p>
          <p>Your OTP for password reset is:</p>
          <h2 style="color: #4F46E5;">${otp}</h2>
          <p>This code is valid for 10 minutes. If you didn’t request this, you can safely ignore this email.</p>
          <p>— Team Ecom</p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error('Email sending failed');
        }

        return data;
    } catch (err) {
        console.error('sendMail error:', err);
        throw err;
    }
}