import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login'); // Automatically redirects to login page
}