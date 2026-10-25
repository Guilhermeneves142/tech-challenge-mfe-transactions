"use client";

// Hook de APRESENTAÇÃO: estado do formulário + ponte com o caso de uso.
// Validação, conversão de valor, regras do anexo e montagem do payload → @/domain.
import { useState } from "react";
import {
  EMPTY_TRANSACTION_DRAFT,
  TransactionValidationError,
  validateAttachment,
  type Transaction,
  type TransactionDraft,
  type TransactionType,
} from "@/domain";
import { fileToDataUrl } from "@/infra/browser/file";
import { useSaveTransaction } from "@/lib/queries/transactions";
import type { TransactionModalMode } from "../types";

function buildInitialState(initialData?: Partial<TransactionDraft>): TransactionDraft {
  return {
    ...EMPTY_TRANSACTION_DRAFT,
    ...initialData,
    attachmentName:
      initialData?.attachmentName ??
      (initialData?.attachment ? "Anexo existente" : undefined),
  };
}

interface UseTransactionFormOptions {
  mode?: TransactionModalMode;
  transactionId?: number;
  initialData?: Partial<TransactionDraft>;
  onSuccess?: (transaction: Transaction) => void;
  onClose: () => void;
}

const SAVE_ERROR = "Não foi possível salvar a transação. Tente novamente.";

export function useTransactionForm({
  mode = "create",
  transactionId,
  initialData,
  onSuccess,
  onClose,
}: UseTransactionFormOptions) {
  const [form, setForm] = useState<TransactionDraft>(() => buildInitialState(initialData));
  const [error, setError] = useState<string | null>(null);
  const saveTransaction = useSaveTransaction();

  function setField<K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setType(type: TransactionType) {
    setField("type", type);
  }

  function reset() {
    setForm(buildInitialState(initialData));
    setError(null);
  }

  async function setAttachmentFile(file: File | null) {
    if (!file) {
      setForm((prev) => ({ ...prev, attachment: "", attachmentName: undefined }));
      return;
    }

    const validationError = validateAttachment(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, attachment: dataUrl, attachmentName: file.name }));
    } catch {
      setError("Não foi possível ler o arquivo. Tente novamente.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const result = await saveTransaction.mutateAsync({
        draft: form,
        id: mode === "edit" ? transactionId : undefined,
      });
      onSuccess?.(result);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof TransactionValidationError ? err.message : SAVE_ERROR);
    }
  }

  function handleCancel() {
    reset();
    onClose();
  }

  return {
    form,
    loading: saveTransaction.isPending,
    error,
    setField,
    setType,
    setAttachmentFile,
    handleSubmit,
    handleCancel,
    reset,
  };
}
