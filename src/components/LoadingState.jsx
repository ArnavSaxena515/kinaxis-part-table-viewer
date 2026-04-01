import { useState, useEffect } from 'react';
import { STATUS_MESSAGES } from '../api/constants';

export default function LoadingState({ elapsedMs }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Find the right status message based on elapsed time
    let idx = 0;
    for (let i = STATUS_MESSAGES.length - 1; i >= 0; i--) {
      if (elapsedMs >= STATUS_MESSAGES[i].minTime) {
        idx = i;
        break;
      }
    }
    setMessageIndex(idx);
  }, [elapsedMs]);

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const message = STATUS_MESSAGES[messageIndex];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-surface-container border-t-primary rounded-full animate-spin mb-6"></div>

      {/* Status Message */}
      <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-2">
        {message.text}
      </p>

      {/* Elapsed Time */}
      <p className="text-xs text-on-surface-variant opacity-60">
        {elapsedSeconds}s elapsed
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-64 h-1 bg-surface-container-high overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min((elapsedMs / 120000) * 100, 100)}%`,
            background: 'linear-gradient(135deg, #b90027, #e31937)',
          }}
        ></div>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-widest text-on-surface-variant opacity-40">
        SAP S/4HANA → Kinaxis Maestro
      </p>
    </div>
  );
}
