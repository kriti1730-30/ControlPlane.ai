import { useState } from 'react';
import {
  Code2,
  MessageSquare,
  BookOpen,
  Tv,
  Headphones,
  Newspaper,
  Info,
  Turtle,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import Slider from '../../components/ui/Slider';
import TabStrip, { type Tab } from '../components/TabStrip';
import { TAB_ICON_PROPS } from '../components/tabIcon';
import VoiceCard, { type Voice } from '../components/VoiceCard';
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

// ===========================================================================
// Static fixture data — replace with real Sarvam responses / inference logic
// later. The visual scaffolding stays.
// ===========================================================================

const TABS: Tab[] = [
  { id: 'conversational', label: 'Conversational', icon: <MessageSquare {...TAB_ICON_PROPS} /> },
  { id: 'audiobooks', label: 'Audiobooks', icon: <BookOpen {...TAB_ICON_PROPS} /> },
  { id: 'entertainment', label: 'Entertainment', icon: <Tv {...TAB_ICON_PROPS} /> },
  { id: 'sales', label: 'Sales', icon: <Headphones {...TAB_ICON_PROPS} /> },
  { id: 'news', label: 'News', icon: <Newspaper {...TAB_ICON_PROPS} /> },
];

const VOICES: Voice[] = [
  {
    name: 'Shubh',
    gender: 'Male',
    starred: true,
    description: 'Friendly default voice for IVR and support',
    gradient: 'green',
  },
  {
    name: 'Priya',
    gender: 'Female',
    starred: true,
    description: 'Upbeat voice with personality',
    gradient: 'indigo',
  },
  {
    name: 'Suhani',
    gender: 'Female',
    starred: true,
    description: 'Pleasant and soothing voice',
    gradient: 'indigo',
  },
  {
    name: 'Ashutosh',
    gender: 'Male',
    starred: true,
    description: 'Traditional Hindi narration style',
    gradient: 'coral',
  },
  {
    name: 'Ritu',
    gender: 'Female',
    description: 'Soft, approachable voice for customer interactions',
    gradient: 'coral',
  },
  {
    name: 'Amit',
    gender: 'Male',
    description: 'Deep authoritative voice for serious content',
    gradient: 'red',
  },
];

const SAMPLE_HINDI = `नमस्ते! Sarvam AI में आपका स्वागत है।

हम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।

आप अपना text type कर सकते हैं या different voices को try करने के लिए किसी भी voice card पर play button पर click कर सकते हैं। तो चलिए, अपनी भाषा में AI की ताकत experience करें!`;

// ===========================================================================
// Page
// ===========================================================================

const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Marathi', 'Odia', 'Punjabi', 'Tamil', 'Telugu'];

const AUDIO_QUALITIES = [
  { value: 'Standard (22.05 kHz)', description: 'Balanced quality with low-latency streaming' },
  { value: 'Telephony (8 kHz)', description: 'Optimized for phone calls and IVR systems' },
  { value: 'High Quality (48 kHz)', description: 'Best clarity, non-streaming (bulbul:v3 only)' },
];

const DICTIONARIES = ['No dictionary', 'Banking terms', 'Healthcare terms', 'Tech glossary'];

export default function Playground() {
  const [text, setText] = useState(SAMPLE_HINDI);
  const [activeTab, setActiveTab] = useState('conversational');
  const [language, setLanguage] = useState('Hindi');
  const [audioQuality, setAudioQuality] = useState('Standard (22.05 kHz)');
  const [dictionary, setDictionary] = useState('');

  return (
    <Layout>
      <PageHeader />

      <div
        className="flex-col md:flex-row"
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        <LeftColumn
          text={text}
          onTextChange={setText}
          language={language}
          onLanguageChange={setLanguage}
          audioQuality={audioQuality}
          onAudioQualityChange={setAudioQuality}
          dictionary={dictionary}
          onDictionaryChange={setDictionary}
        />
        <RightColumn activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Layout>
  );
}

// ---- Header --------------------------------------------------------------

function PageHeader() {
  return (
    <header
      style={{
        // dashboard.sarvam.ai header: px-tatva-12 py-tatva-8 border-b sticky
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
            fontSize: FONT_SIZE.xl,           // heading-md = 20px
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.ink[900],
            letterSpacing: LETTER_SPACING.tight,
            lineHeight: LINE_HEIGHT.tight,
          }}
        >
          Text to Speech
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
          Convert text to natural speech in Indian languages
        </p>
      </div>

      <Button variant="outlined" size="sm" leftIcon={<CodeBracketsIcon />}>
        Get Code
      </Button>
    </header>
  );
}

function CodeBracketsIcon() {
  return (
    <Code2
      size={ICON.button}
      strokeWidth={ICON.strokeWidth}
      aria-hidden
    />
  );
}

// ---- Left column ---------------------------------------------------------

function LeftColumn({
  text,
  onTextChange,
  language,
  onLanguageChange,
  audioQuality,
  onAudioQualityChange,
  dictionary,
  onDictionaryChange,
}: {
  text: string;
  onTextChange: (val: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  audioQuality: string;
  onAudioQualityChange: (v: string) => void;
  dictionary: string;
  onDictionaryChange: (v: string) => void;
}) {
  return (
    <div
      className="w-full md:w-1/2 scrollbar-hide"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.surface,
        borderRight: `1px solid ${COLORS.border.DEFAULT}`,
        overflowY: 'auto',
        padding: SPACE[12],
      }}
    >
      <TextareaCard
        value={text}
        onChange={onTextChange}
        placeholder="Type or paste text here to convert to speech..."
        leftControls={
          <div style={{ width: 135 }}>
            <Dropdown
              value={language}
              options={LANGUAGES}
              onChange={onLanguageChange}
              size="sm"
            />
          </div>
        }
        rightControls={
          <Button variant="ghost" size="sm" style={{ backgroundColor: COLORS.cream[200] }}>
            Clear
          </Button>
        }
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[12],
          paddingTop: SPACE[12],
          paddingBottom: SPACE[6],
        }}
      >
        <AudioQualityField value={audioQuality} onChange={onAudioQualityChange} />
        <SpeedField />
        <PronunciationDictionaryField value={dictionary} onChange={onDictionaryChange} />
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
      <label
        style={{
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.regular,
          color: COLORS.ink[600],
          lineHeight: LINE_HEIGHT.tight,
        }}
      >
        {children}
      </label>
      {hint && (
        <Info
          size={14}
          strokeWidth={ICON.strokeWidth}
          aria-hidden
          style={{ color: COLORS.ink[500], cursor: 'help' }}
        />
      )}
    </div>
  );
}

