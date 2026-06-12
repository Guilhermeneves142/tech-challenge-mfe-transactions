const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateAttachmentFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Formato não suportado. Use PDF, PNG ou JPG.";
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return "O arquivo deve ter no máximo 2 MB.";
  }
  return null;
}

export function downloadAttachment(
  attachment: string,
  attachmentName?: string,
) {
  const link = document.createElement("a");
  link.href = attachment;
  link.download = attachmentName || "anexo";
  link.click();
}
