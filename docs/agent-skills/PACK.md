# Пак QA skills / rules / RAG (AI-first)

Учебный комплект takeaway  
[ai-first-student-workspace](https://github.com/qa-guru/ai-first-student-workspace).

В этом клоне skills лежат плоско: `docs/agent-skills/<name>/SKILL.md`. Нет `examples/multistack/`, `templates/qa-*` и `sync-to-workspace.sh`. Сценарии занятий и окно преподавателя — в monorepo курса, не в этом репо.

## Слои

| Слой | Где | Роль |
|------|-----|------|
| Rules | `.clinerules/*.md`, `.cursor/rules/*.mdc`, `AGENTS.md` | лимиты |
| Skills | `docs/agent-skills/<name>/SKILL.md` | workflow + DoD |
| RAG | `docs/agent-skills/rag/<id>.md` | факты (2–4 файла на задачу) |
| ADR | `docs/adr/` + цитата в skill | почему (занятие 4) |

Листы A4: [docs/handouts/](../handouts/) — общая карта, по слою, стеки наращивания, login A/B (20–24), абляция (30–35), ДЗ main→develop ([40](../handouts/index.html#40-homework)). Промпты: [HOMEWORK.md](../../HOMEWORK.md).

## Skills

| Skill | Промпт | Занятие | Файл |
|-------|--------|---------|------|
| `qa-smoke-debug` | e2e slice + Allure + flaky | 2 · зачёт | [SKILL.md](qa-smoke-debug/SKILL.md) |
| `qa-write-test` | разработай автотест | 2–4 | [SKILL.md](qa-write-test/SKILL.md) |
| `qa-review-framework` | ревью фреймворка | 2 | [SKILL.md](qa-review-framework/SKILL.md) |
| `qa-homework-check` | self-check сдачи занятия | 2–4 | [SKILL.md](qa-homework-check/SKILL.md) |
| `qa-review-ci` | изучи GHA / Jenkins | 3 | [SKILL.md](qa-review-ci/SKILL.md) |
| `qa-create-ci` | включи Actions / заведи job | 3 · опц. | [SKILL.md](qa-create-ci/SKILL.md) |
| `qa-fix-ci` | почини красный прогон | 3 | [SKILL.md](qa-fix-ci/SKILL.md) |
| `qa-run-ci` | перезапусти workflow/build | 3 | [SKILL.md](qa-run-ci/SKILL.md) |
| `qa-stop-ci` | отмени run/build | 3 | [SKILL.md](qa-stop-ci/SKILL.md) |
| `qa-run-stand` | Gradle на pipeline / stage / prod | 2–4 | [SKILL.md](qa-run-stand/SKILL.md) |
| `qa-pull-takeaway` | точечный adopt из upstream | 3 | [SKILL.md](qa-pull-takeaway/SKILL.md) |
| `qa-setup-host` | DNS / nginx / TLS | 3 · опц. | [SKILL.md](qa-setup-host/SKILL.md) |
| `qa-coverage-audit` | оцени покрытие | 4 | [SKILL.md](qa-coverage-audit/SKILL.md) |
| `qa-pyramid-plan` | план + один ярус | 4 | [SKILL.md](qa-pyramid-plan/SKILL.md) |
| `qa-make-full-pyramid` | ярус за ярусом, уже влитая фича | 4 | [SKILL.md](qa-make-full-pyramid/SKILL.md) |
| `qa-bootstrap-framework` | фреймворк с чеклиста | позже | [SKILL.md](qa-bootstrap-framework/SKILL.md) |

CI: глагол в skill (`review`/`create`/`fix`/`run`/`stop`), раннер в RAG (`ci-github-actions` / `ci-jenkins`). `qa-run-ci` ≠ `qa-run-stand`.  
`qa-make-full-pyramid` ≠ `qa-pyramid-plan` (план + одна дыра) и ≠ `qa-write-test` (один автотест): один вызов = один ярус уже влитой фичи, потом STOP. Контракт фичи — RAG (HTTP CRUD: `crud-http`), не таблица в generic skill. Не заводить JaCoCo pending-список. На текущем `develop` ярусы note закрыты (6/6).  
Не skill: TMS (`test-taxonomy` / `tms-meta`), JaCoCo/Sonar (`quality-gates`). Хост ≠ stand.

## Product skills (не QA)

Когда фича уже в коде — пирамида takeaway после, `qa-make-full-pyramid`. HTTP — тот же `crud-http`. Новый ресурс: тесты модуля сразу; не заводить `jacocoPendingNoteClasses`. На `main` `/api/note` нет.

| Skill | Промпт | ADR | RAG |
|-------|--------|-----|-----|
| `be-add-resource` | ресурс / эндпоинт Spring | [007](../adr/007-backend-api-only.md) | `be-spring-layers` · `be-module-tests` · `crud-http` |
| `fe-add-ui` | панель / экран React | [008](../adr/008-frontend-ds-not-fork.md) | `fe-react-layers` · `fe-ds-contract` · `crud-http` |

Живые файлы: [be-add-resource/SKILL.md](be-add-resource/SKILL.md) · [fe-add-ui/SKILL.md](fe-add-ui/SKILL.md). Якоря — в модулях продукта.

Новый skill: заготовка [_templates/skill-stub.md](_templates/skill-stub.md). Карта RAG: [rag/README.md](rag/README.md).

## Rules

Живые файлы — корень репо: `.clinerules/*.md`. Те же лимиты в Cursor: `.cursor/rules/*.mdc`. Сводка: [AGENTS.md](../../AGENTS.md).

| Файл | Лимит |
|------|--------|
| [01-qa-java-gradle.md](../../.clinerules/01-qa-java-gradle.md) | e2e-команда; **Дыра** если продукт без api/e2e |
| [02-git-safety.md](../../.clinerules/02-git-safety.md) | нет commit без OK |
| [03-env-and-stand.md](../../.clinerules/03-env-and-stand.md) | pipeline / stage / prod, всегда `-Denv` |
| [04-one-task-one-layer.md](../../.clinerules/04-one-task-one-layer.md) | один task = один ярус; дыры называть |
| [05-homework-check.md](../../.clinerules/05-homework-check.md) | self-check ДЗ: таблица + статус, без commit |
| [06-backend-java-spring.md](../../.clinerules/06-backend-java-spring.md) | JSON API, Flyway, JaCoCo; **Дыра** если нет тестов / pending-список |
| [07-frontend-typescript-react.md](../../.clinerules/07-frontend-typescript-react.md) | DS, `lib/`, testid; **Дыра** если UI без RTL-сценария |

## Команда e2e (канон takeaway)

```bash
cd tests/java/tests-java-gradle-junit5-allure3-selenide
./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock
```

Gradle-task `testE2e` **нет**. `@Tag("smoke")` есть на узких методах — **prod slice**, не ярус. На занятии срез = тег `e2e` минус screenshot/mock.

CI: `.github/workflows/ci.yml`. Прод: [https://ai-first.autotests.ai/](https://ai-first.autotests.ai/) (`-Denv=prod`), не матрица `/stack/…`.  
ADR курса (takeaway `docs/adr/`): [005](../adr/005-screenshot-not-layer.md) screenshot ≠ слой, [006](../adr/006-one-note-not-list.md) синглтон note, [007](../adr/007-backend-api-only.md) Spring API-only, [008](../adr/008-frontend-ds-not-fork.md) DS не форк. HTTP — RAG [`crud-http`](rag/crud-http.md) (в этом репо канон — этот файл; в monorepo преподавателя — `docs/rag/testing/crud-http.md`). Не путать с monorepo `docs/adr/005-testing-pyramid-review.md` / `006-allurerc-mjs-ethalon.md`. Проверяльщик школы (преподаватель): monorepo ADR 014 + skill `qa-homework-check`.
