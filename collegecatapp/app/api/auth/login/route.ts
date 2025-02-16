import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET() {
  const redirectUrl =
    `${GOOGLE_AUTH_URL}?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=email%20profile%20openid` +
    `&access_type=offline` +
    `&prompt=consent`;

  return NextResponse.json({ redirectUrl });
}
