---
id: fe-react-layers
domain: frontend
adr: 008
tags: [react, vite, router, rtl]
related: [fe-ds-contract, crud-http]
---
# Слои frontend/typescript/frontend-typescript-react

**id:** `fe-react-layers`

Канон: Vite + React function components + [data router](https://reactrouter.com/6.30.1/routers/picking-a-router) (тот же `routes` в приложении и в тесте). Не Next.js, не Redux.

Корень: `frontend/typescript/frontend-typescript-react/src/`.

| Путь | Назначение |
|------|------------|
| `pages/` | экраны (`HomePage`, `LoginPage`, `RegisterPage`) |
| `lib/` | HTTP-клиенты, auth, `appBase`, строки не здесь — `messages.ts` |
| `routes.tsx` | единственный список маршрутов |
| `App.tsx` | layout: header + `<Outlet />` |
| `styles.ts` | единственный CSS-вход |
| `css/` (модуль) | product CSS |
| `test/` | Vitest + RTL (`component_rtl`) |

API: `apiUrl('/…')` из `lib/appBase.ts`, не `localhost` и не хардкод хоста. Клиент фичи — файл в `lib/` (`api.ts`, `auth.ts`, `note.ts`), не `fetch` размазанный по JSX.

Новый route — объект в `routes.tsx` (и пункт nav в `lib/headerConfig.ts`, если экран в меню). Якорь панели на Home: `HomePage` + `lib/note.ts`.

```bash
cd frontend/typescript/frontend-typescript-react
npm test
npm run typecheck
npm run lint
```

Coverage: `npm run test:coverage` — пол в `vitest.config.ts` (не 100%, не понижать). Selenide этот % не кормит. Новый UI без RTL-assert сценария — **Дыра**; stub `GET 404` в `HomePage.test` ≠ покрытие note-panel (ярус component).

## Don't

- Второй список маршрутов (`<BrowserRouter>` + `<Routes>` только в приложении).
- Править `vendor/` из фичи.
- Класть product CSS import в файлы DS.
- Считать зелёный `npm test` без assert новой панели достаточным.
