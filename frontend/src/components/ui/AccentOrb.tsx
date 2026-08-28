import { COLORS } from '../../constants';

type Hue = keyof typeof COLORS.accent;

type Props = {
  hue: Hue;
  size?: number;
};

// Map each accent hue to one of Sarvam's hosted gradient avatars. Using the
// real SVG art matches the dashboard.sarvam.ai aesthetic 1:1 instead of
// faking the gradient with CSS.
const AVATARS: Record<Hue, string> = {
  lavender: 'https://dashboard.sarvam.ai/assets/voices/avatar-1.svg',
  peach:    'https://dashboard.sarvam.ai/assets/voices/avatar-2.svg',
  pink:     'https://dashboard.sarvam.ai/assets/voices/avatar-3.svg',
  rose:     'https://dashboard.sarvam.ai/assets/voices/avatar-3.svg',
  mint:     'https://dashboard.sarvam.ai/assets/voices/avatar-5.svg',
  sand:     'https://dashboard.sarvam.ai/assets/voices/avatar-6.svg',
  sky:      'https://dashboard.sarvam.ai/assets/voices/avatar-8.svg',
  butter:   'https://dashboard.sarvam.ai/assets/voices/avatar-2.svg',
};

export default function AccentOrb({ hue, size = 36 }: Props) {
  return (
    <img
      aria-hidden
      alt=""
      src={AVATARS[hue]}
      loading="lazy"
      draggable={false}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        userSelect: 'none',
      }}
    />
  );
}
