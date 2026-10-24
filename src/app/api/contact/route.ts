import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, service, budget, message, botField, formLoadedAt } = body;

    // Honeypot spam protection: if botField is populated, silently reject
    if (botField && botField.trim().length > 0) {
      console.warn("[ANTI-SPAM] Honeypot triggered by automated bot submission.");
      return NextResponse.json({ success: true, message: "Inquiry processed" }, { status: 200 });
    }

    // Timestamp check: if submitted in under 1 second, likely an automated scraper
    if (formLoadedAt && Date.now() - Number(formLoadedAt) < 1000) {
      console.warn("[ANTI-SPAM] Rejected submission completed in < 1 second.");
      return NextResponse.json({ success: true, message: "Inquiry processed" }, { status: 200 });
    }

    // Input validation
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: "First name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid corporate email address." },
        { status: 400 }
      );
    }

    // Log verified inquiry (in production this would dispatch to SendGrid, Resend, or CRM)
    console.log("[INQUIRY LOG]", {
      timestamp: new Date().toISOString(),
      clientName: `${firstName} ${lastName || ""}`.trim(),
      email,
      service: service || "General Scoping",
      budget: budget || "Unspecified",
      messageLength: message.length
    });

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been logged. An Axiom Labs architect will respond within 24 hours.",
      receivedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[API CONTACT ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error processing contact request." },
      { status: 500 }
    );
  }
}
