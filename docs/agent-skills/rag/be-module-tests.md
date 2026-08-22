---
id: be-module-tests
domain: backend
adr: 007
tags: [junit, jacoco, webmvctest, testcontainers]
related: [quality-gates, test-layers, be-spring-layers]
---
# Тесты модуля backend/java/backend-java-spring

**id:** `be-module-tests`

Это **не** пирамида takeaway (`tests/java/tests-java-gradle-junit5-allure3-selenide`). Гейт модуля: JaCoCo **LINE+BRANCH 1.0** (`quality-gates`).

Новый код без тестов модуля CI не проходит — **кроме** явного `jacocoPendingNoteClasses` (только `/api/note`, до яруса unit). Пока список не пуст — в ответе **Дыра**. Не расширять под другую фичу. Снимать вместе с тестами модуля (`qa-make-full-pyramid`, ярус unit).

| База | Что | Якорь |
|------|-----|-------|
| `UnitTestBase` | service + Mockito, без Spring | `ItemServiceTest` |
| `SliceTestBase` + `@WebMvcTest` | HTTP slice | `AuthControllerTest` |
| `PostgresSliceTestBase` | `@DataJpaTest` + Testcontainers PG 16, Flyway | `UserRepositoryTest`, `FlywayMigrationTest` |
| `IntegrationTestBase` | `@SpringBootTest` + PG, тег `integration` | `AuthLifecycleIntegrationTest` |

`@WebMvcTest` / `@DataJpaTest` в отчёте — тот же `@Layer("unit")`, suite `slice`, не шестой ярус пирамиды.

```bash
cd backend/java/backend-java-spring
./gradlew test jacocoTestReport jacocoTestCoverageVerification -DexcludeTags=integration
./gradlew test -DincludeTags=integration   # нужен Docker
./gradlew check                            # unit+integration+JaCoCo
```

Минимум на новый ресурс: unit service + WebMvc slice. Persistence slice — если новая таблица/entity (иначе drift Flyway ↔ JPA всплывёт поздно).

## Don't

- Писать Selenide / Rest Assured takeaway в этом task (`qa-write-test` / `qa-make-full-pyramid`).
- Считать «зелёный `./gradlew test` без verification» достаточным.
- Понижать `minimum = 1.0` в `build.gradle`.
- Расширять `jacocoPendingNoteClasses` под новый ресурс.
- Снимать список до тестов модуля; оставлять после яруса unit.
