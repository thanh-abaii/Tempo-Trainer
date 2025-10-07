// FIX: Implemented missing content for WorkoutUI.tsx
import React from 'react';
import { WorkoutPlan, WorkoutBlock, Phase, WorkoutState, EngineState } from '../types';
import TimerDisplay from './TimerDisplay';
import Controls from './Controls';
import { COUNTDOWN_SECONDS } from '../constants';

interface WorkoutUIProps {
    plan: WorkoutPlan;
    block: WorkoutBlock | undefined;
    blockIndex: number;
    state: EngineState;
    currentSet: number;
    currentRep: number;
    currentPhase: Phase | null;
    timeLeftInPhase: number;
    totalTimeInPhase: number;
    timeLeftInRest: number;
    actions: {
        pause: () => void;
        resume: () => void;
        skipRest: () => void;
        addRestTime: (seconds: number) => void;
    };
    onStop: () => void;
}

const WorkoutUI: React.FC<WorkoutUIProps> = ({
    plan,
    block,
    blockIndex,
    state,
    currentSet,
    currentRep,
    currentPhase,
    timeLeftInPhase,
    totalTimeInPhase,
    timeLeftInRest,
    actions,
    onStop
}) => {
    if (!block) {
        return <div className="text-center p-8 text-gray-400">Preparing your workout...</div>;
    }

    const { workoutState, countdown } = state;

    const isResting = workoutState === WorkoutState.RESTING;
    const isCountdown = workoutState === WorkoutState.COUNTDOWN;

    const renderWorkoutInfo = () => (
        <div className="text-center mb-4 w-full">
            <h2 className="text-3xl font-bold text-emerald-400 truncate" title={block.exercise}>{block.exercise}</h2>
            {plan.blocks.length > 1 && (
                 <p className="text-md text-gray-400">
                    Block {blockIndex + 1} of {plan.blocks.length}
                </p>
            )}
            <div className="flex justify-around mt-4 text-lg w-full max-w-xs mx-auto">
                <div className="text-center">
                    <div className="text-gray-400 text-sm">SET</div>
                    <div className="font-semibold text-white text-2xl">{currentSet}/{block.sets}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400 text-sm">REP</div>
                    <div className="font-semibold text-white text-2xl">{currentRep}/{block.reps}</div>
                </div>
            </div>
        </div>
    );
    
    const renderTimer = () => {
        if (isResting) {
            const radius = 100;
            const circumference = 2 * Math.PI * radius;
            const progress = block.rest > 0 ? (timeLeftInRest / block.rest) : 1;
            const strokeDashoffset = circumference * (1 - progress);

            return (
                <div className="relative w-64 h-64 flex flex-col items-center justify-center text-center">
                    <svg className="absolute w-full h-full" viewBox="0 0 220 220">
                        <circle cx="110" cy="110" r={radius} strokeWidth="15" className="stroke-gray-700" fill="none" />
                        <circle
                            cx="110" cy="110" r={radius}
                            strokeWidth="15"
                            className="stroke-blue-500"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                            transform="rotate(-90 110 110)"
                        />
                    </svg>
                    <div className="z-10">
                        <p className="text-2xl text-gray-300">Rest</p>
                        <p className="text-8xl font-mono font-bold leading-none my-2">{timeLeftInRest}</p>
                        <p className="text-xl text-gray-400">seconds</p>
                    </div>
                </div>
            );
        }

        return (
            <TimerDisplay
                phase={isCountdown ? null : currentPhase}
                timeLeft={isCountdown ? countdown : timeLeftInPhase}
                totalTime={isCountdown ? COUNTDOWN_SECONDS : totalTimeInPhase}
            />
        );
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow-xl space-y-6">
            {renderWorkoutInfo()}
            {renderTimer()}
            <Controls state={workoutState} actions={actions} onStop={onStop} />
        </div>
    );
};

export default WorkoutUI;
