import { redirect } from 'next/navigation';
import UserHeader from '@/components/user/UserHeader';
import { cookies } from 'next/headers';
import { authenticateUser } from '@/lib/actions/auth';

// This layout wraps every page under /user/*
// It runs server-side on every request, so no client-side flicker.
// If the JWT cookie is missing or invalid, we redirect to /login.

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  // 1. Read the token cookie (set by the verify‑otp route)
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    // No token → redirect immediately
    redirect('/login');
  }

  // 2. Optionally validate token with the backend
  //    We pass the cookie so the backend can read/verify it
  const meRes = await authenticateUser(token)

  if (!meRes.success) {
    // Token invalid or expired → redirect
    redirect('/login');
  }

  // 2. If authenticated, render the user-specific layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom header for authenticated user pages */}
      <UserHeader user={{ email: meRes.email }} />
      
      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}