import { redirect } from 'next/navigation';

// "/" langsung diarahkan ke dashboard
export default function Home() {
  redirect('/dashboard');
}

