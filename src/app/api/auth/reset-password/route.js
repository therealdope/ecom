import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    const { email, newPassword } = await req.json();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });

    if (!updated) {
        return Response.json({ message: 'Password reset failed' }, { status: 500 });
    }

    return Response.json({ message: 'Password reset successful' });
}