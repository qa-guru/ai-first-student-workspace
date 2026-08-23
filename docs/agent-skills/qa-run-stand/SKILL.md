---
name: qa-run-stand
description: >-
  Запуск автотестов на pipeline, stage или prod (Selenoid).
  Use when asked to run tests on prod, stage, CI stand, or remote hub.
---

# Запуск на стенде (pipeline / stage / prod)

RAG: `cfg-stands`, `cfg-env-profile`, `cfg-base-url`, `remote-selenoid`, `ci-gradle-args`.

Код теста один. Меняется только `-Denv=` (и `remoteUrl` на удалённом хабе).

## When

- «запусти на проде / стейдже / в пайплайне», «Selenoid», «CI как locally»

## Do not

- `./gradlew test` без `-Denv`
- Хардкод URL в тесте
- Коммитить пароль Selenoid
- Prod без рабочего `remoteUrl`
- Деструктивные тесты на prod без OK
- Выдумывать host в Java, если DNS ещё не поднят

## A. Pipeline ≈ локальный CI (`ci`)

```bash
docker compose up -d --build
curl -sf http://localhost:8800/api/health
# UI: http://localhost:9821/

cd tests/java/tests-java-gradle-junit5-allure3-selenide
./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock
```

Jenkins `{login}-app-tests` / GHA — тот же `-Denv` и tags, что в job.

## B. Stage (`stage`)

```bash
./gradlew test -Denv=stage -DincludeTags=e2e -DexcludeTags=screenshot,mock \
  -DremoteUrl="$SELENOID_WEBDRIVER_URL"
```

URL: [https://stage.ai-first.autotests.ai/](https://stage.ai-first.autotests.ai/). Нет DNS/стенда → не подменять URL в Java.

## C. Prod (`prod`)

```bash
./gradlew test -Denv=prod -DincludeTags=e2e -DexcludeTags=screenshot,mock \
  -DremoteUrl="$SELENOID_WEBDRIVER_URL"
```

Нет URL хаба → стоп. Узкий срез, не full pyramid.

## DoD

- [ ] Названы слово (pipeline/stage/prod) и `-Denv`
- [ ] Health (ci) или явный «нет remoteUrl» (prod) / «нет properties» (stage)
- [ ] Срез tags, не full suite
- [ ] Exit code
- [ ] Нет секретов в ответе и в git

## Example prompt

```text
Прочитай docs/agent-skills/qa-run-stand/SKILL.md и cfg-stands.
Запусти e2e на pipeline (compose). Не prod. Не коммить.
```
