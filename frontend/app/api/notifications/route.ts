// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL not set in environment variables');
}

const redis = new Redis(process.env.REDIS_URL);

const NOTIFICATION_KEY = 'priorityform_notification';

interface Notification {
  notification: string;
  date: string;
  role: string;
}

// GET: return the latest notification
export async function GET() {
  const notification = await redis.get(NOTIFICATION_KEY);
  const parsed = notification ? JSON.parse(notification) : null;
  return NextResponse.json(parsed);
}

// POST: replace the notification with latest
export async function POST(req: Request) {
  const data = (await req.json()) as Notification;

  if (!data.notification || !data.date || !data.role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await redis.set(NOTIFICATION_KEY, JSON.stringify(data));
  return NextResponse.json({ success: true });
}
