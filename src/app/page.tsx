"use client";
import { Headline } from "@/components/Headline";
import store from "@/store";
import { TransactionPageClient } from "@/views/transacoes/TransactionPageClient";
import { Provider } from "react-redux";

export default function TransacoesPage() {
  return (
    <>
      <Headline title="Transações" subTitle="Veja as suas transações" />
      <Provider store={store}>
        <TransactionPageClient />
      </Provider>
    </>
  );
}
