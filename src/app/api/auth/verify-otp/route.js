import prisma from '@/lib/prisma';

export async function POST(req) {
    const { email, code } = await req.json();

    const record = await prisma.otpCode.findFirst({
        where: {
            email,
            code,
            expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!record) {
        return Response.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Optional: delete used OTP
    await prisma.otpCode.delete({ where: { id: record.id } });

    return Response.json({ success: true });
}