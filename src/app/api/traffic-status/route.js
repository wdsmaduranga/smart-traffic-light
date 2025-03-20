import { NextResponse } from "next/server";

let stationStatus = {}; // Store status for each station

export async function POST(req) {
  try {
    const data = await req.json();
    const { station, green, yellow, red } = data;

    stationStatus[station] = { green, yellow, red, updatedAt: new Date() };

    return NextResponse.json({ message: "Status updated", status: stationStatus });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(stationStatus);
}
