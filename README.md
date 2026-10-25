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
* **Estado de servidor:** TanStack React Query (transações, resumo, categorias, usuário)
* **Estado de UI:** Redux Toolkit (filtros e modais da tela)
* **Multizone:** `basePath: "/transacoes"` ([next.config.ts](./next.config.ts))

<br>

## Estrutura (Clean Architecture)

Regra de dependência: `presentation → application → domain ← infra`.
O domínio não conhece React, Redux, Next nem `fetch`.

```bash
src/
├── domain/transactions/      #  entidades + regras puras
│   ├── transaction.rules.ts  #   validação, parseAmount, toNewTransaction, toTransactionDraft
│   ├── transaction-filters.ts#   estado dos filtros → query da API
│   ├── attachment.rules.ts   #   tipos/tamanho permitidos do anexo
│   └── transaction.repository.ts  # porta (contrato) de persistência
├── application/transactions/ #  casos de uso: list, summary, save, delete
├── infra/                    # http-client · finance-api · auth-api · repositório HTTP · FileReader
├── di/container.ts           # composition root (casos de uso ↔ infra)
├── lib/queries/              # React Query (estado de servidor)
├── store/                    # Redux (estado de UI): slice transactionsUi, selectors, hooks tipados
├── shared/formatters/        # moeda (apresentação)
├── views/ · components/      #  apresentação
```

### Gerenciamento de estado

| Tipo de estado | Onde | Por quê |
|---|---|---|
| Transações, resumo, categorias, usuário | **React Query** | vem da API: precisa de cache, paginação, invalidação |
| Filtros (descrição, tipo, período) | **Redux** `transactionsUi.filters` | compartilhado entre filtros, lista e resumo; serializável |
| Modais (criar/editar/excluir) | **Redux** `transactionsUi.editor/deletion` | aberto por colunas da tabela e pelos filtros |
| Campos do formulário, erro, loading | `useState` / mutation | local ao modal |

> Categorias saíram do Redux: eram uma cópia do que o React Query já tinha em cache
> (sincronizada via `useEffect` + `dispatch`). O store é criado por `makeStore()`
> dentro do `StoreProvider` (um store por árvore, sem vazar estado no SSR).

Testes unitários (domínio, casos de uso e Redux): `npm run test:unit`.

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
