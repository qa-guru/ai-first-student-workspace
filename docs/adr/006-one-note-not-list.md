# ADR 006 (учебный): одна заметка, HTTP как RFC — не список и не POST+409

**Статус:** принято  
**Дата:** 2026-08-19

## Контекст

В takeaway уже есть каталог `items` и auth. Развилки: список vs одна заметка; учебный CRUD (`POST`+409, PUT не создаёт) vs канон HTTP; delete сидов на prod.

Список раздувает e2e. `POST` на известный URI синглтона — не [RFC 9110 PUT](https://www.rfc-editor.org/rfc/rfc9110.html#name-put). Сид `user1` на витрине не сносить (`cfg-stands`).

Номер **006** — только пак takeaway. Не путать с monorepo `docs/adr/006-allurerc-mjs-ethalon.md`.

## Решение

1. Продукт: **одна** заметка на пользователя. Ресурс `/api/note`. Нет коллекции и `{id}`.
2. Глаголы — **как в RFC/MDN**, не «CRUD-отсебятина». Таблица статусов — RAG `crud-http`, не этот файл.
3. «100% пирамиды» = сценарий на своём `@Layer`. Контракт — `api`; один e2e happy path.
4. Delete на prod **этой** фичи можно тем же тестом: фабрика + teardown, не сид `user1`. Нет `if (prod)`.

## Последствия

- Не проектировать `GET /notes`.
- Не учить агента POST+409 на синглтоне.
- Не копировать HTTP-таблицу в `qa-write-test` / `qa-pyramid-plan`.

## RAG

`crud-http` · `test-pyramid` · `cfg-stands` · `adr-when`
