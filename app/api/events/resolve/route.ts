import { prisma } from "@/prisma/prisma.client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    const updatedEvent = await prisma.event.update({
      where: { eventId: +eventId },
      data: { isResolved: true },
    });

    return NextResponse.json({ updatedEvent });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update event resolution" },
      { status: 500 }
    );
  }
}
