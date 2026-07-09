# mfe-transactions — FinanceApp

Microfrontend de **transações** do FinanceApp (Next.js Multizones). Serve a listagem
de transações com **filtros**, **scroll infinito**, **resumo** (receitas/despesas/saldo)
e os **modais** de criar, editar e excluir, tudo sob o `basePath` `/transacoes`.

> Faz parte da arquitetura de microfrontends do
> [tech-challenge](https://github.com/Guilhermeneves142/tech-challenge) (host).
> O host orquestra este MFE — normalmente você sobe tudo a partir dele (`npm run dev`).

<br>

## Tecnologias
* **Next.js 16 / React 19 / TypeScript**
* **Tailwind** + Design System `@vandrei/finance-ui`
* **Tabela:** `@tanstack/react-table` (via `DataTable` da lib)
* **Estado:** Redux Toolkit (categorias)
* **Multizone:** `basePath: "/transacoes"` ([next.config.ts](./next.config.ts))

<br>

## Estrutura

A página de transações é **componentizada**: o orquestrador é enxuto e cada
responsabilidade (filtros, resumo, colunas da tabela e busca de dados) vive em
seu próprio arquivo.

```bash
src/
├── views/transacoes/
│   ├── TransactionPageClient.tsx     # orquestrador (estado de UI + modais)
│   ├── hooks/
│   │   └── useTransactionList.ts     # busca + scroll infinito + refetch
│   └── components/
│       ├── TransactionFilters.tsx    # período, busca, tipo
│       ├── TransactionSummary.tsx    # cards de receitas/despesas/saldo
│       └── transactionColumns.tsx    # definição das colunas da tabela
├── components/
│   ├── Sidebar.tsx
│   └── transactions/                 # TransactionModal · DeleteTransactionModal · hook de form
├── features/categories/              # slice Redux
├── store/                            # configuração do store
└── lib/                              # api · auth-storage · categoryIcons · file
```

<br>

## ▶️ Como rodar

Em desenvolvimento, suba o projeto **a partir do host** (ele orquestra os MFEs):

```bash
# na pasta do host
npm run dev          # host :3000 + mfe-auth :4001 + mfe-transactions :4002
```

Para rodar **somente** este MFE de forma isolada:

```bash
npm install
npm run dev          # http://localhost:4002/transacoes
```

<br>

## ♿ Acessibilidade

A tela de transações segue boas práticas de a11y para teclado e leitores de tela:

* **HTML semântico:** navegação em `nav` + lista (`ul`/`li`), `header`, `section`;
  o item da rota atual no menu usa `aria-current="page"`.
* **Filtros:** todo controle tem `Label` associado; os botões de período expõem
  `aria-label` ("Selecionar período", "Limpar período").
* **Ações da tabela:** os botões só com ícone (baixar/editar/excluir) têm
  `aria-label` descritivo incluindo a descrição da transação; ícones decorativos
  usam `aria-hidden`.
* **Carregamento:** o estado inicial usa `aria-busy` + texto `sr-only`; o
  carregamento de mais itens (scroll infinito) é anunciado com `aria-live="polite"`.
* **Menu mobile:** o botão de abrir/fechar expõe `aria-expanded` e `aria-controls`.

> Os componentes base (`DataTable`, `Input`, `Button`, etc.) vêm da lib
> `@vandrei/finance-ui`, que fornece foco visível e contraste adequado.
