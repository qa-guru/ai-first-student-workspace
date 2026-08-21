---
name: fe-add-ui
description: >-
  Добавить экран или панель в frontend-typescript-react (DS, lib-клиент, data-testid, RTL).
  Use when asked to add a React page, Home panel, API client, or frontend feature in this module.
---

# Добавь UI в React

Фича **продукта** в `frontend-typescript-react/`. Не заменяет `qa-write-test` (Selenide PO — другой task).

RAG (прочитай до кода, 2–4): `fe-react-layers`, `fe-ds-contract`, `crud-http`.  
ADR: `docs/adr/008-frontend-ds-not-fork.md`. Фича-заметка — ещё `docs/adr/006-one-note-not-list.md`.

## When

- «добавь панель», «экран React», «клиент /api/…», «frontend-typescript-react фича»

## Do not

- Форк header / правка `vendor/` (ADR 008)
- `fetch` в JSX в обход `lib/`
- PATCH с UI, если `crud-http` / ADR фичи: Save = PUT
- Менять существующие `data-testid` «заодно»
- Писать Java PO / e2e в этом вызове
- Считать stub `GET 404` покрытием новой панели; понижать пол в `vitest.config.ts`
- Молчать, если у нового UI нет RTL-assert сценария: в ответе **Дыра**
- Commit без OK

## Якоря

| Что | Образец |
|-----|---------|
| страница | `LoginPage` + `lib/auth.ts` + `LOGIN_MESSAGES` |
| панель на Home | `HomePage` note-panel + `lib/note.ts` |
| HTTP helper | `lib/api.ts` (`apiUrl`) |
| RTL | `src/test/pages/HomePage.test.tsx` |
| маршруты | `routes.tsx` |

## Steps

1. Контракт HTTP — `crud-http` и README бэкенда, не догадка. Нет API → STOP, сначала `be-add-resource`.
2. Клиент в `lib/` (`apiUrl`, Bearer как в `note.ts` / `auth.ts`).
3. Строки UI — `lib/messages.ts`.
4. Разметка — компоненты DS (`Panel`, `Button`, `PlaqueField`, …). Header не трогать, кроме пункта nav в `headerConfig.ts`.
5. Стабильные `data-testid`. Новые — записать в таблицу `frontend-typescript-react/README.md`.
6. Новый URL — только `routes.tsx` (+ nav при необходимости).
7. Product CSS — `css/app.css` (или рядом) и import в `src/styles.ts`, не в vendor.
8. RTL: happy-path + stub `fetch` (как `HomePage.test`). На новую панель — assert сценария (save/empty), не только чтобы fetch не упал. `npm test` (и `typecheck` если менял публичные типы).
9. В ответе: экран/панель, testid, команда, exit code. Нет assert на note-panel — **Дыра** (ярус component в `qa-make-full-pyramid`). **STOP.** Selenide не писать. Не коммитить.

## DoD

- [ ] Клиент в `lib/`; DS; строки в `messages.ts`
- [ ] README testid обновлён
- [ ] RTL зелёный; vendor не изменён; пол coverage не снижен
- [ ] Живая дыра (note-panel без сценария) названа, не закрыта чужим ярусом
- [ ] Нет кода в `tests-java-…`
- [ ] Нет commit

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/fe-add-ui/SKILL.md
и чанки fe-react-layers, fe-ds-contract, crud-http.
Добавь панель по образцу note-panel на HomePage. Save = PUT.
Не пиши Selenide. Не коммить. После RTL STOP.
```
