import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutBlock, WorkoutState, Phase, PHASE_ORDER_OPTIONS } from '../types';
import { COUNTDOWN_SECONDS } from '../constants';

export const useWorkoutEngine = (
    block: WorkoutBlock | undefined,
    onWorkoutEnd: () => void,
    speak: (text: string) => void,
    beep: (type: 'tick' | 'phaseEnd' | 'repEnd' | 'setEnd') => void
) => {
    const [state, setState] = useState<{ workoutState: WorkoutState, countdown: number }>({
        workoutState: WorkoutState.IDLE,
        countdown: COUNTDOWN_SECONDS,
    });
    const [currentSet, setCurrentSet] = useState(1);
    const [currentRep, setCurrentRep] = useState(1);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [timeLeftInPhase, setTimeLeftInPhase] = useState(0);
    const [timeLeftInRest, setTimeLeftInRest] = useState(0);
    
    const intervalRef = useRef<number | null>(null);
    
    const phaseOrder = block ? PHASE_ORDER_OPTIONS[block.order] : [];
    const currentPhase = block ? phaseOrder[phaseIndex] : null;

    const totalTimeInPhase = useCallback(() => {
        if (!block || !currentPhase) return 0;
        switch (currentPhase) {
            case Phase.ECCENTRIC: return block.tempo.eccentric;
            case Phase.PAUSE: return block.tempo.pause;
            case Phase.CONCENTRIC: return block.tempo.concentric;
            default: return 0;
        }
    }, [block, currentPhase]);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const advancePhase = useCallback(() => {
        if (!block) return;
        beep('phaseEnd');
        if (navigator.vibrate) navigator.vibrate(50);

        if (phaseIndex < phaseOrder.length - 1) {
            setPhaseIndex(prev => prev + 1);
        } else { // End of Rep
            beep('repEnd');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            if (currentRep < block.reps) {
                setCurrentRep(prev => prev + 1);
                setPhaseIndex(0);
            } else { // End of Set
                beep('setEnd');
                if (navigator.vibrate) navigator.vibrate(300);

                if (currentSet < block.sets) {
                    setState({ workoutState: WorkoutState.RESTING, countdown: 0 });
                    setTimeLeftInRest(block.rest);
                } else { // End of Block
                    setState({ workoutState: WorkoutState.FINISHED, countdown: 0 });
                    onWorkoutEnd();
                }
            }
        }
    }, [block, phaseIndex, phaseOrder.length, currentRep, currentSet, onWorkoutEnd, beep]);


    useEffect(() => {
        if (!block || state.workoutState !== WorkoutState.RUNNING) {
            return;
        }
        
        const timeForPhase = totalTimeInPhase();
        setTimeLeftInPhase(timeForPhase);

        if (timeForPhase > 0) {
            if (currentPhase === Phase.PAUSE) speak('pause');
            if (currentPhase === Phase.CONCENTRIC) speak(block.concentricKeyword);
        } else {
             // Immediately advance if phase time is 0
            advancePhase();
        }

    }, [state.workoutState, currentSet, currentRep, phaseIndex, block, totalTimeInPhase, speak, advancePhase, currentPhase]);


    useEffect(() => {
        if (state.workoutState !== WorkoutState.RUNNING &&
            state.workoutState !== WorkoutState.RESTING &&
            state.workoutState !== WorkoutState.COUNTDOWN) {
            stopTimer();
            return;
        }
        
        intervalRef.current = window.setInterval(() => {
            switch (state.workoutState) {
                case WorkoutState.COUNTDOWN:
                    setState(s => {
                        const newCountdown = s.countdown - 1;
                        if (newCountdown > 0) {
                            speak(String(newCountdown));
                            return { ...s, countdown: newCountdown };
                        } else {
                             speak('Start!');
                             beep('setEnd');
                            return { ...s, workoutState: WorkoutState.RUNNING };
                        }
                    });
                    break;
                case WorkoutState.RUNNING:
                     setTimeLeftInPhase(t => {
                        const newTime = t - 1;
                        if (newTime > 0) {
                            beep('tick');
                            return newTime;
                        } else {
                            // Stop timer here immediately before transitioning state
                            // This is the key fix to prevent race conditions
                            stopTimer();
                            advancePhase();
                            return 0;
                        }
                    });
                    break;
                case WorkoutState.RESTING:
                    setTimeLeftInRest(t => {
                        if (t <= 0) { // Check current time to decide action
                            stopTimer(); // Stop the timer immediately before transitioning
                            setCurrentSet(s => s + 1);
                            setCurrentRep(1);
                            setPhaseIndex(0);
                            setState({ workoutState: WorkoutState.COUNTDOWN, countdown: COUNTDOWN_SECONDS });
                            return 0; // Return 0 to prevent negative time
                        }

                        const newTime = t - 1;
                        if (newTime > 0 && newTime <= 3) {
                            speak(String(newTime));
                        }
                        return newTime;
                    });
                    break;
            }
        }, 1000);

        return () => stopTimer();

    }, [state, stopTimer, advancePhase, speak, beep]);

    const resetState = useCallback(() => {
        stopTimer();
        setState({ workoutState: WorkoutState.IDLE, countdown: COUNTDOWN_SECONDS });
        setCurrentSet(1);
        setCurrentRep(1);
        setPhaseIndex(0);
        setTimeLeftInPhase(0);
        setTimeLeftInRest(0);
    }, [stopTimer]);

    useEffect(() => {
        // Reset when block changes
        resetState();
    }, [block, resetState]);


    const actions = {
        start: () => {
             if (block) {
                resetState();
                setState({ workoutState: WorkoutState.COUNTDOWN, countdown: COUNTDOWN_SECONDS });
                speak(`Set 1, ${block.reps} reps. Starting in ${COUNTDOWN_SECONDS} seconds`);
            }
        },
        pause: () => setState(s => ({...s, workoutState: WorkoutState.PAUSED })),
        resume: () => setState(s => ({...s, workoutState: WorkoutState.RUNNING })),
        reset: () => resetState(),
        skipRest: () => {
            if (block && currentSet < block.sets) {
                setCurrentSet(s => s + 1);
                setCurrentRep(1);
                setPhaseIndex(0);
                setTimeLeftInRest(0);
                setState({ workoutState: WorkoutState.COUNTDOWN, countdown: COUNTDOWN_SECONDS });
            } else if (block && currentSet >= block.sets) {
                 setState({ workoutState: WorkoutState.FINISHED, countdown: 0 });
                 onWorkoutEnd();
            }
        },
        addRestTime: (seconds: number) => {
            if (state.workoutState === WorkoutState.RESTING) {
                setTimeLeftInRest(t => t + seconds);
            }
        },
    };

    return {
        state,
        currentSet,
        currentRep,
        currentPhase,
        timeLeftInPhase,
        totalTimeInPhase: totalTimeInPhase(),
        timeLeftInRest,
        actions
    };
};