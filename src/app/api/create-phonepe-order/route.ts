import { NextRequest, NextResponse } from "next/server";
import { 
  getPhonePeClient, 
  createPhonePePaymentRequest, 
  initiatePhonePePayment,
  convertToPaisa, 
  generatePhonePeOrderId,
  PhonePeException,
  PHONEPE_PAYMENT_STATUS
} from "@/lib/phonepe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("PhonePe order creation request:", body);
    
    const { 
      amount, 
      eventId, 
      userId, 
      quantity = 1, 
      passId, 
      couponCode, 
      selectedDate,
      waitingListId 
    } = body;
    
    // Convert amount to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Validate required fields
    if (!amount || !numericAmount || numericAmount <= 0 || !eventId || !userId) {
      console.error("Missing or invalid required fields for PhonePe order");
      return NextResponse.json({ 
        error: "Invalid amount", 
        details: "Payment amount must be greater than 0"
      }, { status: 400 });
    }

    // Check PhonePe credentials
    const hasCredentials = process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET;
    console.log("PhonePe credentials check:", {
      hasClientId: !!process.env.PHONEPE_CLIENT_ID,
      hasClientSecret: !!process.env.PHONEPE_CLIENT_SECRET,
      clientId: process.env.PHONEPE_CLIENT_ID ? 'SET' : 'MISSING',
      bypassMode: process.env.BYPASS_PHONEPE === "true"
    });

    // BYPASS MODE: Only bypass if explicitly set or credentials are missing
    const BYPASS_PHONEPE = process.env.BYPASS_PHONEPE === "true" || !hasCredentials;
    
    if (BYPASS_PHONEPE) {
      console.log("🚀 BYPASS MODE: Returning mock PhonePe payment interface data");
      console.log("Reason:", !hasCredentials ? "Missing credentials" : "BYPASS_PHONEPE=true");
      
      // Generate unique order ID
      const merchantOrderId = generatePhonePeOrderId();
      const baseUrl = "https://ticketr.yoloclub.in";
      const redirectUrl = `${baseUrl}/payment-result?orderId=${merchantOrderId}`;
      
      // Return mock PhonePe payment interface data
      return NextResponse.json({
        success: true,
        orderId: merchantOrderId,
        amount: convertToPaisa(numericAmount),
        currency: "INR",
        redirectUrl: redirectUrl,
        merchantOrderId,
        // Mock PhonePe payment interface data
        paymentInterface: {
          type: "PHONEPE_MOCK",
          qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk1vY2sgUGhvbmVQZSBQYXltZW50PC90ZXh0Pgo8L3N2Zz4K",
          upiId: "mock@phonepe",
          amount: numericAmount,
          merchantName: "TICKETr",
          orderId: merchantOrderId,
          instructions: [
            "1. Open PhonePe app on your mobile",
            "2. Scan the QR code or enter UPI ID",
            "3. Complete payment to confirm your ticket"
          ]
        },
        metaInfo: {
          eventId: String(eventId),
          userId: String(userId),
          quantity: String(quantity),
          passId: passId ? String(passId) : "",
          couponCode: couponCode || "",
          selectedDate: selectedDate || "",
          waitingListId: waitingListId ? String(waitingListId) : "",
        },
      });
    }

    // Validate PhonePe credentials
    try {
      const client = getPhonePeClient();
    } catch (error) {
      console.error("PhonePe configuration error:", error);
      return NextResponse.json({ 
        error: "Payment configuration error", 
        details: error instanceof Error ? error.message : "PhonePe credentials not configured"
      }, { status: 500 });
    }

    // Generate unique order ID
    const merchantOrderId = generatePhonePeOrderId();
    
    // Convert amount to paisa
    const amountInPaisa = convertToPaisa(numericAmount);
    
    // Create redirect URLs
    const baseUrl = "https://ticketr.yoloclub.in";
    const redirectUrl = `${baseUrl}/payment-result?orderId=${merchantOrderId}`;
    
    // Create meta info for tracking
    const metaInfo = {
      eventId: String(eventId),
      userId: String(userId),
      quantity: String(quantity),
      passId: passId ? String(passId) : "",
      couponCode: couponCode || "",
      selectedDate: selectedDate || "",
      waitingListId: waitingListId ? String(waitingListId) : "",
    };

    console.log("PhonePe payment request details:", {
      merchantOrderId,
      amountInPaisa,
      redirectUrl,
      metaInfo
    });

    // Create payment request
    let paymentRequest;
    try {
      console.log("=== CREATING PHONEPE PAYMENT REQUEST ===");
      console.log("Input parameters:", {
        merchantOrderId,
        amountInPaisa,
        redirectUrl,
        metaInfo
      });
      
      paymentRequest = createPhonePePaymentRequest({
        merchantOrderId,
        amount: amountInPaisa,
        redirectUrl,
        metaInfo,
      });
      console.log("Payment request created successfully:", paymentRequest);
    } catch (requestError) {
      console.error("=== PHONEPE REQUEST CREATION ERROR ===");
      console.error("Error details:", {
        message: requestError instanceof Error ? requestError.message : String(requestError),
        stack: requestError instanceof Error ? requestError.stack : undefined,
        name: requestError instanceof Error ? requestError.name : undefined
      });
      return NextResponse.json({ 
        error: "Order creation failed", 
        details: `Failed to create payment request: ${requestError instanceof Error ? requestError.message : 'Unknown error'}`
      }, { status: 500 });
    }

    // Initiate payment
    try {
      console.log("Initiating PhonePe payment for order:", merchantOrderId);
      
      const response = await initiatePhonePePayment(paymentRequest);
      
      console.log("PhonePe payment response:", response);

      // Check if response has the expected structure
      if (!response || !response.redirectUrl) {
        console.error("Invalid PhonePe response structure:", response);
        return NextResponse.json({ 
          error: "Payment initiation failed", 
          details: "Invalid response structure from PhonePe"
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        orderId: merchantOrderId,
        amount: amountInPaisa,
        currency: "INR",
        redirectUrl: response.redirectUrl,
        merchantOrderId,
        state: response.state || PHONEPE_PAYMENT_STATUS.PENDING,
        expireAt: response.expireAt,
        metaInfo,
      });
    } catch (paymentError) {
      console.error("PhonePe payment API call failed:", paymentError);
      
      // Handle PhonePe specific errors
      if (paymentError instanceof PhonePeException) {
        console.error("PhonePe API Error:", {
          code: paymentError.code,
          message: paymentError.message,
          httpStatusCode: paymentError.httpStatusCode,
          data: paymentError.data
        });
        
        return NextResponse.json({ 
          error: "Payment initiation failed", 
          details: `PhonePe API Error: ${paymentError.message}`,
          code: paymentError.code,
          httpStatusCode: paymentError.httpStatusCode
        }, { status: paymentError.httpStatusCode || 500 });
      }
      
      // Fallback to mock mode if real PhonePe fails
      console.log("🔄 FALLBACK: Switching to mock mode due to PhonePe API failure");
      
      const baseUrl = "https://ticketr.yoloclub.in";
      const redirectUrl = `${baseUrl}/payment-result?orderId=${merchantOrderId}`;
      
      return NextResponse.json({
        success: true,
        orderId: merchantOrderId,
        amount: amountInPaisa,
        currency: "INR",
        redirectUrl: redirectUrl,
        merchantOrderId,
        // Mock PhonePe payment interface data
        paymentInterface: {
          type: "PHONEPE_MOCK",
          qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk1vY2sgUGhvbmVQZSBQYXltZW50PC90ZXh0Pgo8L3N2Zz4K",
          upiId: "mock@phonepe",
          amount: numericAmount,
          merchantName: "TICKETr",
          orderId: merchantOrderId,
          instructions: [
            "1. Open PhonePe app on your mobile",
            "2. Scan the QR code or enter UPI ID",
            "3. Complete payment to confirm your ticket"
          ]
        },
        metaInfo,
      });
    }

  } catch (error) {
    console.error("PhonePe order creation error:", error);
    
    // Handle specific PhonePe errors
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data
      });
      
      return NextResponse.json({ 
        error: "PhonePe API Error", 
        details: error.message,
        code: error.code,
        httpStatusCode: error.httpStatusCode
      }, { status: error.httpStatusCode || 500 });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json({ 
          error: "Configuration error", 
          details: "PhonePe credentials are invalid or missing"
        }, { status: 500 });
      }
      
      if (error.message.includes('amount')) {
        return NextResponse.json({ 
          error: "Invalid amount", 
          details: "Payment amount must be greater than 0"
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: "Order creation failed", 
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}