---
id: fe-ds-contract
domain: frontend
adr: 008
tags: [design-system, testid, a11y]
related: [fe-react-layers, po-locators]
---
# Design-system и контракт UI

**id:** `fe-ds-contract`

SSOT визуала: `@zero-design-system/react` → `vendor/frontend-react-ui`. CSS lean runtime: `vendor/frontend-javascript-app/css/`, подключается из `src/styles.ts`.

| Делать | Не делать |
|--------|-----------|
| `Panel`, `Button`, `PlaqueField`, `AppHeader` из DS | Свой header / кнопка «как в Figma с нуля» |
| `data-testid` на панели, форме, инпуте, ошибке, submit | Селекторы по тексту/CSS в Selenide (это PO, другой модуль) |
| Тексты ошибок и confirm — `lib/messages.ts` | Строки-литералы, которые уже есть в messages |
| Save на синглтоне = `PUT` (`crud-http`) | PATCH с UI, если ADR фичи не просит |

Якоря testid (не ломать без смены PO): `login-form`, `submit-button`, `error-message`, `health-panel`, `items-list`, `note-panel`, `note-save-button`, … — таблица в `frontend-typescript-react/README.md`.

Header: `<AppHeader config={headerConfig} scriptSrc={appPath('/js/header.js')} />`. `npm run dev` без compose **не** отдаёт `header.js` — это не баг фичи.

Refresh DS: `bash frontend/scripts/sync-react-ui.sh`. Ручной diff в `vendor/` — не часть add-ui.

## Don't

- Менять testid, который уже в `tests-java-…/pages/*.java`, «заодно» в этом task.
- `window.confirm` / alert с текстом не из `messages.ts`, если строка пользовательская.
- Копировать монолитный header в React (ADR 008).
