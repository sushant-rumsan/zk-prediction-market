import { prisma } from "@/prisma/prisma.client";
import { safeRes } from "@/utils/safeRes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const publicKey = searchParams.get("publicKey")?.trim();

  try {
    const res = await prisma.userParticipation.findMany({
      where: {
        publicKey,
      },
    });
    const safeResponse = safeRes(res);
    return NextResponse.json({ res: safeResponse });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Something went wrong!" });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { publicKey, eventId, stakeKey, stakeAmountYes, stakeAmountNo } = body;
  try {
    const userStakeData = {
      publicKey,
      eventId: +eventId,
      stakeKey,
      stakeAmountYes,
      stakeAmountNo,
    };
    await prisma.event.update({
      where: {
        eventId: +eventId,
      },
      data: {
        totalYesVote: {
          increment: +stakeAmountYes,
        },
        totalNoVote: {
          increment: +stakeAmountNo,
        },
      },
    });

    const res = await prisma.userParticipation.upsert({
      where: {
        stakeKey,
      },
      create: userStakeData,
      update: {
        stakeAmountYes: {
          increment: stakeAmountYes,
        },
        stakeAmountNo: {
          increment: stakeAmountNo,
        },
      },
    });
    //@ts-ignore
    return NextResponse.json({ res: res.json });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Couldn't create event" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { stakeKey } = body;
  try {
    const res = await prisma.userParticipation.update({
      where: {
        stakeKey,
      },
      data: {
        isChainSuccess: true,
      },
    });
    return NextResponse.json({ res });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Couldn't create event" },
      { status: 500 }
    );
  }
}
