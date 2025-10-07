import React, { useState, useRef } from 'react';
import { WorkoutBlock, WorkoutPlan, PhaseOrder } from '../types';
import { DEFAULT_WORKOUT, PRESETS } from '../constants';

interface ConfigPanelProps {
    onStart: (plan: WorkoutPlan) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onStart }) => {
    const [block, setBlock] = useState<WorkoutBlock>(DEFAULT_WORKOUT);
    const [tempoStr, setTempoStr] = useState('4-1-1');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempoStr(e.target.value);
        const parts = e.target.value.split('-').map(Number);
        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0)) {
            setBlock(prev => ({ ...prev, tempo: { eccentric: parts[0], pause: parts[1], concentric: parts[2] } }));
        }
    };

    const handleIndividualTempoChange = <T extends keyof WorkoutBlock['tempo']>(part: T, value: number) => {
        const newTempo = { ...block.tempo, [part]: value };
        setBlock(prev => ({ ...prev, tempo: newTempo }));
        setTempoStr(`${newTempo.eccentric}-${newTempo.pause}-${newTempo.concentric}`);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string) as WorkoutPlan;
                    // Basic validation
                    if (json.session && Array.isArray(json.blocks)) {
                        onStart(json);
                    } else {
                        alert('Invalid JSON file structure.');
                    }
                } catch (error) {
                    alert('Error parsing JSON file.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    const applyPreset = (presetName: string) => {
        const preset = PRESETS[presetName];
        if (preset) {
            setBlock(prev => ({ ...prev, ...preset }));
            setTempoStr(`${preset.tempo.eccentric}-${preset.tempo.pause}-${preset.tempo.concentric}`);
        }
    }

    const startSingleBlock = () => {
        if (block.sets > 0 && block.reps > 0 && block.rest >= 0) {
            onStart({ session: block.exercise, blocks: [block] });
        } else {
            alert('Sets, Reps must be positive, and Rest must be non-negative.');
        }
    }

    return (
        <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-center text-emerald-400">Setup Your Workout</h2>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Load Plan from JSON</label>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"/>
            </div>

            <div className="text-center text-gray-500">OR</div>

            <div className="space-y-2">
                <label htmlFor="exercise" className="block text-sm font-medium text-gray-300">Exercise Name</label>
                <input type="text" id="exercise" value={block.exercise} onChange={e => setBlock({ ...block, exercise: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="sets" className="block text-sm font-medium text-gray-300">Sets</label>
                    <input type="number" id="sets" value={block.sets} onChange={e => setBlock({ ...block, sets: parseInt(e.target.value, 10) || 0 })} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="reps" className="block text-sm font-medium text-gray-300">Reps</label>
                    <input type="number" id="reps" value={block.reps} onChange={e => setBlock({ ...block, reps: parseInt(e.target.value, 10) || 0 })} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                </div>
            </div>

             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Presets</label>
                <div className="flex gap-2">
                    {Object.keys(PRESETS).map(p => 
                        <button key={p} onClick={() => applyPreset(p)} className="flex-1 py-2 px-4 bg-gray-700 hover:bg-emerald-700 rounded-md text-sm transition-colors">{p}</button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="tempo" className="block text-sm font-medium text-gray-300">Tempo (Ecc-Pause-Con)</label>
                <input type="text" id="tempo" value={tempoStr} onChange={handleTempoChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label htmlFor="rest" className="block text-sm font-medium text-gray-300">Rest (seconds)</label>
                    <input type="number" id="rest" value={block.rest} onChange={e => setBlock({ ...block, rest: parseInt(e.target.value, 10) || 0 })} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="order" className="block text-sm font-medium text-gray-300">Order</label>
                     <select id="order" value={block.order} onChange={e => setBlock({ ...block, order: e.target.value as PhaseOrder })} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                        <option value="ecc-pause-con">Ecc-Pause-Con</option>
                        <option value="con-pause-ecc">Con-Pause-Ecc</option>
                    </select>
                </div>
            </div>
             <div className="space-y-2">
                    <label htmlFor="keyword" className="block text-sm font-medium text-gray-300">Concentric Keyword</label>
                     <select id="keyword" value={block.concentricKeyword} onChange={e => setBlock({ ...block, concentricKeyword: e.target.value as 'push' | 'pull' })} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                        <option value="push">Push</option>
                        <option value="pull">Pull</option>
                    </select>
                </div>

            <button onClick={startSingleBlock} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-lg font-bold transition-colors">Start Workout</button>
        </div>
    );
};

export default ConfigPanel;