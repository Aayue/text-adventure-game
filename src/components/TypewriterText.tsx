import React, { useEffect, useState, useRef } from 'react';
import { soundEffects } from '../utils/sound';
import { FastForward, Check } from 'lucide-react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per char
  onComplete?: () => void;
  className?: string;
  cursorColor?: string;
  enableAudio?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 18,
  onComplete,
  className = '',
  cursorColor = 'text-cyan-400',
  enableAudio = true,
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isDone, setIsDone] = useState<boolean>(false);
  const audioCounterRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);

    if (!text) {
      setIsDone(true);
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedText(text.slice(0, currentIndex));

      // Subtle audio feedback every 3 characters to sound smooth and not overwhelming
      audioCounterRef.current += 1;
      if (enableAudio && audioCounterRef.current % 3 === 0) {
        soundEffects.typewriterBlip();
      }

      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsDone(true);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enableAudio]);

  const handleInstantComplete = () => {
    if (!isDone) {
      setDisplayedText(text);
      setIsDone(true);
      if (onCompleteRef.current) onCompleteRef.current();
    }
  };

  return (
    <div
      id="typewriter-container"
      onClick={handleInstantComplete}
      className={`relative group cursor-pointer select-none font-mono-term ${className}`}
      title={isDone ? '' : '点击快速跳过打字动画'}
    >
      <div className="whitespace-pre-wrap leading-relaxed text-slate-100">
        {displayedText}
        {!isDone && (
          <span className={`inline-block ml-0.5 animate-pulse font-bold ${cursorColor}`}>
            ▋
          </span>
        )}
      </div>

      {!isDone && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400/70 font-tech opacity-0 group-hover:opacity-100 transition-opacity">
          <FastForward className="w-3.5 h-3.5 animate-pulse" />
          <span>点击任意位置可跳过打字动画</span>
        </div>
      )}
    </div>
  );
};
