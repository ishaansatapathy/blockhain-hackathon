/**
 * Utilities to verify a captured face image against backend or local fallback.
 */
import { addFaceHash, isFaceHashUsed } from "@/lib/storage";
import { hashDataUrl } from "@/lib/utils";

const FACE_VERIFIER_URL =
  import.meta.env.VITE_FACE_VERIFIER_URL?.replace(/\/$/, "") || "http://localhost:5001";

type VerifyResponse = {
  status: "verified" | "duplicate" | "error";
  faceHash?: string;
  from?: "backend" | "fallback";
  message?: string;
};

export async function verifyFaceImage(dataUrl: string): Promise<VerifyResponse> {
  const payload = JSON.stringify({ image: dataUrl });

  try {
    const response = await fetch(`${FACE_VERIFIER_URL}/api/verify-face`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Face service error: ${response.status}`);
    }

    const result = (await response.json()) as { result: string; faceHash?: string; message?: string };

    if (result.result === "duplicate") {
      return { status: "duplicate", faceHash: result.faceHash, from: "backend", message: result.message };
    }

    if (result.result === "verified") {
      if (result.faceHash) {
        addFaceHash(result.faceHash);
      }
      return { status: "verified", faceHash: result.faceHash, from: "backend", message: result.message };
    }

    return { status: "error", from: "backend", message: result.message ?? "Unknown face verification result" };
  } catch (error) {
    const computedHash = await hashDataUrl(dataUrl);
    if (isFaceHashUsed(computedHash)) {
      return {
        status: "duplicate",
        faceHash: computedHash,
        from: "fallback",
        message: "Duplicate face detected via local fallback",
      };
    }
    addFaceHash(computedHash);
    return {
      status: "verified",
      faceHash: computedHash,
      from: "fallback",
      message: "Face verified via local fallback cache",
    };
  }
}
