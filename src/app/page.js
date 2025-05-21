'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/shared/Loader';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      if (status === 'loading') return;

      try {
        if (status === 'unauthenticated' || !session) {
          await router.push('/auth/signin');
          return;
        }

        if (session.user.role === 'USER') {
          await router.push('/user/dashboard');
        } else if (session.user.role === 'VENDOR') {
          await router.push('/vendor/dashboard');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    handleRedirect();
  }, [session, status, router]);

  if (status === 'loading') {
    return <Loader />;
  }

  return <Loader />; // During redirection
}
