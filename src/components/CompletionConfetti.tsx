import { useEffect, useState } from "react";

interface CompletionConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

interface ConfettiParticle {
  id: number;
  left: number;
  top: number;
  color: string;
  size: number;
  animationDuration: number;
  rotation: number;
}

const CompletionConfetti = ({ show, onComplete }: CompletionConfettiProps) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    // Create confetti particles
    const colors = [
      "#FFC700",
      "#FF0000",
      "#2E3191",
      "#41C0F0",
      "#8BC34A",
      "#FF5722",
    ];
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 5;
      const animationDuration = Math.random() * 3 + 2;
      const rotation = Math.random() * 360;

      newParticles.push({
        id: i,
        left,
        top,
        color,
        size,
        animationDuration,
        rotation,
      });
    }

    setParticles(newParticles);

    // Clean up after animation
    const timeout = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [show, onComplete]);

  if (!show && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `fall ${particle.animationDuration}s linear forwards`,
          }}
        />
      ))}

      {show && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-xl shadow-2xl p-8 animate-bounce pointer-events-auto">
          <h2 className="text-3xl font-bold text-center text-green-600 mb-4">
            Tebrikler!
          </h2>
          <p className="text-xl text-center text-gray-700">
            Boyama tamamlandı!
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletionConfetti;
