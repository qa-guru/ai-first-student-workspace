---
id: test-layers
domain: testing
adr: 002
tags: [layer, allure, gradle]
related: [test-pyramid, ci-gradle-args]
---
# @Layer → тег → Gradle

**id:** `test-layers`

В takeaway ключ `@Layer` и `@Tag` яруса на классе/методе совпадают по имени. Дополнительный `@Tag` может быть **slice**.

| `@Layer` | `@Tag` яруса | Команда (модуль тестов) |
|----------|--------------|-------------------------|
| e2e | `e2e` | `./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock` |
| api | `api` | `./gradlew test -Denv=ci -DincludeTags=api` |
| manual | `manual` | `./gradlew test -Denv=ci -DincludeTags=manual` |
| harness | `harness` | `./gradlew test -Denv=ci -DincludeTags=harness` |

Backend / frontend — другие каталоги, не этот `./gradlew`:

| Ярус | Где | Команда (как в CI) |
|------|-----|---------------------|
| unit | `backend/java/backend-java-spring/` | `./gradlew test jacocoTestReport jacocoTestCoverageVerification -DexcludeTags=integration` |
| integration | `backend/java/backend-java-spring/` | `./gradlew test -DincludeTags=integration` |
| component | `frontend/typescript/frontend-typescript-react/` | `npm test -- --coverage` |

## Slice-теги (не ярус)

| `@Tag` | Смысл |
|--------|--------|
| `smoke` | узкий прод-срез внутри api/e2e (`HomeTests`, login valid). Локально на занятии **не** заменяет `-DincludeTags=e2e` |
| `positive` / `negative` | характер кейса |
| `screenshot` / `mock` | CI slice, тот же `@Layer("e2e")` |

Browser smoke в Allure/TestOps — слой **E2E Tests**, не «UI Tests».

## Don't

- Выдумывать Gradle-task `testE2e`.
- `@Tag("api")` + `@Tag("e2e")` на одном методе.
- Считать отсутствие task `testE2e` = «в проекте нет `@Tag("smoke")`». Тег есть; task нет.
