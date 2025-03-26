import { prisma } from "@/prisma/prisma.client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing required parameters: publicKey or eventId" },
      { status: 400 }
    );
  }

  try {
    const res = await prisma.event.findFirst({
      where: {
        eventId: +eventId,
      },
    });

    const safeResponse = JSON.parse(
      JSON.stringify(res, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json({ res: safeResponse });
  } catch (error) {
    console.error("Error fetching stake details:", error);
    return NextResponse.json({ error: "Something went wrong!" });
  }
}
