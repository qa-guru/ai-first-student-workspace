---
name: qa-coverage-audit
description: >-
  Оценить покрытие takeaway: @Layer inventory vs flows vs OpenAPI.
  Use when asked for coverage, gaps, or test map.
---

# Оцени покрытие

RAG: `test-pyramid`, `test-layers`, `test-taxonomy`, `test-api-layer`, `quality-gates`.

## When

- «какое покрытие», «чего не хватает», «карта тестов»

## Do not

- Путать line coverage JaCoCo с пирамидой
- Предлагать «добавить e2e на всё»
- Менять код в этом task (план — да, реализация — `qa-pyramid-plan` / `qa-write-test`)

## Steps

1. Inventory: `tests/e2e|api|manual|testinfra` + `backend/java/backend-java-spring/src/test` + frontend `*.test.tsx`.
2. Таблица: класс × `@Layer` × `@Tag` × сценарий (DisplayName).
3. Flows: login / register / logout / home health+items / auth API. Note (`/api/note`, note-panel) — только если фича в дереве (`develop`; на `main` нет).
4. Сверить `AuthApiTests` vs `LoginTests` — где дубль, где дыра. Pending-списка в `build.gradle` нет. RTL note-panel — только `develop`.
5. Screenshot / mock / smoke — **slice**, не недостающий ярус.
6. Дальше (занятие 4): отдельный task `qa-pyramid-plan`. Здесь только audit, без кода.

## Формат ответа

| Сценарий | unit | cmp | api | e2e | man | Дыра? |
|----------|:----:|:---:|:---:|:---:|:---:|-------|
| login valid | | | | | | |
| login 401 / wrong password | | | | | | |
| register | | | | | | |
| home items | | | | | | |
| note (`/api/note`) | | | | | | n/a на `main`; на `develop` см. дерево |

Плюс 3 приоритетных пробела (ярус + почему не e2e) **или** явно «дыр нет», если inventory это показывает.

## DoD

- [ ] Inventory не «у нас всё покрыто» без таблицы
- [ ] Slice ≠ слой
- [ ] Нет правок кода
- [ ] 3 приоритета с ярусом, либо явно «дыр нет»

## Example prompt

```text
Прочитай docs/agent-skills/qa-coverage-audit/SKILL.md и test-pyramid.
Оцени покрытие модуля tests-java-…. Таблица + 3 дыры. Код не меняй.
```
