
import React from 'react';
import { WorkoutState } from '../types';
import { PauseIcon, PlayIcon, StopIcon, ForwardIcon, PlusIcon } from './icons/WorkoutIcons';


interface ControlsProps {
    state: WorkoutState;
    actions: {
        pause: () => void;
        resume: () => void;
        skipRest: () => void;
        addRestTime: (seconds: number) => void;
    };
    onStop: () => void;
}

const Controls: React.FC<ControlsProps> = ({ state, actions, onStop }) => {
    const renderControls = () => {
        switch (state) {
            case WorkoutState.RUNNING:
                return (
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={actions.pause} className="p-4 bg-yellow-500 rounded-full text-gray-900 hover:bg-yellow-600 transition-colors">
                            <PauseIcon />
                        </button>
                        <button onClick={onStop} className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors">
                            <StopIcon />
                        </button>
                    </div>
                );
            case WorkoutState.PAUSED:
                return (
                     <div className="flex items-center justify-center gap-4">
                        <button onClick={actions.resume} className="p-4 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 transition-colors">
                            <PlayIcon />
                        </button>
                        <button onClick={onStop} className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors">
                            <StopIcon />
                        </button>
                    </div>
                );
            case WorkoutState.RESTING:
                return (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex justify-center gap-4 w-full">
                           <button onClick={() => actions.addRestTime(30)} className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                               <PlusIcon/> +30s
                            </button>
                            <button onClick={actions.skipRest} className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                                <ForwardIcon/> Skip
                            </button>
                        </div>
                         <button onClick={onStop} className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                            Stop
                        </button>
                    </div>
                );
            case WorkoutState.COUNTDOWN:
                 return <p className="text-gray-400">Get ready...</p>
            default:
                return null;
        }
    };

    return <div className="w-full mt-4">{renderControls()}</div>;
};

export default Controls;
