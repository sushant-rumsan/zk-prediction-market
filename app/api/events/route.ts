import { prisma } from "@/prisma/prisma.client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventId: "desc" },
      take: 9,
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const latestEvent = await prisma.event.findFirst({
      orderBy: { eventId: "desc" },
      select: { eventId: true },
    });

    const latestIdNum = latestEvent?.eventId || 0;
    const newEventId = (+latestIdNum + 1).toString();

    const eventData = {
      eventId: +newEventId,
      eventName: body.eventName,
      eventDetail: body.eventDetail,
    };

    const res = await prisma.event.create({ data: eventData });
    return NextResponse.json({ res });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Couldn't create event" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id } = body;
  const res = await prisma.event.update({
    where: { id },
    data: {
      isChainSuccess: true,
    },
  });
  return NextResponse.json({ res });
}
