---
paths:
  - "**/tests/**"
  - "**/build.gradle"
  - "**/config/*.properties"
---

# Стенд и env (pipeline / stage / prod)

Тест пишется **стендо-агностично**. Стенд выбирает `-Denv=`, не код.

| Слово | Takeaway | Когда |
|-------|----------|--------|
| pipeline (CI / локальный compose) | `-Denv=ci` | разработка, GHA, Jenkins |
| stage | `-Denv=stage` | [https://stage.ai-first.autotests.ai/](https://stage.ai-first.autotests.ai/) |
| prod | `-Denv=prod` | [https://ai-first.autotests.ai/](https://ai-first.autotests.ai/) + Selenoid; креды хаба не в git |

- Любой прогон — с `-Denv=`. URL не хардкодить в тестах.
- Перед ci: `docker compose up -d --build`. Health: `curl -sf http://localhost:8800/api/health`. UI: `http://localhost:9821/` (не `:9811`).
- Prod без рабочего `-DremoteUrl` — не гонять.
- На prod: сиды (`user1`) не сносить. Delete/drop по умолчанию нельзя; фабрика+teardown — только если ADR фичи (`cfg-stands`).
- «Зелёный только на localhost» ≠ готово к merge.
- Не удалять `build/allure-results` без OK.

RAG: `docs/agent-skills/rag/cfg-stands.md`
