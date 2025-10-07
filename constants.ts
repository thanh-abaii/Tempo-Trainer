// FIX: Implemented missing content for constants.ts
import { WorkoutBlock, Phase, Tempo } from './types';

export const COUNTDOWN_SECONDS = 5;

export const DEFAULT_WORKOUT: WorkoutBlock = {
    exercise: 'Custom Workout',
    sets: 4,
    reps: 10,
    tempo: { eccentric: 4, pause: 1, concentric: 1 },
    rest: 90,
    order: 'ecc-pause-con',
    concentricKeyword: 'push',
};

export const PRESETS: { [key: string]: Partial<WorkoutBlock> & { tempo: Tempo } } = {
    'Strength': {
        sets: 5,
        reps: 5,
        tempo: { eccentric: 3, pause: 1, concentric: 1 },
        rest: 180,
    },
    'Hypertrophy': {
        sets: 4,
        reps: 10,
        tempo: { eccentric: 4, pause: 1, concentric: 1 },
        rest: 90,
    },
    'Endurance': {
        sets: 3,
        reps: 15,
        tempo: { eccentric: 2, pause: 0, concentric: 2 },
        rest: 45,
    },
};

export const PHASE_LABELS: Record<Phase, string> = {
    [Phase.ECCENTRIC]: 'Lowering',
    [Phase.PAUSE]: 'Pause',
    [Phase.CONCENTRIC]: 'Lifting',
};