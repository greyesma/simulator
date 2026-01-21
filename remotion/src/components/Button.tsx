// remotion/src/components/Button.tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, borders, animations } from '../lib/design-system';
import { fonts } from '../lib/fonts';

type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  delay?: number;
  pressed?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  delay = 0,
  pressed = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: animations.snappy,
  });

  const scale = entrance * (pressed ? 0.95 : 1);

  const isPrimary = variant === 'primary';

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: isPrimary ? colors.text : colors.background,
        border: `${borders.width}px solid ${colors.border}`,
        borderRadius: borders.radius,
        fontFamily: fonts.heading,
        fontSize: 16,
        fontWeight: 700,
        color: isPrimary ? colors.background : colors.text,
        transform: `scale(${scale})`,
        cursor: 'pointer',
      }}
    >
      {label}
    </div>
  );
};
