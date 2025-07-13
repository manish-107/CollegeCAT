import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL not set in environment variables');
}

const redis = new Redis(process.env.REDIS_URL);

const NOTIFICATION_KEY = 'priorityform_notification';
const HOD_ALLOCATION_KEY = 'allocation_notification_to_hod';

interface Notification {
  notification: string;
  date: string;
  role: string;
}

// Helper to determine key based on query param
const getNotificationKey = (type?: string) => {
  return type === 'hod' ? HOD_ALLOCATION_KEY : NOTIFICATION_KEY;
};

// GET: return the latest notification
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || '';
  const key = getNotificationKey(type);

  const notification = await redis.get(key);
  const parsed = notification ? JSON.parse(notification) : null;
  return NextResponse.json(parsed);
}

// POST: replace the notification with latest
export async function POST(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || '';
  const key = getNotificationKey(type);

  const data = (await req.json()) as Notification;

  if (!data.notification || !data.date || !data.role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await redis.set(key, JSON.stringify(data));
  return NextResponse.json({ success: true });
}
