import { useCallback, useRef, useState } from 'react';

export const useAudioCues = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [vietnameseVoice, setVietnameseVoice] = useState<SpeechSynthesisVoice | null>(null);

    const preLoadVoices = useCallback(() => {
        const getVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const vnVoice = voices.find(v => v.lang.startsWith('vi-VN'));
                setVietnameseVoice(vnVoice || voices.find(v => v.lang.startsWith('en-US')) || voices[0]);
            }
        };

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            getVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = getVoices;
            }
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window) || !vietnameseVoice) {
            console.warn('Speech synthesis not supported or no voice loaded.');
            return;
        }
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = vietnameseVoice;
            utterance.rate = 1.2;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Error speaking:", error);
        }
    }, [vietnameseVoice]);

    const beep = useCallback((type: 'tick' | 'phaseEnd' | 'repEnd' | 'setEnd') => {
        if (typeof window === 'undefined') return;

        if (!audioCtxRef.current) {
            try {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.");
                return;
            }
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Special handling for bell sound at the start/end of a set
        if (type === 'setEnd') {
            const now = ctx.currentTime;
            const duration = 1.5;

            const gainNode = ctx.createGain();
            gainNode.connect(ctx.destination);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02); // Quick attack
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            const baseFreq = 440; // A4
            // Using inharmonic partials for a bell-like sound
            const partials = [0.56, 0.92, 1.19, 1.71, 2.0, 2.74, 3.0, 3.76];
            
            partials.forEach(partial => {
                const osc = ctx.createOscillator();
                osc.connect(gainNode);
                osc.type = 'sine';
                osc.frequency.value = baseFreq * partial;
                osc.start(now);
                osc.stop(now + duration);
            });
            return; // Important: exit after handling bell sound
        }


        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);


        switch (type) {
            case 'tick':
                oscillator.frequency.value = 440; // A4
                break;
            case 'phaseEnd':
                oscillator.frequency.value = 660; // E5
                break;
            case 'repEnd':
                oscillator.frequency.value = 880; // A5
                break;
        }
        
        const duration = type === 'repEnd' ? 0.2 : type === 'phaseEnd' ? 0.15 : 0.08;

        oscillator.start(ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        oscillator.stop(ctx.currentTime + duration);
    }, []);

    return { speak, beep, preLoadVoices };
};