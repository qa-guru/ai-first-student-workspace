# RAG для курса AI-first QA (диета)

Retrieval-единицы **для учебного репо студента**. Не копия всего `docs/rag/` monorepo (~96 чанков) — Ollama 7b это не удержит.

**SSOT паттернов в monorepo:** `docs/rag/` (преподаватель).  
**Студенту:** эти файлы кладём в `docs/agent-skills/rag/` учебного проекта. Skill пишет: «прочитай `docs/agent-skills/rag/po-fluent.md`».

Якоря кода — **takeaway** `ai-first-student-workspace` (клон [qa-guru/ai-first-student-workspace](https://github.com/qa-guru/ai-first-student-workspace)). Ethalon в monorepo — тот же код в другой раскладке папок.

## Как читать

Один чанк = один `id`. Агент читает **2–4 файла**, не всю папку.  
Лист A4: [03-rag](../../handouts/index.html#03-rag) · карта слоёв: [docs/handouts/](../../handouts/).

| id | Файл | Когда |
|----|------|--------|
| `test-pyramid` | [test-pyramid.md](test-pyramid.md) | какой ярус, не путать slice |
| `test-layers` | [test-layers.md](test-layers.md) | `@Layer` → Gradle `-DincludeTags` |
| `e2e-layers` | [e2e-layers.md](e2e-layers.md) | config / TestBase / pages / tests |
| `po-fluent` | [po-fluent.md](po-fluent.md) | цепочка PO, `return this` |
| `po-locators` | [po-locators.md](po-locators.md) | селекторы только в PO |
| `po-step` | [po-step.md](po-step.md) | `@Step` на методах страницы |
| `test-negative` | [test-negative.md](test-negative.md) | negative login |
| `test-taxonomy` | [test-taxonomy.md](test-taxonomy.md) | Epic / Feature / Tag |
| `tms-meta` | [tms-meta.md](tms-meta.md) | `@AllureId` / `@Issue` |
| `quality-gates` | [quality-gates.md](quality-gates.md) | JaCoCo / Sonar ≠ пирамида; pending exclude не шаблон |
| `adr-when` | [adr-when.md](adr-when.md) | rule/skill/RAG vs ADR |
| `allure-attach` | [allure-attach.md](allure-attach.md) | screenshot / results |
| `allure-reporting-requirements` | [allure-reporting-requirements.md](allure-reporting-requirements.md) | steps по `@Layer` |
| `cfg-env-profile` | [cfg-env-profile.md](cfg-env-profile.md) | `-Denv=` |
| `cfg-stands` | [cfg-stands.md](cfg-stands.md) | pipeline / stage / prod при написании теста |
| `cfg-base-url` | [cfg-base-url.md](cfg-base-url.md) | `baseUrl` / `apiBaseUrl` |
| `ci-gradle-args` | [ci-gradle-args.md](ci-gradle-args.md) | эталонные Gradle-команды |
| `ci-github-actions` | [ci-github-actions.md](ci-github-actions.md) | jobs takeaway `ci.yml` (глаголы — skills `qa-*-ci`) |
| `ci-jenkins` | [ci-jenkins.md](ci-jenkins.md) | jenkins.qa.guru: job, агент, signup |
| `cfg-host` | [cfg-host.md](cfg-host.md) | DNS / nginx / TLS (не stand) |
| `hw-check-verdict` | [hw-check-verdict.md](hw-check-verdict.md) | статус сдачи: принято / нет / ожидает |
| `hw-check-ai-first` | [hw-check-ai-first.md](hw-check-ai-first.md) | рубрика занятий 2–4 |
| `hw-check-voice` | [hw-check-voice.md](hw-check-voice.md) | тон комментария к сдаче |
| `remote-selenoid` | [remote-selenoid.md](remote-selenoid.md) | браузер на хабе |
| `test-api-layer` | [test-api-layer.md](test-api-layer.md) | Rest Assured, не Selenide |
| `crud-http` | [crud-http.md](crud-http.md) | HTTP CRUD: PUT 201/200, PATCH merge-patch; POST только на коллекции (SSOT: monorepo `docs/rag/testing/crud-http.md`) |
| `base-lifecycle` | [base-lifecycle.md](base-lifecycle.md) | `TestBase` setup/teardown |
| `be-spring-layers` | [be-spring-layers.md](be-spring-layers.md) | пакеты Spring + Flyway; skill `be-add-resource` |
| `be-module-tests` | [be-module-tests.md](be-module-tests.md) | unit/slice/integration модуля, JaCoCo 1.0 |
| `fe-react-layers` | [fe-react-layers.md](fe-react-layers.md) | pages / lib / routes / RTL; skill `fe-add-ui` |
| `fe-ds-contract` | [fe-ds-contract.md](fe-ds-contract.md) | DS, `data-testid`, `messages.ts` (ADR 008) |

Занятие 2: явный путь к файлу. Занятие 3: зачем 2–4 чанка, не вся папка. Занятие 4: ADR.
