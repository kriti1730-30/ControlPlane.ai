import { useState } from 'react';
import { CloudUpload } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import SegmentedControl from '../../components/ui/SegmentedControl';
import Chip from '../../components/ui/Chip';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LETTER_SPACING,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';

type ExampleHue = 'green' | 'indigo' | 'orange' | 'coral' | 'red';
type Example = {
  title: string;
  description: string;
  hue: ExampleHue;
};

const EXAMPLES: Example[] = [
  {
    title: 'Research Papers',
    description: 'Charts, graphs & academic layouts',
    hue: 'indigo',
  },
  {
    title: 'Tables & Data',
    description: 'Complex tables with structured data',
    hue: 'green',
  },
  {
    title: 'Handwritten Text',
    description: 'Handwritten letter transcription',
    hue: 'coral',
  },
];

export default function VisionPage() {
  const [mode, setMode] = useState('document');

  return (
    <Layout>
      <PageHeader />

      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        style={{ display: 'none' }}
        aria-hidden
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: SPACE[12],
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: SPACE[12],
            width: '100%',
            maxWidth: 896,
          }}
        >
          <SegmentedControl
            segments={[
              { id: 'general', label: 'General Vision' },
              { id: 'document', label: 'Document Digitization' },
            ]}
            activeId={mode}
            onChange={setMode}
          />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: SPACE[2],
            }}
          >
            <Chip>PDF / JPEG / PNG</Chip>
            <Chip>Complex Layouts</Chip>
            <Chip>22+ Languages</Chip>
          </div>

          <Hero />
          <UploadButton />
          <OrTryDivider />
          <ExampleGrid />
        </div>
      </div>
    </Layout>
  );
}

// ---- Header --------------------------------------------------------------

function PageHeader() {
  return (
    <header
      style={{
        // px-tatva-12 py-tatva-8 border-b
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[4],
        paddingTop: SPACE[8],
        paddingBottom: SPACE[8],
        paddingLeft: SPACE[12],
        paddingRight: SPACE[12],
        borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
        backgroundColor: COLORS.surface,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: FONT_SIZE.xl,
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.ink[900],
            letterSpacing: LETTER_SPACING.tight,
            lineHeight: LINE_HEIGHT.tight,
          }}
        >
          Vision
        </h2>
        <p
          style={{
            margin: 0,
            marginTop: SPACE[2],
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.regular,
            color: COLORS.ink[600],
            lineHeight: LINE_HEIGHT.relaxed,
          }}
        >
          Extract text from images and digitize documents with AI
        </p>
      </div>
    </header>
  );
}

// ---- Hero block ----------------------------------------------------------

function Hero() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACE[4],
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: FONTS.display,
          fontSize: FONT_SIZE['2xl'],          // heading-lg = 24px
          fontWeight: FONT_WEIGHT.medium,
          color: COLORS.ink[900],
          letterSpacing: LETTER_SPACING.tight,
          lineHeight: LINE_HEIGHT.tight,       // 120%
        }}
      >
        Extract text from images and digitize documents
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.regular,
          color: COLORS.ink[600],
          lineHeight: LINE_HEIGHT.relaxed,
        }}
      >
        Upload an image or PDF to digitize documents
      </p>
    </div>
  );
}

// ---- Upload CTA ----------------------------------------------------------

function UploadButton() {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE[4],
        minHeight: SPACE[22],
        paddingLeft: SPACE[8],
        paddingRight: SPACE[8],
        borderRadius: RADIUS.pill,
        border: 'none',
        backgroundColor: COLORS.ink[900],     // brand-content-primary
        color: COLORS.surface,                // brand-foreground (white)
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.regular,
        cursor: 'pointer',
        lineHeight: 1,
        transition: 'opacity 120ms, transform 120ms',
      }}
      className="hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2"
    >
      <CloudUpload
        size={ICON.feature}
        strokeWidth={ICON.strokeWidth}
        aria-hidden
      />
      Upload File
    </button>
  );
}

// ---- "or try an example" divider -----------------------------------------

function OrTryDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[4],
        width: '100%',
        maxWidth: 448,
      }}
    >
      <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border.DEFAULT }} />
      <p
        style={{
          margin: 0,
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.regular,
          color: COLORS.ink[500],          // content-tertiary
          lineHeight: LINE_HEIGHT.relaxed,
          whiteSpace: 'nowrap',
        }}
      >
        or try an example
      </p>
      <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border.DEFAULT }} />
    </div>
  );
}

// ---- Example cards -------------------------------------------------------

function ExampleGrid() {
  return (
    <div
      className="grid-cols-1 md:grid-cols-3"
      style={{
        display: 'grid',
        gap: SPACE[8],
        width: '100%',
      }}
    >
      {EXAMPLES.map((ex) => (
        <ExampleCard key={ex.title} {...ex} />
      ))}
    </div>
  );
}

function ExampleCard({ title, description, hue }: Example) {
  return (
    <button
      type="button"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE[6],
        padding: SPACE[8],
        borderRadius: RADIUS.lg,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: FONTS.sans,
        textAlign: 'left',
        transition: 'background-color 200ms, border-color 200ms',
      }}
      className="hover:bg-tatva-surface-secondary hover:border-tatva-border-secondary focus-visible:outline-none focus-visible:ring-2"
    >
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: SPACE[28],            // size-tatva-28 = 56px
          height: SPACE[28],
          borderRadius: RADIUS.md,
          background: COLORS.gradient[hue],
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: SPACE[2],
          paddingRight: SPACE[2],
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[2],
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.regular,
            color: COLORS.ink[900],
            lineHeight: LINE_HEIGHT.relaxed,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.regular,
            color: COLORS.ink[600],
            lineHeight: LINE_HEIGHT.relaxed,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
