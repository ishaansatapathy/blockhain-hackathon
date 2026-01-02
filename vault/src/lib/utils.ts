import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createMockHash() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `0x${crypto.randomUUID().replace(/-/g, "")}`;
  }
  const random = Math.random().toString(16).slice(2);
  const timestamp = Date.now().toString(16);
  return `0x${(random + timestamp).padEnd(64, "0").slice(0, 64)}`;
}

export function createDocumentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `doc-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

export async function computeFileHash(file: File) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return createMockHash();
  }
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

export async function hashDataUrl(dataUrl: string) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return createMockHash();
  }
  const parts = dataUrl.split(",");
  const base64 = parts[1] ?? "";
  const binaryString = typeof window !== "undefined" ? window.atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

export function formatFileSize(bytes?: number) {
  if (bytes === undefined || bytes === null) return "";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}