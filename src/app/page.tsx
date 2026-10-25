import { Headline } from "@/components/Headline";
import { TransactionPageClient } from "@/views/transacoes/TransactionPageClient";

export default function TransacoesPage() {
  return (
    <>
      <Headline title="Transações" subTitle="Veja as suas transações" />
      <TransactionPageClient />
    </>
  );
}
