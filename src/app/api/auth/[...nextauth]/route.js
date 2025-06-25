import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
        rememberMe: { label: 'Remember Me', type: 'text' } // receives 'true' or 'false'
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) return null;

        const user = await prisma[credentials.role.toLowerCase()].findUnique({
          where: { email: credentials.email }
        });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) return null;

        // Set cookie to tell max age
        const maxAge = credentials.rememberMe === 'true' ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
        const cookieHeader = `custom_session_maxage=${maxAge}; Path=/; HttpOnly; SameSite=Lax`;

        if (req?.res?.setHeader) {
          req.res.setHeader('Set-Cookie', cookieHeader);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: credentials.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // default fallback 1 day
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
