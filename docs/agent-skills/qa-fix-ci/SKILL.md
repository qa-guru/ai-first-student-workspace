---
name: qa-fix-ci
description: >-
  Починить красный прогон GitHub Actions или Jenkins по логу.
  Use when a workflow/job failed and the user wants a diagnosis or a fix.
---

# Почини CI

RAG: `ci-github-actions` **или** `ci-jenkins` + `ci-gradle-args`.

Сначала лог, потом правка. Не «перезапусти 10 раз» — это `qa-run-ci` после гипотезы.

## When

- «Actions красный», «Jenkins failed», «упал e2e-tests»

## Do not

- Реран без чтения лога
- Менять чужой job / matrix YAML
- Чинить sibling SPA через `strategy.matrix` в teaching `ci.yml` (шапка/nav — в исходнике модуля; compose на хосте)
- Класть секреты в коммит или в чат
- Чинить тесты «наугад» без `-Dtest=` (сначала `qa-smoke-debug` / `qa-write-test`)
- В том же task создавать новый workflow (`qa-create-ci`)

## Steps

1. Ссылка на run / build.
2. Упавший job → команда из лога vs `ci-gradle-args` (env, tags).
3. Гипотеза в одну строку (нет compose / не тот `-Denv` / тест / секрет).
4. Правка **одного** слоя: YAML **или** тест **или** vars — не всё сразу (`04-one-task-one-layer`).
5. Не коммитить без OK.

## DoD

- [ ] URL прогона
- [ ] Job + команда из лога
- [ ] Одна гипотеза
- [ ] Нет секретов в ответе

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/qa-fix-ci/SKILL.md
и rag/ci-github-actions.md, ci-gradle-args.md.
Красный run: гипотеза по логу, без рерана. Не коммить.
```
