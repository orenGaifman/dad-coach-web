import { redirect } from 'next/navigation';

/**
 * Dev index page — redirects to /dev/dashboard.
 * 
 * This page exists to provide a convenient redirect when navigating
 * to /dev without the full /dev/dashboard path.
 * 
 * @see Requirement 14.2: When navigating to /dev, redirect to /dev/dashboard
 */
export default function DevPage() {
  redirect('/dev/dashboard');
}
