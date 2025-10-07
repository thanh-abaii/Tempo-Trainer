
export interface Tempo {
    concentric: number;
    pause: number;
    eccentric: number;
}

export enum Phase {
    CONCENTRIC = 'CONCENTRIC',
    PAUSE = 'PAUSE',
    ECCENTRIC = 'ECCENTRIC',
}

export const PHASE_ORDER_OPTIONS = {
    'ecc-pause-con': [Phase.ECCENTRIC, Phase.PAUSE, Phase.CONCENTRIC],
    'con-pause-ecc': [Phase.CONCENTRIC, Phase.PAUSE, Phase.ECCENTRIC],
} as const;

export type PhaseOrder = keyof typeof PHASE_ORDER_OPTIONS;


export interface WorkoutBlock {
    exercise: string;
    sets: number;
    reps: number;
    tempo: Tempo;
    rest: number;
    order: PhaseOrder;
    concentricKeyword: 'push' | 'pull';
}

export interface WorkoutPlan {
    session: string;
    blocks: WorkoutBlock[];
}

export enum WorkoutState {
    IDLE = 'IDLE',
    COUNTDOWN = 'COUNTDOWN',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    RESTING = 'RESTING',
    FINISHED = 'FINISHED',
}

export interface EngineState {
    workoutState: WorkoutState;
    countdown: number;
}
