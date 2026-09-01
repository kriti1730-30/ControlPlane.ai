import type { ControlEvent } from './types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export type CreateRunResponse = {
  run_id: string;
};

export type RunRecord = {
  run_id: string;
  state: 'running' | 'waiting' | 'completed' | 'blocked';
  final_output: string | null;
  pending_intervention: ControlEvent | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `Backend request failed with ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function createRun(
  message: string,
  model: string,
): Promise<CreateRunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      model,
    }),
  });

  return parseResponse<CreateRunResponse>(response);
}

export async function getRun(runId: string): Promise<RunRecord> {
  const response = await fetch(
    `${API_BASE_URL}/v1/runs/${encodeURIComponent(runId)}`,
  );

  return parseResponse<RunRecord>(response);
}

export async function getRunEvents(
  runId: string,
): Promise<ControlEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/v1/runs/${encodeURIComponent(runId)}/events`,
  );

  return parseResponse<ControlEvent[]>(response);
}

export async function intervene(
  runId: string,
  decision: 'approve' | 'deny',
): Promise<{ status: string }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/runs/${encodeURIComponent(runId)}/intervene`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        decision,
      }),
    },
  );

  return parseResponse<{ status: string }>(response);
}

export function connectRunSocket(
  runId: string,
  handlers: {
    onOpen?: () => void;
    onEvent: (event: ControlEvent) => void;
    onError?: () => void;
    onClose?: () => void;
  },
): WebSocket {
  const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws');

  const socket = new WebSocket(
    `${wsBaseUrl}/ws/runs/${encodeURIComponent(runId)}`,
  );

  socket.onopen = () => {
    handlers.onOpen?.();
  };

  socket.onmessage = (message) => {
    try {
      const event = JSON.parse(message.data) as ControlEvent;
      handlers.onEvent(event);
    } catch {
      handlers.onError?.();
    }
  };

  socket.onerror = () => {
    handlers.onError?.();
  };

  socket.onclose = () => {
    handlers.onClose?.();
  };

  return socket;
}