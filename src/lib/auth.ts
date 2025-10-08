import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './mongodb';
import User from '@/models/User';

// Log environment variable status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 Auth Configuration Check:');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set (using default)');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      id: 'phone',
      name: 'Phone Number',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.otp) {
          return null;
        }

        await dbConnect();
        const user = await User.findOne({ phoneNumber: credentials.phoneNumber });

        if (user && user.otp === credentials.otp && user.otpExpires && user.otpExpires > new Date()) {
          // Clear OTP after successful verification
          user.otp = undefined;
          user.otpExpires = undefined;
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            phoneNumber: user.phoneNumber,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      try {
        // Determine provider
        const provider = account?.provider === 'google' ? 'google' : 'phone';
        
        // Check if user exists
        let existingUser = await User.findOne({ 
          $or: [
            { email: user.email },
            { googleId: account?.providerAccountId }
          ]
        });

        if (!existingUser) {
          // Create new user in MongoDB
          existingUser = await User.create({
            name: user.name || 'User',
            email: user.email,
            image: user.image,
            provider: provider,
            googleId: account?.provider === 'google' ? account?.providerAccountId : undefined,
            phone: (user as any).phoneNumber || null,
          });
          console.log('✅ New user created:', existingUser.email, '| Provider:', provider);
        } else {
          // Update existing user info (in case profile changed)
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          if (account?.provider === 'google' && !existingUser.googleId) {
            existingUser.googleId = account.providerAccountId;
          }
          await existingUser.save();
          console.log('✅ User logged in:', existingUser.email, '| Provider:', provider);
        }

        // Store the MongoDB _id in the user object for JWT
        user.id = existingUser._id.toString();

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = (user as any).phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phoneNumber = token.phoneNumber as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('📝 Sign-in event:', {
        provider: account?.provider,
        user: user.email,
        timestamp: new Date().toISOString(),
      });
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
