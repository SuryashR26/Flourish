"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './footer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useUser } from '@/context/UserContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isInitialized } = useUser();
  const publicRoutes = ['/login', '/signup', '/forgotPassword', '/search', '/dashboard', '/messages', '/statistics'];
  const showFooter = !publicRoutes.includes(pathname);

  // Show loading screen while authentication is being checked
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div>
      {children}
      {showFooter && <Footer />}
    </div>
  );
} 