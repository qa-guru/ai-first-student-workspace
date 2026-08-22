---
id: be-spring-layers
domain: backend
adr: 007
tags: [spring, jpa, flyway, rest]
related: [crud-http, be-module-tests]
---
# Слои backend/java/backend-java-spring

**id:** `be-spring-layers`

Канон модуля: [Spring layered](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html) + [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/) + [Flyway](https://documentation.red-gate.com/fd). Не гексагоналка и не «entity в `@RequestBody`».

Корень: `backend/java/backend-java-spring/src/main/java/dev/multistack/app/`.

| Пакет | Назначение |
|-------|------------|
| `controller/` | `@RestController`, HTTP in/out, статус. Без бизнес-веток |
| `service/` | правила, транзакция, маппинг entity ↔ DTO |
| `repository/` | Spring Data; запросы сюда, не в service через `EntityManager` в обход |
| `entity/` | JPA, таблица. Не JSON-контракт |
| `dto/` | `record` + Jakarta Validation |
| `exception/` | статус + `message`; тело ошибки `{"message":"..."}` |
| `config/` | Security / JWT / CORS. Не размазывать по controller |

Схема: `src/main/resources/db/migration/V{n}__{name}.sql`. Новый файл, **не** править уже применённые `V1`/`V2`/`V3`.

Якоря: `ApiController` + `ItemService` (коллекция); `NoteController` + `NoteService` (синглтон, ADR 006). Инъекция — конструктор, не `@Autowired` на поле.

Security: `SecurityConfig` — GET health/items и POST login/register/logout публичны; `/api/**` иначе **authenticated**. Новый публичный path — строка в chain, не «и так сойдёт».

## Don't

- HTML / Thymeleaf / static из Spring (ADR 007).
- `ddl-auto=update` вместо Flyway.
- POST на синглтон и 409 «already exists» (`crud-http`).
