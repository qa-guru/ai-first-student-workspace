---
name: be-add-resource
description: >-
  Добавить или изменить HTTP-ресурс в backend/java/backend-java-spring (Flyway, слои Spring, тесты модуля, JaCoCo).
  Use when asked to add a Spring endpoint, entity, REST resource, or backend feature in this module.
---

# Добавь ресурс в Spring

Фича **продукта** в `backend/java/backend-java-spring/`. Не заменяет `qa-write-test` / `qa-make-full-pyramid` (takeaway api/e2e — другой task).

RAG (прочитай до кода, 2–4): `be-spring-layers`, `crud-http`, `be-module-tests`.  
ADR модуля: `docs/adr/007-backend-api-only.md`. Если фича уже с решением (заметка) — ещё `docs/adr/006-one-note-not-list.md`.

## When

- «добавь эндпоинт», «ресурс в Spring», «таблицу + API», «backend/java/backend-java-spring фича»

## Do not

- HTML / шаблоны / cookie-session (ADR 007)
- Править уже применённые Flyway-миграции
- POST+409 на синглтоне; PUT, который не создаёт (`crud-http`)
- Писать тесты в `tests/java/tests-java-gradle-junit5-allure3-selenide` в этом вызове
- Понижать JaCoCo 1.0. Заводить или расширять `jacocoPendingNoteClasses`
- Молчать, если тестов модуля нет: в ответе **Дыра**
- Commit без OK

## Якоря

| Что | Образец |
|-----|---------|
| коллекция | `ApiController` + `ItemService` + `V1__items.sql` |
| синглтон | на `develop`: `NoteController` + `NoteService` + `V3__notes.sql` (на `main` нет) |
| unit | `ItemServiceTest` |
| HTTP slice | `AuthControllerTest` |
| persistence | `UserRepositoryTest` / `FlywayMigrationTest` |

## Steps

1. Коллекция vs синглтон — `crud-http`. Контракт статусов оттуда, не выдумывать.
2. Схема? Новый `V{n}__…sql` в `src/main/resources/db/migration/`.
3. Слои по `be-spring-layers`: entity → repository → dto+validation → service → controller. Controller тонкий.
4. Security: публичный GET/POST — строка в `SecurityConfig`; иначе хватит `/api/**` authenticated.
5. Ошибки — `{"message":"..."}` (как `AuthException`; на `develop` ещё `NoteException`).
6. Строка в таблицу Contract в `backend/java/backend-java-spring/README.md` (SSOT модуля).
7. Тесты модуля по `be-module-tests` (минимум service unit + `@WebMvcTest`; новая таблица — persistence slice).
8. Прогон:

```bash
cd backend/java/backend-java-spring
./gradlew test jacocoTestReport jacocoTestCoverageVerification -DexcludeTags=integration
```

9. В ответе: путь ресурса, глаголы, команда, exit code. Pending-списка в `build.gradle` быть не должно; если появился — **Дыра**. **STOP.** Пирамида takeaway — не начинать. Не коммитить.

## DoD

- [ ] Слои и Flyway как в RAG; HTTP как `crud-http`
- [ ] README Contract обновлён
- [ ] Тесты модуля есть; JaCoCo verification зелёный; pending-exclude не заведён
- [ ] На `main` не ставить дыру «заметка без unit» — `/api/note` на этой ветке нет
- [ ] Нет кода в `tests-java-…`
- [ ] Нет commit

## Example prompt

```text
Rules ON. Прочитай docs/agent-skills/be-add-resource/SKILL.md
и чанки be-spring-layers, crud-http, be-module-tests.
Добавь ресурс по образцу ItemService (коллекция) / на develop — NoteController (синглтон).
Не пиши Selenide. Не коммить. После модуля STOP.
```
