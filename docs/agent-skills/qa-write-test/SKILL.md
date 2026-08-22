---
name: qa-write-test
description: >-
  Написать автотест по канону takeaway: слой, PO, tags, Allure.
  Use when asked to add e2e/api test, cover a scenario, or copy LoginTests.
---

# Разработай автотест

RAG (прочитай до кода): `po-fluent`, `po-locators`, `po-step`, `test-negative`, `test-taxonomy`, `test-layers`, `cfg-stands`.

## When

- «напиши e2e на …», «добавь negative login», «покрой API login»

## Do not

- CSS/xpath в классе `*Tests`
- Новый `ChromeDriver` / setup в тесте
- E2e на JSON-контракт, если место в `tests/api`
- `localhost` / prod URL / пароль хаба в Java
- Деструктивный сценарий на prod без OK / без ADR фичи с фабрикой (`cfg-stands`)
- Закрывать JaCoCo / RTL / все глаголы HTTP из этого skill (unit/cmp — `qa-make-full-pyramid`)
- На `main` нет `/api/note` — не выдумывать дыру note. На `develop` слот api/e2e по note уже есть; **Дыра** только если фича в дереве, а слота нет
- Commit без OK

## Якоря

| Слой | Образец |
|------|---------|
| e2e | `tests/e2e/LoginTests`, `pages/LoginPage` (`data-testid`) |
| api | `tests/api/AuthApiTests`, `api/AuthApiClient` |
| fluent | `loginPage.openPage().fillAndSubmitForm("user1", "password1")` |

## Steps

1. Выбери **один** `@Layer` (чанк `test-layers`). Сомнения api vs e2e — api, если нет UI-состояния.
2. **Стенды (чанк `cfg-stands`):** этот тест поедет на pipeline (`ci`), stage (`stage`) и/или prod (`prod`)? Данные (сиды) есть на всех? Сиды на prod не сносить. Фабрика+teardown на prod — только если ADR фичи. URL только из config. Контракт новой фичи — её RAG, не этот skill.
3. Есть PO/клиент? Расширь его. Нет — создай локаторы в `pages/`, не в тесте.
4. Класс: `@Layer`, `@Epic`, `@Feature`, `@DisplayName`. Метод: `@Tag` яруса + `positive`/`negative`.
5. Прогон только этого теста на **pipeline-профиле** (локальный compose):

```bash
cd tests/java/tests-java-gradle-junit5-allure3-selenide
# e2e
./gradlew test -Denv=ci -DincludeTags=e2e -Dtest=LoginTests#<method>
# api
./gradlew test -Denv=ci -DincludeTags=api -Dtest=AuthApiTests#<method>
```

6. В ответе: слой, **на каких стендах поедет**, команда, exit code. Оставшиеся ярусы фичи — **Дыра**, не писать их сейчас. Не коммитить.

## DoD

- [ ] Слой выбран явно
- [ ] Названы стенды: pipeline / stage / prod (что да / нет — DNS может быть ещё не поднят)
- [ ] Нет URL и секретов в тесте
- [ ] Локаторы не в тесте
- [ ] `@Step` на PO или api-шаги в отчёте
- [ ] Изолированный Gradle-прогон с `-Denv=ci` (или явно другой env)
- [ ] Живые дыры фичи названы (не закрыты в этом task)
- [ ] Нет commit

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/qa-write-test/SKILL.md
и чанки po-fluent, po-step, test-negative, cfg-stands.
Добавь автотест на неуспешный логин с неправильным паролем.
Укажи pipeline/stage/prod.
```
