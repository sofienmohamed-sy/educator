import { auth } from "../firebase";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "";
const useEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS !== "false";

function getFunctionUrl(name: string): string {
  if (useEmulators) {
    return `http://localhost:5001/${projectId}/us-central1/${name}`;
  }
  return `https://us-central1-${projectId}.cloudfunctions.net/${name}`;
}

export type StreamEvent<T> =
  | { type: "delta"; text: string }
  | ({ type: "result"; id: string } & T)
  | { type: "error"; message: string };

export async function* streamGenerate<T>(
  functionName: string,
  body: unknown,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent<T>> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const response = await fetch(getFunctionUrl(functionName), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = (await response.json()) as { error?: string };
      message = err.error ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        yield JSON.parse(data) as StreamEvent<T>;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
