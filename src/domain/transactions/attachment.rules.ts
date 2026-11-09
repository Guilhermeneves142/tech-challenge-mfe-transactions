// Regras do anexo da transação. Recebe só {type, size} → não depende do File do browser.

export const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

export function validateAttachment(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)) {
    return "Formato não suportado. Use PDF, PNG ou JPG.";
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return "O arquivo deve ter no máximo 2 MB.";
  }
  return null;
}
