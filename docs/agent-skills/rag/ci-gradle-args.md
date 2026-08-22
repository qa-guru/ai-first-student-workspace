---
id: ci-gradle-args
domain: config
adr: 002
tags: [gradle, tags, env]
---
# Gradle-команды takeaway

**id:** `ci-gradle-args`

Модуль: `tests/java/tests-java-gradle-junit5-allure3-selenide/`. Один task `test`. Срез = `-DincludeTags` + `-Denv`.

## Стенды

| `-Denv=` | Что это | App |
|----------|---------|-----|
| `ci` | pipeline ≈ локальный compose / CI | UI [http://localhost:9821/](http://localhost:9821/) · API [http://localhost:8800/](http://localhost:8800/) |
| `stage` | stage takeaway | [https://stage.ai-first.autotests.ai/](https://stage.ai-first.autotests.ai/) + `remoteUrl` хаба |
| `prod` | prod takeaway (не матрица `/stack/…`) | [https://ai-first.autotests.ai/](https://ai-first.autotests.ai/) + `remoteUrl` хаба |

Перед `ci`: `docker compose up -d --build` в корне takeaway. Health: `curl -sf http://localhost:8800/api/health`.

## Команды

```bash
cd tests/java/tests-java-gradle-junit5-allure3-selenide

# e2e на занятии (шире prod-smoke). Task testE2e нет.
# @Tag("smoke") есть на узких методах — для prod slice, не вместо этой команды.
./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock

# один класс / метод
./gradlew test -Denv=ci -DincludeTags=e2e -Dtest=HomeTests
./gradlew test -Denv=ci -DincludeTags=e2e \
  -Dtest=LoginTests#shouldShowErrorWhenPasswordIsWrong

# api без браузера
./gradlew test -Denv=ci -DincludeTags=api

# manual (шаги в коде, не браузер)
./gradlew test -Denv=ci -DincludeTags=manual

# «прод»-стенд (нужен remoteUrl с кредами — в git их нет)
./gradlew test -Denv=prod -DincludeTags=e2e -DexcludeTags=screenshot,mock
```

Allure results: `build/allure-results`. Отчёт: `npx allure serve build/allure-results` (после `npm ci` в модуле тестов).

## Don't

- `./gradlew test` без `-DincludeTags` на задаче «smoke / e2e».
- Выдумывать task `testE2e` — в takeaway его нет.
- Путать `@Tag("smoke")` (slice) с ярусом `@Layer("e2e")`.
- Хардкодить URL в тесте — только `-Denv` / properties.
