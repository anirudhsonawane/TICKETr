"use server";

import { phonepe } from "@/lib/phonepe";
import { getConvexClient } from "@/lib/convex";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

export async function createPhonePeOrder({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Not authenticated");

    const convex = getConvexClient();
    const event = await convex.query(api.events.getById, { eventId });
    if (!event) throw new Error("Event not found");

    const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
      eventId,
      userId,
    });

    if (!queuePosition || queuePosition.status !== "offered") {
      throw new Error("No valid ticket offer found");
    }

    const merchantTransactionId = `ticket_${eventId}_${userId}_${Date.now()}`;
    const redirectUrl = `https://ticketr.yoloclub.in/tickets/purchase-success`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/phonepe`;

    // BYPASS MODE: Check if we should bypass PhonePe API
    const BYPASS_PHONEPE = process.env.BYPASS_PHONEPE === "true" || process.env.NODE_ENV === "development";
    
    if (BYPASS_PHONEPE) {
      console.log("🚀 BYPASS MODE: Skipping PhonePe API call and returning mock data");
      
      // Return mock successful response
      return { 
        orderId: `mock_order_${merchantTransactionId}`, 
        amount: event.price, 
        currency: "INR",
        redirectUrl: redirectUrl,
        merchantTransactionId: merchantTransactionId
      };
    }

    const order = await phonepe.createOrder({
      merchantTransactionId,
      merchantUserId: userId,
      amount: event.price,
      redirectUrl,
      callbackUrl,
    });

    if (!order.success) {
      throw new Error(`PhonePe order creation failed: ${order.message}`);
    }

    return { 
      orderId: order.data.transactionId, 
      amount: order.data.amount, 
      currency: "INR",
      redirectUrl: order.data.redirectUrl,
      merchantTransactionId: order.data.merchantTransactionId
    };
  } catch (error) {
    console.error("PhonePe order creation error:", error);
    throw new Error(`Failed to create PhonePe order: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}


