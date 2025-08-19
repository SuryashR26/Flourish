"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ['/login', '/signup', '/forgotPassword', '/search', '/dashboard', '/messages', '/statistics'];
  const showFooter = !publicRoutes.includes(pathname);

  return (
    <div>
      {children}
      {showFooter && <Footer />}
    </div>
  );
} 