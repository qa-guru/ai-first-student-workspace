---
name: qa-create-ci
description: >-
  Создать или включить CI: Actions на fork / Jenkins job для новой учётки.
  Use when asked to set up GitHub Actions, create a Jenkins job, or signup.
---

# Создай CI

RAG: `ci-github-actions` **или** `ci-jenkins` + `cfg-stands`.

Один раннер за task. YAML уже есть в takeaway — **не** генерировать второй `ci.yml`.

## When

- «включи Actions», «заведи Jenkins job», «signup jenkins.qa.guru»

## Do not

- Писать токены в YAML / job XML
- Копировать канон-job школы без смены SCM
- Просить Jenkins Administer
- В том же task чинить красный прогон (`qa-fix-ci`)

## GitHub Actions

1. Fork takeaway, Settings → Actions → Allow.
2. Если `.github/workflows/ci.yml` есть — только включить. Нет — взять из takeaway (это **тот же** файл, что у clone). Не плодить второй workflow.
3. Vars `DEPLOY_*` — только если человек поднимает **свой** хост (`qa-setup-host`). Витрина курса уже на [ai-first.autotests.ai](https://ai-first.autotests.ai/) — студенту её vars не копировать.

## Jenkins

1. Signup [jenkins.qa.guru/signup](https://jenkins.qa.guru/signup), если открыт; иначе `blocked`.
2. Имя: `{login}-app-tests-freestyle-java-allure3-full-attachments`.
3. SCM = **ваш** fork. Агент `java-jdk21`. Креды — в Jenkins credentials, не в git.
4. Нет прав создать job → таблица «сказать преподавателю», не выдумывать config.

## DoD

- [ ] Раннер назван
- [ ] Есть workflow/job **или** явный blocked
- [ ] Нет секретов в ответе
- [ ] Нет commit секретов

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/qa-create-ci/SKILL.md
и rag/ci-jenkins.md.
Новая учётка Jenkins: signup и канон имени job. Не проси Administer. Не коммить.
```
