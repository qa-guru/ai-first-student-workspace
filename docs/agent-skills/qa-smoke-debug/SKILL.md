---
name: qa-smoke-debug
description: >-
  E2e slice takeaway (Selenide), Allure local, triage flaky.
  Use for smoke, allure report, or debug HomeTests/LoginTests.
---

# QA e2e slice + Allure + flaky — takeaway

**Модуль:** `tests/java/tests-java-gradle-junit5-allure3-selenide/`  
**Стек:** JUnit 5 · Selenide · Allure · Gradle

RAG: `docs/agent-skills/rag/ci-gradle-args.md`, `allure-attach.md`, `cfg-stands.md`.

## When

- «smoke e2e», «прогони HomeTests», «allure локально», «flaky login»

## Do not

- `./gradlew test` без `-DincludeTags=e2e`
- task `testE2e` (его нет)
- commit без OK
- fix без 3 изолированных прогонов

---

## Prerequisites

1. В **корне takeaway:** `docker compose up -d --build`
2. `curl -sf http://localhost:8800/api/health`
3. UI через gateway: `http://localhost:9821/` (не `:9811`)
4. `cd tests/java/tests-java-gradle-junit5-allure3-selenide`

---

## 1. E2e local (учебный smoke)

Срез занятия = `@Tag("e2e")` минус screenshot/mock. Gradle-task `testE2e` нет.  
`@Tag("smoke")` на отдельных методах — узкий **prod slice**, не замена этой команды.

```bash
./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock
```

Зафиксируй: exit code, `tests run` / `failed`.

Якорь: `tests/e2e/HomeTests.pageLoadFetchesItems` — `@Layer("e2e")`, `@Tag("e2e")`.

Один класс:

```bash
./gradlew test -Denv=ci -DincludeTags=e2e -Dtest=HomeTests
```

---

## 2. Allure local

1. Каталог `build/allure-results` не пустой.
2. Отчёт:

```bash
npx allure serve build/allure-results
```

3. В UI: `HomeTests` / `LoginTests` — steps с PO.

---

## 3. Flaky triage

В проекте нет `@Tag("flaky")` — изоляция метода.

**Пример:** `LoginTests.shouldShowErrorWhenPasswordIsWrong`

```bash
./gradlew test -Denv=ci -DincludeTags=e2e \
  -Dtest=LoginTests#shouldShowErrorWhenPasswordIsWrong
```

1. Три раза подряд. 2. Сравни screenshot/trace в results. 3. Гипотеза, **не fix**.

---

## DoD

- [ ] Команда с `-Denv=ci` и `-DincludeTags=e2e`, не full suite
- [ ] Exit code записан
- [ ] `build/allure-results` exists
- [ ] Flaky: `-Dtest=Class#method` × 3
- [ ] Нет commit

---

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/qa-smoke-debug/SKILL.md.
E2e slice takeaway. Не коммить. Команда + exit code + путь allure-results.
```
