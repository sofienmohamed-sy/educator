import { getAuth } from "firebase-admin/auth";
import type { Request } from "firebase-functions/v2/https";
import type { Response } from "express";

export async function verifyFirebaseToken(req: Request): Promise<string> {
  const authHeader = req.headers.authorization ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
  return decoded.uid;
}

export function startSSE(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

export function sendSSE(res: Response, data: unknown): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function endSSE(res: Response): void {
  res.write("data: [DONE]\n\n");
  res.end();
}
