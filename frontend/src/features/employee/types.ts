export type StageStatus =
  | 'pending'
  | 'running'
  | 'passed'
  | 'fixed'
  | 'ask'
  | 'blocked';

export type ControlDecision =
  | 'ALLOW'
  | 'FIX'
  | 'ASK'
  | 'BLOCK'
  | 'ESCALATE';

export type Stage = {
  number: number;
  title: string;
  shortTitle: string;
  icon: string;
};

export type CheckStatus =
  | 'passed'
  | 'failed'
  | 'fixed'
  | 'skipped'
  | 'running';

export type ControlCheck = {
  id: string;
  name: string;
  status: CheckStatus;
  detail?: string;
};

export type ControlEvent = {
  id: string;
  stage: number;
  title: string;
  description: string;
  status: StageStatus;
  decision?: ControlDecision;
  metric?: string;
  action?: string;

  /**
   * Individual controls executed during this stage.
   * The backend can populate this dynamically.
   */
  checks?: ControlCheck[];
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type HistoricalRun = {
  id: string;
  title: string;
  preview: string;
  model: string;
  timestamp: string;
  messages: ChatMessage[];
  events: ControlEvent[];
};