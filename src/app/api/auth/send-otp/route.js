import prisma from '@/lib/prisma';
import { sendMail } from '@/utils/sendMail';

export async function POST(req) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return Response.json({ message: 'Email not found' }, { status: 404 });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in DB with expiry (e.g., 10 mins)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otpCode.create({
            data: {
                email,
                code: otp,
                expiresAt,
            },
        });

        await sendMail(email, otp);

        return Response.json({ message: 'OTP sent' });
    } catch (err) {
        console.error(err);
        return Response.json({ message: 'Internal error' }, { status: 500 });
    }
}