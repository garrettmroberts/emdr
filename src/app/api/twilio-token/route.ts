import { NextResponse } from "next/server";
import twilio from "twilio";

// Twilio Account SID and Auth Token should be in environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function GET() {
  try {
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: "Twilio credentials not configured" },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);
    const token = await client.tokens.create();

    // Return the ICE servers from the token
    return NextResponse.json({ iceServers: token.iceServers });
  } catch (error) {
    console.error("Error generating Twilio token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
