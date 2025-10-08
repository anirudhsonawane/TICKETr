import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phoneNumber, name } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || 'User',
        phoneNumber,
        otp,
        otpExpires,
      });
      console.log('✅ New user created with phone:', phoneNumber);
    } else {
      // Update existing user with new OTP
      user.otp = otp;
      user.otpExpires = otpExpires;
      if (name && !user.name) {
        user.name = name;
      }
      await user.save();
      console.log('✅ OTP sent to existing user:', phoneNumber);
    }

    // In production, you would send the OTP via SMS using Twilio or similar service
    // For development, we'll log it to console
    console.log('📱 OTP for', phoneNumber, ':', otp);
    console.log('⏰ OTP expires at:', otpExpires);

    // TODO: Integrate Twilio or SMS service here
    // Example:
    // await twilioClient.messages.create({
    //   body: `Your TICKETr OTP is: ${otp}`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Only send OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        message: 'Failed to send OTP',
      },
      { status: 500 }
    );
  }
}

