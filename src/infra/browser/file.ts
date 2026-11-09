// Infra · APIs do navegador para arquivos (FileReader, <a download>).
// A regra de validação do anexo mora em @/domain (validateAttachment).

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
