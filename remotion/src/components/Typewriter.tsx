// remotion/src/components/Typewriter.tsx
import { interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../lib/design-system';
import { fonts } from '../lib/fonts';

type TypewriterProps = {
  text: string;
  fontSize?: number;
  charFrames?: number;
  showCursor?: boolean;
  fontFamily?: string;
};

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  fontSize = 16,
  charFrames = 2,
  showCursor = true,
  fontFamily = fonts.mono,
}) => {
  const frame = useCurrentFrame();

  const typedChars = Math.min(text.length, Math.floor(frame / charFrames));
  const typedText = text.slice(0, typedChars);

  // Blinking cursor
  const cursorOpacity = showCursor
    ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        color: colors.text,
      }}
    >
      {typedText}
      {showCursor && (
        <span style={{ opacity: cursorOpacity }}>▌</span>
      )}
    </span>
  );
};
