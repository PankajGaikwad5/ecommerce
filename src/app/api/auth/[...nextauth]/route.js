import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

const randomDummyPassword = crypto.randomBytes(16).toString('hex');
const hashedDummyPassword = await bcrypt.hash(randomDummyPassword, 10);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await connectToDatabase();

        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            role: 'user',
            password: hashedDummyPassword,
          });
        }

        // Overwrite the default user object with the DB one
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        user.name = existingUser.name;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user._id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
