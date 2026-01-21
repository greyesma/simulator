// remotion/src/components/ChatBubble.tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, borders, animations } from '../lib/design-system';
import { fonts } from '../lib/fonts';

type ChatBubbleProps = {
  message: string;
  isUser?: boolean;
  delay?: number;
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser = false,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in from right with spring
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: animations.snappy,
  });

  const translateX = (1 - entrance) * (isUser ? 100 : -100);
  const opacity = entrance;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          backgroundColor: isUser ? colors.accent : colors.background,
          border: `${borders.width}px solid ${colors.border}`,
          borderRadius: borders.radius,
          fontFamily: fonts.heading,
          fontSize: 14,
          color: colors.text,
        }}
      >
        {message}
      </div>
    </div>
  );
};
