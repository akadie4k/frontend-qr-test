/**
 * NekoQR API client — matches the backend's OpenAPI spec (/v3/api-docs).
 *
 * Requests go to the same origin (`/api/v1/...`). `next.config.ts` rewrites
 * them to the Spring backend (NEKOQR_API_URL, default http://localhost:8080),
 * so the browser never hits CORS. Set NEXT_PUBLIC_API_BASE only if you want
 * the browser to call the backend directly instead.
 *
 * Backend error shape:
 *   { status, error, message, path, timestamp, fieldErrors?: { field: msg } }
 * Dates are LocalDateTime (no timezone), e.g. "2026-11-06T23:24:43.053475".
 */

export interface LinkResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateLinkRequest {
  /** must match ^https?://.+ , max 2048 chars */
  originalUrl: string;
  /** must match ^[A-Za-z0-9_-]{3,16}$ */
  customAlias?: string;
  /** local date-time without zone, e.g. 2026-11-08T21:30:00 */
  expiresAt?: string;
}

export type FieldErrors = Partial<Record<keyof CreateLinkRequest | string, string>>;

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;
  /** original backend text (English), for debugging */
  serverMessage?: string;
  constructor(status: number, message: string, fieldErrors: FieldErrors = {}, serverMessage?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.serverMessage = serverMessage;
  }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

const STATUS_MESSAGES: Record<number, string> = {
  400: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง",
  404: "ไม่พบลิงก์ที่ต้องการ",
  409: "ชื่อลิงก์นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น",
  410: "ลิงก์นี้หมดอายุแล้ว",
  429: "มีการส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง",
};

/**
 * Backend validation messages are English; show formal Thai per field instead.
 * (The raw server text is kept on ApiError.serverMessage for debugging.)
 */
const FIELD_MESSAGES: Record<string, string> = {
  originalUrl: "รูปแบบลิงก์ไม่ถูกต้อง กรุณาระบุลิงก์ที่ขึ้นต้นด้วย http:// หรือ https://",
  customAlias: "ชื่อลิงก์ต้องมี 3–16 ตัวอักษร และใช้ได้เฉพาะ a–z, A–Z, 0–9, - และ _",
  expiresAt: "วันหมดอายุไม่ถูกต้อง กรุณาเลือกวันและเวลาในอนาคต",
};

async function readError(res: Response): Promise<ApiError> {
  let serverMessage: string | undefined;
  const fieldErrors: FieldErrors = {};
  try {
    const body = JSON.parse(await res.text()) as Record<string, unknown>;
    if (body.fieldErrors && typeof body.fieldErrors === "object") {
      for (const [field, msg] of Object.entries(body.fieldErrors as Record<string, string>)) {
        fieldErrors[field] = FIELD_MESSAGES[field] ?? msg;
      }
    }
    if (typeof body.message === "string") serverMessage = body.message;
  } catch {
    // not JSON (e.g. proxy error page) — fall through to status messages
  }

  const firstField = Object.values(fieldErrors).find(Boolean);
  const message =
    firstField ??
    STATUS_MESSAGES[res.status] ??
    (res.status >= 500
      ? "ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งในภายหลัง"
      : `เกิดข้อผิดพลาด (รหัส ${res.status}) กรุณาลองใหม่อีกครั้ง`);
  return new ApiError(res.status, message, fieldErrors, serverMessage);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง");
  }
  if (!res.ok) throw await readError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function createLink(body: CreateLinkRequest): Promise<LinkResponse> {
  return request<LinkResponse>("/api/v1/links", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listLinks(page = 0, size = 20): Promise<PageResponse<LinkResponse>> {
  const qs = new URLSearchParams({ page: String(page), size: String(size) });
  return request<PageResponse<LinkResponse>>(`/api/v1/links?${qs}`);
}

export function getLink(shortCode: string): Promise<LinkResponse> {
  return request<LinkResponse>(`/api/v1/links/${encodeURIComponent(shortCode)}`);
}

/** Marks a link inactive (backend: DELETE /api/v1/links/{shortCode}). */
export function deactivateLink(shortCode: string): Promise<void> {
  return request<void>(`/api/v1/links/${encodeURIComponent(shortCode)}`, { method: "DELETE" });
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
