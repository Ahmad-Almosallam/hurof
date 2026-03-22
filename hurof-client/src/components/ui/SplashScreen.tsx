import { useEffect } from 'react';

interface Props {
  team1Color: string;
  team2Color: string;
  onDone: () => void;
}

export function SplashScreen({ team1Color, team2Color, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="splash-overlay">
      <div className="splash-yinyang-wrap">
        <svg className="splash-yinyang" viewBox="-1 -1 2 2">
          {/* team1 background circle */}
          <circle r="1" fill={team1Color} />
          {/* team2 fish shape */}
          <path
            d="M0,-1 A1,1,0,0,0,0,1 A.5,.5,0,0,0,0,0 A.5,.5,0,0,1,0,-1"
            fill={team2Color}
          />
        </svg>
      </div>
    </div>
  );
}
