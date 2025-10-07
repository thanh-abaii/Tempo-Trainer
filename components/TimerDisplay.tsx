
import React from 'react';
import { Phase } from '../types';
import { PHASE_LABELS } from '../constants';

interface TimerDisplayProps {
    phase: Phase | null;
    timeLeft: number;
    totalTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ phase, timeLeft, totalTime }) => {
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? (timeLeft / totalTime) : 1;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-64 h-64 flex flex-col items-center justify-center text-center">
            <svg className="absolute w-full h-full" viewBox="0 0 220 220">
                <circle
                    cx="110" cy="110" r={radius}
                    strokeWidth="15"
                    className="stroke-gray-700"
                    fill="none"
                />
                <circle
                    cx="110" cy="110" r={radius}
                    strokeWidth="15"
                    className="stroke-emerald-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                    transform="rotate(-90 110 110)"
                />
            </svg>
            <div className="z-10">
                <p className="text-2xl text-gray-300">{phase ? PHASE_LABELS[phase] : 'Start'}</p>
                <p className="text-8xl font-mono font-bold leading-none my-2">{timeLeft}</p>
                <p className="text-xl text-gray-400">seconds</p>
            </div>
        </div>
    );
};

export default TimerDisplay;
