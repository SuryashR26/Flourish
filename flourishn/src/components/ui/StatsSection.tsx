"use client";
import React from 'react';
import StatsCounter from './StatsCounter';

const StatsSection = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center bg-[#0000] py-24 px-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-white text-center">We`&apos;`re in the business of growing businesses.</h2>
            <div style={{ height: '1.2rem' }}></div>
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-center items-center gap-16 md:gap-0">
                {/* Stat 1 */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <StatsCounter
                        target={65}
                        className="text-[5rem] font-extrabold text-[#58a6ff] leading-none"
                        suffix="%"
                    />
                    <span className="text-white text-lg text-center mt-4">of high-potential startups fail<br />due to conflict among co-founders<sup className='align-super text-xs'>5</sup></span>
                </div>
                {/* Stat 2 */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <StatsCounter
                        target={2.6}
                        decimals={1}
                        className="text-[5rem] font-extrabold text-[#58a6ff] leading-none"
                    />
                    <span className="text-white text-lg text-center mt-4">times more likely that company validated<br /> teams are to deliver projects on time<sup className='align-super text-xs'>3</sup></span>
                </div>
                {/* Stat 3 */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <StatsCounter
                        target={30}
                        className="text-[5rem] font-extrabold text-[#58a6ff] leading-none"
                        suffix="%"
                    />
                    <span className="text-white text-lg text-center mt-4">is how much collaboration <br />can reduce project timelines by<sup className='align-super text-xs'>5</sup></span>
                </div>
            </div>
        </div>
    );
};

export default StatsSection; 