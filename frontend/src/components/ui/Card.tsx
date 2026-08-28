import type { CSSProperties, ReactNode } from 'react';
import { COLORS, RADIUS, SPACE } from '../../constants';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'article';
};

export default function Card({ children, className = '', style, as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={className}
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: RADIUS.lg,
        padding: SPACE[12],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
