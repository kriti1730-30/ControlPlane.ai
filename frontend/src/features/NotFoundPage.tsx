import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
} from '../constants';

export default function NotFoundPage() {
  return (
    <Layout>
      <main
        role="main"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: SPACE[12],
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.mono,
            fontSize: FONT_SIZE.xs,
            color: COLORS.ink[500],
            letterSpacing: LETTER_SPACING.wide,
            textTransform: 'uppercase',
          }}
        >
          404
        </p>
        <h1
          style={{
            margin: `${SPACE[3]}px 0 ${SPACE[2]}px`,
            fontFamily: FONTS.display,
            fontSize: FONT_SIZE['2xl'],
            fontWeight: FONT_WEIGHT.medium,
            lineHeight: LINE_HEIGHT.tight,
            color: COLORS.ink[900],
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: 420,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            lineHeight: LINE_HEIGHT.relaxed,
            color: COLORS.ink[600],
          }}
        >
          The page you are looking for doesn’t exist or has moved.
        </p>
        <Link
          to="/"
          className="focus-visible:outline-none focus-visible:ring-2 hover:opacity-90"
          style={{
            marginTop: SPACE[8],
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: SPACE[18],
            paddingLeft: SPACE[8],
            paddingRight: SPACE[8],
            borderRadius: RADIUS.pill,
            backgroundColor: COLORS.ink[900],
            color: COLORS.surface,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.regular,
            lineHeight: 1,
            textDecoration: 'none',
            transition: 'opacity 120ms',
          }}
        >
          Back to home
        </Link>
      </main>
    </Layout>
  );
}
