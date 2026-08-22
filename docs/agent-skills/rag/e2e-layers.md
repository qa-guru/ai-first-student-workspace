---
id: e2e-layers
domain: testing
adr: 002
tags: [structure, testbase, pages]
---
# Слои тестового модуля

**id:** `e2e-layers`

Корень: `tests/java/tests-java-gradle-junit5-allure3-selenide/src/test/java/`.

| Пакет | Назначение |
|-------|------------|
| `config/` | env profiles, typed keys |
| `api/` | `ApiTestBase`, HTTP-клиенты |
| `pages/` | Page Objects, локаторы, `@Step` |
| `tests/e2e/` | браузерные сценарии, `TestBase` |
| `tests/api/` | HTTP-сценарии, `ApiTestBase` |
| `tests/manual/` | exploratory stubs |
| `tests/testinfra/` | harness |
| `allure/` | attachments |
| `annotations/` | `@Layer`, `@Manual` |

## Do

Новый сценарий: сначала PO (или API-клиент) → потом класс теста. URL только из config.

## Don't

- `Configuration.browser` в каждом `@Test`.
- CSS/xpath в классе `*Tests`.
