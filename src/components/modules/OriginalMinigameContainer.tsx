import React from 'react';

interface OriginalMinigameContainerProps {
  gamePath: string; // e.g. '/caixinha/index.html'
  title: string;
}

export const OriginalMinigameContainer: React.FC<OriginalMinigameContainerProps> = ({
  gamePath,
  title
}) => {
  return (
    <div className="flex-1 w-full h-full bg-transparent flex flex-col relative overflow-hidden">
      <iframe
        src={gamePath}
        title={title}
        className="w-full h-full border-none"
        allow="autoplay; keyboard-event"
      />
    </div>
  );
};
