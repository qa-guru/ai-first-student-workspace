# Занятие: одна заметка × пирамида

Живой отчёт. Обновлять **в конце фазы**. PDF и PR — только по OK человека.

HTTP-глаголы **не дублировать** здесь — SSOT: [`crud-http`](../agent-skills/rag/crud-http.md).

## Цель

Одна заметка на пользователя (без списка). HTTP — RFC/MDN, не учебный POST+409.  
«100% пирамиды» = каждый сценарий на своём `@Layer` (`test-pyramid`).  
Не 100% строк JaCoCo. Не e2e на все глаголы. Slice (`smoke` / `screenshot` / `mock`) ≠ слой.

Продукт: логин/регистрация + health/items + синглтон `/api/note` и `note-panel`. Ярусы takeaway — после «следующий ярус».

## ADR

| ADR | Статус | Суть |
|-----|--------|------|
| [005](../adr/005-screenshot-not-layer.md) | принято | screenshot/mock/smoke — slice, не `@Layer` |
| [006](../adr/006-one-note-not-list.md) | **принято** | синглтон `/api/note`; RFC не POST+409; delete на prod — фабрика |

## Таблица: сценарий × ярус

Канон HTTP — [`crud-http`](../agent-skills/rag/crud-http.md), не слайд POST+409.  
Ячейка: `●` = слот этого яруса (теста takeaway ещё нет); `—` = не сюда.  
Slice (`smoke` / `screenshot` / `mock`) ≠ колонка.

| Сценарий | unit | int | cmp | api | e2e | man |
|----------|:----:|:---:|:---:|:---:|:---:|:---:|
| Пустой `text` → 400 | ● | — | — | ● схема ошибки | — | — |
| PUT create persist | ● create vs replace, **не 409** | ● HTTP+DB | — | ● **201** + `Content-Location` | — | — |
| GET 200 / 404 | ● маппинг DTO | ● | ● текст / empty | ● (+ чужой JWT = свой 404) | ● один happy-path: логин → вижу/создаю (**PUT**) | — |
| Update | ● PUT replace; PATCH merge (`title:null`→`""`, `text:null`→**422**, `{}` no-op) | ● | ● форма edit = **PUT**, PATCH нет | ● PUT **200**; PATCH **200** / **415** / **422** / 404 | — | — |
| Delete | — | ● 204 потом 404 | ● empty state | ● 204 / 404; prod — фабрика, не `user1` | — | ● exploratory; prod — тот же api, teardown |
| 401 без токена | — | — (chain `/api/**` уже есть) | — | ● | не дублировать | — |
| Текст ошибки в UI | — | — | ● | — | только если api не ловит UX | — |
| Длинный текст / XSS / гонки | — | — | — | лимиты 120/2000 → 400 | — | ● XSS, гонки (PUT идемпотентен, не 409) |

Стенды: unit/cmp — n/a; int — pipeline; api — pipeline / stage / prod (delete с фабрикой); e2e — pipeline / stage, prod только `e2e & smoke`; man — не сид `user1`.

Слайд → RFC: нет POST и 409 «already exists»; нет «delete не на prod»; PATCH не в cmp/e2e.

Покрытие takeaway: **0/6 ярусов**. Фича в коде есть. `jacocoPendingNoteClasses` — дыра модуля до яруса **unit** (не шаблон для новых ресурсов). Backend JaCoCo 1.0 на остальном модуле ≠ ярусы пака (`tests-java-…`).

## Лог фаз

| Фаза | Что | Файлы | Прогон | Exit | Итог |
|------|-----|-------|--------|------|------|
| 0 | оркестратор + ADR + отчёт + PACK | skill `qa-make-full-pyramid`; ADR 006; этот файл; PACK | нет | n/a | артефакты есть |
| 1 | контракт | ADR 006; сначала CRUD-POST | нет | n/a | затем сверка RFC |
| 1b | канон RFC | RAG `crud-http`; ADR 006 | нет | n/a | POST убран; PUT 201/200 |
| 1c | SSOT | `crud-http` в monorepo RAG + диета; generic skills без таблицы глаголов | нет | n/a | план ссылается на RAG |
| 2 | backend | `V3__notes.sql`; `NoteController`/`NoteService`; JaCoCo exclude `jacocoPendingNoteClasses` до яруса unit | `./gradlew test jacocoTestCoverageVerification -DexcludeTags=integration` | 0 | PUT 201/200, PATCH merge-patch, cascade delete; гейт 1.0 на остальном модуле |
| 3 | frontend | `lib/note.ts`; `note-panel` на Home; stub GET `/api/note` в `HomePage.test` | `npm test` | 0 | Save = PUT; PATCH с UI нет |
| 1d | план | матрица сценарий × ярус под RFC | нет | n/a | убраны POST+409 и «delete не на prod» |

## Вывод: зачем skills / rules / RAG / ADR

| Слой | Роль на этом занятии |
|------|----------------------|
| **Skill** | `qa-make-full-pyramid` = один ярус + STOP; api/e2e — `qa-write-test`; план дыр — `qa-pyramid-plan`. |
| **Rule** | Нет commit без OK; один `@Layer`; URL не в Java; сиды не сносить (`cfg-stands`). |
| **RAG** | `crud-http` = палата мер HTTP; `cfg-stands` = стенды; плюс 2–3 чанка яруса. |
| **ADR** | Почему синглтон и RFC, не POST+409 (006); screenshot не слой (005). |

Без связки агент пишет e2e на все глаголы, путает 100% с JaCoCo или возвращает POST+409.

## Что осталось человеку

- Ярусы takeaway — «следующий ярус» (`qa-make-full-pyramid`), по одному чату. Первый = **unit**: тесты модуля + снять `jacocoPendingNoteClasses`.
- Stage / PDF / PR — только явным OK.
