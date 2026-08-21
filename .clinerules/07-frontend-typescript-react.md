---
paths:
  - "frontend-typescript-react/**"
---

# frontend-typescript-react

UI из design-system, не форк header (ADR `docs/adr/008-frontend-ds-not-fork.md`).

- Компоненты: `@zero-design-system/react`. `vendor/` руками не править.
- HTTP: `lib/` + `apiUrl` из `appBase`. Save синглтона = PUT (`crud-http`).
- Строки: `lib/messages.ts`. Маршруты: только `routes.tsx`.
- CSS продукта: `css/` + `src/styles.ts`, не side-import в DS.
- `data-testid` не ломать. Новые — в README модуля.
- RTL в `src/test/`. Не Selenide в том же task.
- Новый UI без assert сценария — в ответе **Дыра**. Stub `GET 404` ≠ покрытие панели. Не понижать пол в `vitest.config.ts`.
- Commit без OK нельзя.

Skill: `docs/agent-skills/fe-add-ui/SKILL.md`.  
RAG: `fe-react-layers`, `fe-ds-contract`, `crud-http`.
