import { auth, clerkClient } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uID = searchParams.get("user_id")
  const { userId } = auth();
  if (userId == null || uID == null) return false;
  const user = await clerkClient.users.getUser(uID);
  return NextResponse.json(user, { status: 200});
}