function AudioQualityField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
      <FieldLabel hint>Audio Quality</FieldLabel>
      <Dropdown value={value} options={AUDIO_QUALITIES} onChange={onChange} size="md" />
    </div>
  );
}

function SpeedField() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: SPACE[4] }}>
      <div style={{ flex: 1 }}>
        <span style={{ display: 'inline-flex', marginBottom: SPACE[4], paddingLeft: SPACE[2] }}>
          <FieldLabel>Speed</FieldLabel>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[6] }}>
          <Turtle
            size={ICON.feature}
            strokeWidth={ICON.strokeWidth}
            aria-hidden
            style={{ color: COLORS.ink[600], marginBottom: SPACE[2], flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Slider value={0.4} ariaLabel="Speech speed" />
          </div>
        </div>
      </div>
      <div
        style={{
          paddingLeft: SPACE[4],
          paddingRight: SPACE[4],
          paddingTop: SPACE[1],
          paddingBottom: SPACE[1],
          borderRadius: RADIUS.pill,
          border: `1px solid ${COLORS.border.DEFAULT}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.sm,
            color: COLORS.ink[600],
            lineHeight: LINE_HEIGHT.relaxed,
          }}
        >
          1.10x
        </p>
      </div>
    </div>
  );
}

function PronunciationDictionaryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
      <FieldLabel hint>Pronunciation Dictionary</FieldLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
        <div style={{ flex: 1 }}>
          <Dropdown
            value={value || 'Select dictionary'}
            options={DICTIONARIES}
            onChange={onChange}
            placeholder={!value}
            size="sm"
          />
        </div>
        <Button variant="outlined" size="sm">
          Manage
        </Button>
      </div>
    </div>
  );
}

// ---- Right column --------------------------------------------------------

function RightColumn({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div
      className="w-full md:w-1/2"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <TabStrip tabs={TABS} activeId={activeTab} onSelect={onTabChange} />
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingLeft: SPACE[10],
          paddingRight: SPACE[10],
          paddingBottom: SPACE[12],
        }}
      >
        {VOICES.map((voice) => (
          <VoiceCard key={voice.name} voice={voice} />
        ))}
      </div>
    </div>
  );
}
