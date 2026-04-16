import { useState, useEffect } from "react";

type Props = {
  targetDate: string;
  onComplete?: () => void;
  variant?: "large" | "compact";
};

const CountdownTimer = ({ targetDate, onComplete, variant = "large" }: Props) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = getTimeLeft(targetDate);
      setTimeLeft(tl);
      if (tl.total <= 0) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (timeLeft.total <= 0) {
    return (
      <span className="font-display text-sm font-bold text-destructive uppercase tracking-wider animate-pulse">
        LIVE NOW
      </span>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5">
        {blocks.map((b, i) => (
          <div key={b.label} className="flex items-center gap-1.5">
            <div className="bg-foreground text-background px-2 py-1 min-w-[32px] text-center">
              <span className="font-display text-sm font-bold">{String(b.value).padStart(2, "0")}</span>
            </div>
            {i < blocks.length - 1 && <span className="font-display text-xs text-muted-foreground">:</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="bg-foreground text-background w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
              <span className="font-display text-2xl md:text-3xl font-bold">
                {String(b.value).padStart(2, "0")}
              </span>
            </div>
            <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5">
              {b.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="font-display text-xl md:text-2xl text-muted-foreground -mt-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
};

function getTimeLeft(targetDate: string) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export default CountdownTimer;
