# ADR 008 (учебный): UI из design-system, не форк header

**Статус:** принято  
**Дата:** 2026-08-21

## Контекст

Хочется сверстать свой header и кнопки в React. Header — SSOT design-system (`vendor/`). Копия разъедется с vanilla/Vue близнецами и сломает Selenide `data-testid`.

## Решение

1. Компоненты — `@zero-design-system/react` (alias на `vendor/frontend-react-ui`). Header — `<AppHeader>`, не своя вёрстка.
2. `vendor/` не править руками; refresh — `bash frontend/scripts/sync-react-ui.sh` (из monorepo).
3. Контракт автотестов UI — стабильные `data-testid` + строки из `lib/messages.ts`.
4. HTTP с экрана — клиент в `lib/`; Save = PUT, если RAG `crud-http` / ADR фичи.

## Последствия

- Не копировать `header.js` / шаблоны header в `src/`.
- Смена testid без правки PO в `tests-java-…/pages/` — ломает e2e; PO — skill `qa-write-test`, не этот.
- CSS продукта — `css/` + запись в `src/styles.ts`, не side-import в компонентах DS.

## RAG

`fe-react-layers` · `fe-ds-contract` · `crud-http`
