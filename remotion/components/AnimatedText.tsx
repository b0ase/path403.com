import { interpolate, useCurrentFrame } from 'remotion';

interface AnimatedTextProps {
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
  className?: string;
  duration?: number;
  type?: 'fadeIn' | 'slideUp' | 'typewriter' | 'scaleIn';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startFrame,
  style,
  className,
  duration = 20,
  type = 'fadeIn',
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) return null;

  let opacity = 1;
  let transform = 'none';

  switch (type) {
    case 'fadeIn':
      opacity = interpolate(relativeFrame, [0, duration], [0, 1], {
        extrapolateRight: 'clamp',
      });
      break;
    case 'slideUp':
      opacity = interpolate(relativeFrame, [0, duration], [0, 1], {
        extrapolateRight: 'clamp',
      });
      const y = interpolate(relativeFrame, [0, duration], [30, 0], {
        extrapolateRight: 'clamp',
      });
      transform = `translateY(${y}px)`;
      break;
    case 'scaleIn':
      opacity = interpolate(relativeFrame, [0, duration], [0, 1], {
        extrapolateRight: 'clamp',
      });
      const scale = interpolate(relativeFrame, [0, duration], [0.8, 1], {
        extrapolateRight: 'clamp',
      });
      transform = `scale(${scale})`;
      break;
    case 'typewriter':
      const charsToShow = Math.floor(
        interpolate(relativeFrame, [0, duration], [0, text.length], {
          extrapolateRight: 'clamp',
        })
      );
      return (
        <span style={{ ...style, opacity: 1 }} className={className}>
          {text.slice(0, charsToShow)}
          <span style={{ opacity: relativeFrame % 10 < 5 ? 1 : 0 }}>|</span>
        </span>
      );
  }

  return (
    <span style={{ ...style, opacity, transform }} className={className}>
      {text}
    </span>
  );
};

interface AnimatedParagraphProps {
  lines: string[];
  startFrame: number;
  lineDelay?: number;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
  type?: 'fadeIn' | 'slideUp' | 'scaleIn';
}

export const AnimatedParagraph: React.FC<AnimatedParagraphProps> = ({
  lines,
  startFrame,
  lineDelay = 15,
  style,
  lineStyle,
  type = 'slideUp',
}) => {
  return (
    <div style={style}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'block', ...lineStyle }}>
          <AnimatedText
            text={line}
            startFrame={startFrame + i * lineDelay}
            type={type}
          />
        </div>
      ))}
    </div>
  );
};
