import { useState } from 'react';
import { Code2, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import Switch from '../../components/ui/Switch';
import FloatingActions, {
  FloatingIconButton,
} from '../../components/ui/FloatingActions';
import TextareaCard from '../../components/ui/TextareaCard';
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

const SOURCE = `Hey, talk like you normally do.

Kal office mein 3 meetings thi.
2 chai breaks.
1 deadline miss hui.
Aur haan — salary ₹45,000 credit ho gayi 😌

Write it in Hindi, English, Tamil, Telugu — or mix it freely.
See how:
"₹45,000"
becomes
"४५,००० रुपये"`;

const TRANSLATED = `अरे, जैसे बोलते हो वैसे ही लिखो।

कल office में 3 meetings थीं।
2 chai breaks।
1 deadline miss हो गई।
और हाँ — salary ₹45,000 credit हो गई 😌

हिंदी, इंग्लिश, तमिल, तेलुगु — या जैसा रोज़ बोलते हो वैसा mix करो।
देखो:
"₹45,000"
कैसे बनता है
"४५,००० रुपये"`;

const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Marathi', 'Odia', 'Punjabi', 'Tamil', 'Telugu'];
const TONES = ['Formal', 'Modern Colloquial', 'Classical Colloquial', 'Code Mixed'];
const NUMERAL_FORMATS = ['Native', 'International'];
const GENDERS = ['Male', 'Female'];

export default function TranslatePage() {
  const [source, setSource] = useState(SOURCE);
  const [translated] = useState(TRANSLATED);
  const [smart, setSmart] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [tone, setTone] = useState('Formal');
  const [numerals, setNumerals] = useState('Native');
  const [gender, setGender] = useState('Male');

  return (
    <Layout>
      <PageHeader />

      <div
        className="flex-col md:flex-row"
        style={{ display: 'flex', flex: 1, minHeight: 0 }}
      >
        <SourceColumn
          value={source}
          onChange={setSource}
          language={sourceLang}
          onLanguageChange={setSourceLang}
        />
        <TargetColumn
          value={translated}
          smart={smart}
          onSmartChange={setSmart}
          language={targetLang}
          onLanguageChange={setTargetLang}
          tone={tone}
          onToneChange={setTone}
          numerals={numerals}
          onNumeralsChange={setNumerals}
          gender={gender}
          onGenderChange={setGender}
        />
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
          Text Translate
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
          Mayura — translations that feel native
        </p>
      </div>

      <Button
        variant="outlined"
        size="sm"
        leftIcon={
          <Code2 size={ICON.button} strokeWidth={ICON.strokeWidth} aria-hidden />
        }
      >
        Get Code
      </Button>
    </header>
  );
}

// ---- Language avatar (20px gradient circle) -----------------------------

function LanguageAvatar({ hue }: { hue: 'green' | 'indigo' | 'coral' | 'red' }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: SPACE[10],   // 20px — size-tatva-10
        height: SPACE[10],
        borderRadius: '50%',
        background: COLORS.gradient[hue],
        flexShrink: 0,
      }}
    />
  );
}

// ---- Source (left) column ------------------------------------------------

function SourceColumn({
  value,
  onChange,
  language,
  onLanguageChange,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
}) {
  return (
    <div
      className="w-full md:w-1/2"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
        paddingLeft: SPACE[12],
        paddingRight: SPACE[6],
        paddingTop: SPACE[12],
        paddingBottom: SPACE[12],
      }}
    >
      <div style={{ marginBottom: SPACE[10] }}>
        <Dropdown
          value={language}
          options={LANGUAGES}
          onChange={onLanguageChange}
          size="md"
          leading={<LanguageAvatar hue="green" />}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <TextareaCard
          value={value}
          onChange={onChange}
          placeholder="Start typing to translate..."
          maxLength={1000}
          height="100%"
          rightControls={<ClearButton />}
        />
      </div>
    </div>
  );
}

function ClearButton() {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: SPACE[18],
        paddingLeft: SPACE[8],
        paddingRight: SPACE[8],
        borderRadius: RADIUS.pill,
        border: 'none',
        backgroundColor: COLORS.cream[300],
        color: COLORS.ink[900],
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.regular,
        cursor: 'pointer',
      }}
      className="hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
    >
      Clear
    </button>
  );
}

// ---- Target (right) column -----------------------------------------------

function TargetColumn({
  value,
  smart,
  onSmartChange,
  language,
  onLanguageChange,
  tone,
  onToneChange,
  numerals,
  onNumeralsChange,
  gender,
  onGenderChange,
}: {
  value: string;
  smart: boolean;
  onSmartChange: (next: boolean) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  tone: string;
  onToneChange: (v: string) => void;
  numerals: string;
  onNumeralsChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
}) {
  return (
    <div
      className="w-full md:w-1/2"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingLeft: SPACE[6],
        paddingRight: SPACE[12],
        paddingTop: SPACE[12],
        paddingBottom: SPACE[12],
      }}
    >
      <div style={{ marginBottom: SPACE[10] }}>
        <Dropdown
          value={language}
          options={LANGUAGES}
          onChange={onLanguageChange}
          size="md"
          leading={<LanguageAvatar hue="indigo" />}
        />
      </div>

      <div
        className="group"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}
      >
        <TextareaCard
          value={value}
          readOnly
          placeholder="Translation appears here as you type..."
          height="100%"
          leftControls={
            <ToneControls
              tone={tone}
              onToneChange={onToneChange}
              numerals={numerals}
              onNumeralsChange={onNumeralsChange}
              gender={gender}
              onGenderChange={onGenderChange}
            />
          }
        />
        <FloatingActions>
          <FloatingIconButton ariaLabel="Helpful">
            <ThumbsUp size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
          </FloatingIconButton>
          <FloatingIconButton ariaLabel="Not helpful">
            <ThumbsDown size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
          </FloatingIconButton>
          <FloatingIconButton ariaLabel="Copy translation">
            <Copy size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
          </FloatingIconButton>
        </FloatingActions>

        {/* Smart toggle sits next to the tone controls in Sarvam — we render it
            inside the toolbar below for consistency. Wire through props if needed. */}
        <SmartToggle checked={smart} onChange={onSmartChange} />
      </div>
    </div>
  );
}

function ToneControls({
  tone,
  onToneChange,
  numerals,
  onNumeralsChange,
  gender,
  onGenderChange,
}: {
  tone: string;
  onToneChange: (v: string) => void;
  numerals: string;
  onNumeralsChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
}) {
  return (
    <>
      <div style={{ minWidth: 110 }}>
        <Dropdown value={tone} options={TONES} onChange={onToneChange} size="sm" />
      </div>
      <div style={{ minWidth: 110 }}>
        <Dropdown
          value={numerals}
          options={NUMERAL_FORMATS}
          onChange={onNumeralsChange}
          size="sm"
        />
      </div>
      <div style={{ minWidth: 90 }}>
        <Dropdown value={gender} options={GENDERS} onChange={onGenderChange} size="sm" />
      </div>
    </>
  );
}

function SmartToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: SPACE[12],
        right: SPACE[12],
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[2],
        zIndex: 11,
      }}
      className="hidden md:flex"
    >
      <Switch checked={checked} onChange={onChange} ariaLabel="Smart translation" />
      <label
        style={{
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.regular,
          color: COLORS.ink[600],
          lineHeight: LINE_HEIGHT.tight,
        }}
      >
        Smart
      </label>
    </div>
  );
}
