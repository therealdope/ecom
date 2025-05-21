import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@lib/prisma';

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Convert role to lowercase to match Prisma model
        const modelName = role.toLowerCase();

        // Check if account already exists
        const existing = await prisma[modelName].findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user or vendor
        let user;
        if (role === 'USER') {
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
        } else if (role === 'VENDOR') {
            user = await prisma.vendor.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
        } else {
            return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Account created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Error creating account: ' + error.message }, { status: 500 });
    }
}