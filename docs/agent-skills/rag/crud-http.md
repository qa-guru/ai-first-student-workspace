---
id: crud-http
domain: testing
adr: 006
tags: [http, rest, crud, rfc]
related: [test-api-layer, cfg-stands, test-pyramid]
---
# HTTP CRUD (RFC / MDN)

**id:** `crud-http`

Канон **этого** репо: этот файл. Таблицу глаголов не копировать в skills.  
SSOT monorepo: `docs/rag/testing/crud-http.md`.

Коллекция (`/api/items`) — `POST` создаёт. Синглтон (`/api/{name}`) — **нет POST**, нет `{id}` в пути.

Канон: [RFC 9110 PUT](https://www.rfc-editor.org/rfc/rfc9110.html#name-put) · [MDN PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT) · [RFC 5789 PATCH](https://datatracker.ietf.org/doc/html/rfc5789) · [RFC 7396](https://datatracker.ietf.org/doc/html/rfc7396).  
Почему takeaway — синглтон: учебный ADR `docs/adr/006-one-note-not-list.md`.

| Метод | Тело | Успех | Ошибки |
|-------|------|-------|--------|
| `PUT` | `application/json`, полный набор | **201** создал (`Content-Location`) / **200** заменил | 401, 400 |
| `GET` | — | 200 | 401, **404** |
| `PATCH` | **`application/merge-patch+json`**, любое подмножество | **200** | 401, **404**, **415**, 400, **422** |
| `DELETE` | без тела | **204** | 401, **404** |
| `POST` | только коллекция | **201** | не на синглтоне |

PUT идемпотентен, не 409. PATCH `{}` → **200**. 415: `Accept-Patch: application/merge-patch+json`. Чужой JWT на синглтон → **404**.

Пример курса: `/api/note`. UI save = PUT; PATCH — только api.

## Don't

- `POST` на синглтон и 409 «already exists»
- PUT, который не создаёт (404 вместо 201)
- PATCH с `application/json` без **415**
- Закрывать PUT/PATCH только e2e
- Delete сида `user1` на prod
