import type { Document } from "@/types";

const STORAGE_KEY = "trustvault-documents";
const FACE_HASH_KEY = "trustvault-face-hashes";
const FLAGGED_SUBMISSIONS_KEY = "trustvault-flagged-submissions";

const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function loadVaultDocuments(): Document[] {
  if (!isBrowser) {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Document[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load vault documents from storage", error);
    return [];
  }
}

export function saveVaultDocuments(documents: Document[]) {
  if (!isBrowser) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  } catch (error) {
    console.warn("Failed to persist vault documents", error);
  }
}

export function addVaultDocument(document: Document) {
  if (!isBrowser) return;
  const documents = loadVaultDocuments();
  const existingIndex = documents.findIndex((item) => item.id === document.id);
  if (existingIndex >= 0) {
    documents[existingIndex] = document;
  } else {
    documents.push(document);
  }
  saveVaultDocuments(documents);
}

export function loadFaceHashes(): string[] {
  if (!isBrowser) return [];
  try {
    const stored = window.localStorage.getItem(FACE_HASH_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load face hashes", error);
    return [];
  }
}

export function addFaceHash(hash: string) {
  if (!isBrowser) return;
  try {
    const hashes = new Set(loadFaceHashes());
    hashes.add(hash);
    window.localStorage.setItem(FACE_HASH_KEY, JSON.stringify(Array.from(hashes)));
  } catch (error) {
    console.warn("Failed to store face hash", error);
  }
}

export function isFaceHashUsed(hash: string): boolean {
  return loadFaceHashes().includes(hash);
}

export function loadFlaggedSubmissions(): Document[] {
  if (!isBrowser) return [];
  try {
    const stored = window.localStorage.getItem(FLAGGED_SUBMISSIONS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Document[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load flagged submissions", error);
    return [];
  }
}

export function saveFlaggedSubmissions(docs: Document[]) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(FLAGGED_SUBMISSIONS_KEY, JSON.stringify(docs));
  } catch (error) {
    console.warn("Failed to save flagged submissions", error);
  }
}

export function addFlaggedSubmission(doc: Document) {
  if (!isBrowser) return;
  try {
    const all = loadFlaggedSubmissions();
    const existingIndex = all.findIndex((d) => d.id === doc.id);
    if (existingIndex >= 0) {
      all[existingIndex] = doc;
    } else {
      all.unshift(doc);
    }
    saveFlaggedSubmissions(all);
  } catch (error) {
    console.warn("Failed to add flagged submission", error);
  }
}

