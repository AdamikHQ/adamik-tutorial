
import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
  text: string;
  typingSpeed?: number;
  initialDelay?: number;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  typingSpeed = 20,
  initialDelay = 200,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setStarted(false);
  }, [text]);

  useEffect(() => {
    if (!text) return;

    // Initial delay before typing starts
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, initialDelay);

    return () => clearTimeout(startTimeout);
  }, [text, initialDelay]);

  useEffect(() => {
    if (!started || currentIndex >= text.length) return;

    const typingTimeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, typingSpeed);

    return () => clearTimeout(typingTimeout);
  }, [currentIndex, text, typingSpeed, started]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="terminal-cursor"></span>
      )}
    </span>
  );
};

export default TypingEffect;
