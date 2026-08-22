---
name: qa-make-full-pyramid
description: >-
  Закрыть уже влитую фичу по ярусам unit → integration → component → api → e2e → manual.
  Один вызов = один ярус; после яруса STOP. Не заменяет qa-write-test / qa-coverage-audit.
---

# Полная пирамида — один ярус за вызов

Фича **уже влита**. Этот skill не пишет продукт (`be-add-resource` / `fe-add-ui`) и не заменяет:
`qa-coverage-audit` (карта), `qa-pyramid-plan` (план + одна дыра продукта),
`qa-write-test` (как писать api/e2e).

«100% пирамиды» = каждый сценарий фичи на **своём** `@Layer` (RAG `test-pyramid`).
Не 100% строк JaCoCo (`quality-gates`). Не e2e на все глаголы. Slice ≠ слой.

Контракт HTTP фичи — её RAG (CRUD: `crud-http`). Не копировать таблицу глаголов сюда.

## When

- «закрой пирамиду», «ярус unit/api/e2e…», «следующий ярус», «make-full-pyramid»
- После влитой фичи, не вместо реализации

## Do not

- Реализовывать фичу (нет кода → STOP, отдай `be-add-resource` / `fe-add-ui`)
- Два яруса в одном вызове; «добить всё»
- Подменять `qa-write-test` / `qa-coverage-audit`
- E2e на все HTTP-глаголы; `@Layer("screenshot")`; smoke как ярус
- Выдумывать контракт (не читая RAG фичи)
- `localhost` / prod URL в Java
- Чинить чужие тесты «заодно»
- Расширять `jacocoPendingNoteClasses`; снимать exclude до зелёных тестов unit
- Commit без OK

## RAG (на вызов — 2–4 id, не все сразу)

Каталог: `test-pyramid` · `test-layers` · `test-api-layer` · `cfg-stands` · `adr-when` · `quality-gates` + **RAG фичи**.

| Ярус | Читать |
|------|--------|
| unit | `test-pyramid`, RAG фичи, `quality-gates`, `be-module-tests` |
| integration | `test-pyramid`, RAG фичи, `cfg-stands`, `be-module-tests` |
| component | `test-pyramid`, `test-layers`, `fe-react-layers` |
| api | RAG фичи, `test-api-layer`, `cfg-stands` |
| e2e | `test-pyramid`, RAG фичи, `cfg-stands` (+ `qa-write-test` и его RAG) |
| manual | `test-pyramid`, `cfg-stands`, `adr-when` |

Пример takeaway (заметка): RAG = `crud-http`; ADR = `docs/adr/006-one-note-not-list.md`. Slice: `docs/adr/005-screenshot-not-layer.md`.

## Якоря (образец слоя, не дописывать чужой фиче)

| `@Layer` | Класс / файл | Прогон яруса |
|----------|--------------|--------------|
| unit | `backend/java/backend-java-spring/…/service/ItemServiceTest.java` | `cd backend/java/backend-java-spring && ./gradlew test jacocoTestReport jacocoTestCoverageVerification -DexcludeTags=integration` |
| integration | `backend/java/backend-java-spring/…/integration/AuthLifecycleIntegrationTest.java` | `cd backend/java/backend-java-spring && ./gradlew test -DincludeTags=integration` |
| component | `frontend/typescript/frontend-typescript-react/src/test/pages/HomePage.test.tsx` | `cd frontend/typescript/frontend-typescript-react && npm test -- --coverage` |
| api | `tests/java/tests-java-gradle-junit5-allure3-selenide/…/tests/api/AuthApiTests.java` | `cd tests/java/tests-java-gradle-junit5-allure3-selenide && ./gradlew test -Denv=ci -DincludeTags=api` |
| e2e | `…/tests/e2e/LoginTests.java` | `cd tests/java/tests-java-gradle-junit5-allure3-selenide && ./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock` |
| manual | `…/tests/manual/ExploratoryManualTests.java` | `cd tests/java/tests-java-gradle-junit5-allure3-selenide && ./gradlew test -Denv=ci -DincludeTags=manual` |

Изолированно: тот же `-Denv` / tags + `-Dtest=Class#method` (api/e2e) или точечный класс backend/Vitest.

Порядок ярусов, если человек не назвал: **unit → integration → component → api → e2e → manual**.

## Когда снимать дыры (заметка)

Пока дыра жива — в **каждом** ответе строка **Дыра:** … Один вызов закрывает **одну** строку. Не расширять pending-список под новую фичу (`be-add-resource` пишет тесты модуля сразу).

| Ярус | Написать | Снять |
|------|----------|-------|
| **unit** | `NoteServiceTest` + HTTP slice `NoteControllerTest` (+ persistence, если entity ещё не в срезе) | **удалить** `jacocoPendingNoteClasses` из `backend/java/backend-java-spring/build.gradle`; прогон `jacocoTestCoverageVerification`. Не снимать до зелёных тестов. Не оставлять список после unit. |
| integration | HTTP+DB заметки (`AuthLifecycleIntegrationTest` как якорь) | — (exclude уже нет) |
| component | RTL: empty / save PUT / delete; не только stub `GET 404` | дыра «панель без сценария» |
| api | `NoteApiTests` + клиент; PATCH и 415 здесь, не в e2e | дыра «нет api» |
| e2e | один happy path: логин → вижу/создаю (**PUT**) | дыра «нет e2e»; не все глаголы |
| manual | exploratory; prod — фабрика, не `user1` | дыра «нет man» |

## Steps

1. Фича влита? Нет → STOP. Не кодить продукт.
2. Ярус = тот, что назвал человек, иначе первый пустой в порядке выше. Rule: один task = один `@Layer`.
3. Прочитай **этот** SKILL и **2–4** RAG из таблицы яруса (включая RAG фичи).
4. Api/e2e — пиши по `qa-write-test`. Unit/integration/component/manual — по якорю слоя. Ярус **unit** по заметке: тесты модуля **и** снятие `jacocoPendingNoteClasses` в одном вызове.
5. Стенды: `cfg-stands`. Разрушение на prod — сиды нельзя; фабрика — только если ADR фичи (в RAG фичи).
6. Прогон **только этого** яруса (команда из таблицы, лучше точечный `-Dtest`).
7. Строка в живом отчёте, если есть (`docs/lessons/note-crud-pyramid.md`). Оставшиеся дыры из таблицы — назвать, не закрывать.
8. **STOP.** Ждать «следующий ярус».

## DoD

- [ ] Фича уже влита (этот skill её не писал)
- [ ] Ровно один `@Layer`; slice не назван ярусом
- [ ] 2–4 RAG, не вся папка; контракт из RAG фичи
- [ ] Стенды названы (`cfg-stands`)
- [ ] Прогон яруса; exit code в ответе
- [ ] Если ярус **unit** по заметке: `jacocoPendingNoteClasses` снят, verification 1.0 зелёный
- [ ] Оставшиеся дыры названы; этот ярус не закрыл чужие
- [ ] Отчёт обновлён, если файл есть
- [ ] Нет commit без OK
- [ ] Следующий ярус не начат

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/qa-make-full-pyramid/SKILL.md
и 2–4 RAG текущего яруса (unit: be-module-tests, quality-gates, crud-http).
Фича уже влита. Ярус: unit. NoteServiceTest + NoteControllerTest,
сними jacocoPendingNoteClasses. Не коммить. После яруса STOP.
```
