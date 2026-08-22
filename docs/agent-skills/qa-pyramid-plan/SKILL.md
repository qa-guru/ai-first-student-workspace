---
name: qa-pyramid-plan
description: >-
  План 100% пирамиды и реализация одного недостающего яруса.
  Use when asked for pyramid plan or to fill a missing layer.
---

# 100% пирамида — план и один шаг

RAG: `test-pyramid`, `test-layers`, `test-api-layer`, `cfg-stands`, `adr-when`.  
ADR: `docs/adr/005-screenshot-not-layer.md` после sync (в паке: `docs/agent-skills/adr/`). Сначала `qa-coverage-audit`, потом этот план, потом `qa-write-test`.

«100%» = продукт закрыт по пирамиде **целиком**, не каждый ярус по 100% и не 100% строк кода. Этот skill закрывает **одну дыру** в общей карте, не «добить слой до 100%».

## When

- «план пирамиды», «довёл до 100%», «куда класть этот кейс»

## Do not

- Добавлять e2e вместо api
- Вводить `@Layer("screenshot")`
- Реализовывать все дыры в одном task (один ярус / один тест)

## Steps

1. Возьми таблицу из `qa-coverage-audit` (или собери коротко).
2. План: для каждой дыры — ярус + класс-якорь + **на каких стендах** (pipeline / stage / prod).
3. Согласуй с человеком **одну** реализацию.
4. Пиши по `qa-write-test` (PO/api-клиент, tags).
5. Прогон только этого слоя.

Примеры правильного слота:

| Дыра | Куда |
|------|------|
| JSON login 401 | `AuthApiTests`, не новый UI-клик |
| `jacocoPendingNoteClasses` (если список вдруг в gradle) | ярус **unit** модуля + снять exclude, не e2e |
| note-panel без RTL (только если панель в дереве и сценария нет) | component (`HomePage.test`), не Selenide |
| `/api/note` без Rest Assured | `tests/api`, не новый UI-клик |
| Текст ошибки на форме | `LoginTests` + PO, уже есть wrong password |
| Чеклист exploratory | `tests/manual`, `@Manual` |

## DoD

- [ ] План таблицей (дыра → ярус)
- [ ] Не больше одного нового теста без OK
- [ ] Прогон с правильным `-DincludeTags`
- [ ] Screenshot не назван ярусом

## Example prompt

```text
Прочитай docs/agent-skills/qa-pyramid-plan/SKILL.md и test-pyramid.
План пирамиды по takeaway. Реализуй только если я скажу какой ярус.
Не коммить.
```
