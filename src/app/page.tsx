import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import Cards from '@/components/cards/cards';

export default function Home() {
  return (
    <>
      <img
        src="/images/applelogostars.png"
        alt="Background"
        className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-[-1] min-h-screen"
      />
      <div className="relative flex flex-col justify-center items-center h-screen w-full z-10">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/70 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/70 to-transparent z-20" />

        <h1 className="inline-block opacity-0 clip-path-inset-100 text-white text-[6rem] md:text-[3rem] mt-[-100px] text-center z-30 font-semibold animate-maskReveal">
          LET YOUR IDEAS FLOURISH
        </h1>
        <div className="mt-8 z-30">
          <Link href="/signUp" passHref>
            <Button className="btn-outline btn-lg">
              GET STARTED
            </Button>
          </Link>
        </div>
      </div>

      <div className="h-16" /> {/* Spacer */}
      <Cards />
    </>
  );
}
