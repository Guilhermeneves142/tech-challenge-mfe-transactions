# Refatoração do mfe-transactions

Resumo do que mudou no MFE de transações para atender a dois requisitos:
**Clean Architecture** e **State Management avançado**.

---

## 1. Clean Architecture

Antes, regras de negócio ficavam misturadas nos componentes e hooks
(ex.: `useTransactionForm` validava, formatava, montava o payload e chamava a API).
Agora o código está separado em camadas:

```
src/
├── domain/          # Regras de negócio puras (sem React, Redux ou fetch)
├── application/     # Casos de uso
├── infra/           # Acesso à API e ao navegador
├── di/container.ts  # Liga os casos de uso à infra
├── lib/queries/     # React Query
├── store/           # Redux
└── views/ · components/   # Telas e componentes
```

**Regra:** as camadas de fora dependem das de dentro, nunca o contrário.
O domínio não sabe que existe React, Redux ou API.

| Camada | O que tem |
|---|---|
| `domain` | Validação da transação, conversão do valor (`1.234,56`), despesa negativa, regras do anexo (PDF/PNG/JPG até 2 MB), conversão dos filtros em query da API |
| `application` | `listTransactions`, `getTransactionsSummary`, `saveTransaction`, `deleteTransaction` |
| `infra` | Cliente HTTP, endpoints da API, repositório, leitura/download de arquivo |
| apresentação | Componentes e hooks só cuidam de tela: estado do formulário, loading, erro |

---

## 2. State Management

Cada tipo de estado ficou na ferramenta certa:

| Estado | Onde fica | Por quê |
|---|---|---|
| Transações, resumo, categorias, usuário | **React Query** | Vêm da API: precisam de cache, paginação e atualização |
| Filtros (descrição, tipo, período) | **Redux** | Usados por filtros, lista e resumo ao mesmo tempo |
| Modais (criar, editar, excluir) | **Redux** | Abertos a partir de lugares diferentes da tela |
| Campos do formulário | `useState` | Só o modal usa |

**Principais mudanças:**

- **Categorias saíram do Redux.** Eram uma cópia do que o React Query já tinha. Agora são lidas direto do cache.
- **Novo slice `transactionsUi`** com filtros e modais, selectors memoizados (`createSelector`) e hooks tipados (`useAppSelector`, `useAppDispatch`).
- **`TransactionFilters` conectado ao store**, sem receber várias props.
- **`TransactionPageClient`** deixou de ter 8 `useState`.
- **Store criado por `makeStore()`** dentro de um `StoreProvider`, em vez de um singleton (padrão recomendado no Next App Router).

---

## 3. Bugs corrigidos

- **Nome do usuário na sidebar não aparecia:** era lido do `localStorage`, que não é mais usado. Agora vem de `/api/auth/me`.
- **Logout não encerrava a sessão:** agora chama `/api/auth/logout`.
- **Valor com milhar** (`1.234,56`) era lido como `1.234`. Agora converte certo.

---

## 4. Testes

Foram criados testes unitários para domínio, casos de uso e Redux.

```bash
npm install
npm run test:unit
```
