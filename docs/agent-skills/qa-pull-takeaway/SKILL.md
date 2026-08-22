---
name: qa-pull-takeaway
description: >-
  Аккуратно забрать улучшения из upstream takeaway, не затирая учебную работу.
  Use when asked to pull, sync, or adopt review fixes from the course takeaway.
---

# Спулить улучшения из takeaway

RAG: `cfg-stands`, `ci-github-actions`, `test-pyramid`, `test-layers`.

Upstream курса: [qa-guru/ai-first-student-workspace](https://github.com/qa-guru/ai-first-student-workspace)  
Это **не** monorepo и не матрица `/stack/…`. Слово «эталон» на занятии не нужно.

## When

- «забери фиксы после ревью», «синхронизируй с takeaway», «git pull по уму»

## Do not

- `git reset --hard` / `git pull` вслепую поверх своих rules/skills/тестов
- Копировать matrix `ci.yml`, пути `/stack/…`, task `testE2e`
- Затирать `.clinerules/`, `docs/agent-skills/`, `AGENTS.md`, свои `docs/adr/`
- Менять `baseUrl` в Java
- Commit / push без OK

## Steps

1. Найди origin и есть ли `upstream`. Нет git — скажи человеку клонировать fork, не выдумывай remote.
2. `git fetch upstream` (или origin, если это сам takeaway) + `git log HEAD..upstream/main --oneline` (ветка может быть `master`).
3. Таблица **adopt / skip / ask**:

| Зона | Обычно |
|------|--------|
| `.github/workflows/ci.yml`, `docker-compose*.yml` | adopt, если у вас нет своих jobs |
| `config/*.properties` | adopt URL/ключи; **не** затирать лишние стенды, которые вы добавили |
| `backend/`, `frontend/` | adopt багфиксы; conflict в вашем UI — ask |
| `tests/…/src/test/java` | adopt новые классы/PO; **не** удалять ваши тесты |
| `.clinerules/`, `docs/agent-skills/`, домашка | **skip** |
| секреты, `.env` | skip |

4. Забери файлы точечно (`git checkout upstream/main -- path`), не merge всего репо, пока человек не сказал «merge».
5. После adopt: health `:8800` + e2e slice **одного** якоря (`HomeTests`). Не full suite.
6. В ответе: что взяли, что не тронули, какая команда проверки.

## DoD

- [ ] Нет hard reset
- [ ] Учебные files живы
- [ ] Нет matrix-путей и нет task `testE2e`
- [ ] Таблица adopt/skip
- [ ] Нет commit без OK

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/qa-pull-takeaway/SKILL.md
и чанки test-pyramid, ci-github-actions.
Забери из upstream takeaway только улучшения после ревью.
Не затирай .clinerules и docs/agent-skills. Не коммить.
```
