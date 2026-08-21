# QA Agent — takeaway Java/Selenide/Allure

- Ответы на **русском**; команды и пути — как в этом репозитории.
- Модуль тестов: `tests-java-gradle-junit5-allure3-selenide/`.

## E2e (default «smoke»)

```bash
cd tests-java-gradle-junit5-allure3-selenide
./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock
```

Нет `testE2e` и `@Tag("smoke")`. Срез = `@Tag("e2e")`. App: compose + gateway `:9821`, health `:8800`.

## Ограничения

- Не `git commit` / `git push` без явной просьбы.
- Не удаляй `build/allure-results` без OK.
- Fix тестов — только после triage и OK человека.
- Прод-стенд только `-Denv=prod` + рабочий remoteUrl.
- Новый автотест обязан быть годен для **pipeline / stage / prod** (URL из properties, не localhost в коде). RAG: `docs/agent-skills/rag/cfg-stands.md`.

## Workflow

См. `docs/agent-skills/` (`qa-smoke-debug`, `qa-write-test`, `qa-make-full-pyramid`, `qa-homework-check`, …) и RAG `docs/agent-skills/rag/` (HTTP CRUD: `crud-http`).
