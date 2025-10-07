
import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutBlock, WorkoutPlan, WorkoutState, Phase, PhaseOrder } from './types';
import { DEFAULT_WORKOUT, PRESETS } from './constants';
import ConfigPanel from './components/ConfigPanel';
import WorkoutUI from './components/WorkoutUI';
import { useWorkoutEngine } from './hooks/useWorkoutEngine';
import { useAudioCues } from './hooks/useAudioCues';

const App: React.FC = () => {
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

    const { speak, beep, preLoadVoices } = useAudioCues();
    
    useEffect(() => {
        preLoadVoices();
    }, [preLoadVoices]);
    
    const currentBlock = workoutPlan?.blocks[currentBlockIndex];

    const onWorkoutEnd = useCallback(() => {
        if (workoutPlan && currentBlockIndex < workoutPlan.blocks.length - 1) {
            setCurrentBlockIndex(prev => prev + 1);
            beep('setEnd');
        } else {
            setWorkoutPlan(null);
            setCurrentBlockIndex(0);
            beep('setEnd');
            speak('Workout complete. Good job!');
        }
    }, [workoutPlan, currentBlockIndex, beep, speak]);

    const {
        state,
        currentSet,
        currentRep,
        currentPhase,
        timeLeftInPhase,
        totalTimeInPhase,
        timeLeftInRest,
        actions,
    } = useWorkoutEngine(currentBlock, onWorkoutEnd, speak, beep);


    const handleStartWorkout = (plan: WorkoutPlan) => {
        setWorkoutPlan(plan);
        setCurrentBlockIndex(0);
        // Delay starting the engine to allow state to update
        setTimeout(() => actions.start(), 100);
    };

    const handleStopWorkout = () => {
        actions.reset();
        setWorkoutPlan(null);
        setCurrentBlockIndex(0);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto">
                <header className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-emerald-400">Tempo Trainer</h1>
                    <p className="text-gray-400">Gym Workout Timer</p>
                </header>

                {state.workoutState === WorkoutState.IDLE || !workoutPlan ? (
                    <ConfigPanel onStart={handleStartWorkout} />
                ) : (
                    <WorkoutUI
                        plan={workoutPlan}
                        block={currentBlock}
                        blockIndex={currentBlockIndex}
                        state={state}
                        currentSet={currentSet}
                        currentRep={currentRep}
                        currentPhase={currentPhase}
                        timeLeftInPhase={timeLeftInPhase}
                        totalTimeInPhase={totalTimeInPhase}
                        timeLeftInRest={timeLeftInRest}
                        actions={actions}
                        onStop={handleStopWorkout}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
