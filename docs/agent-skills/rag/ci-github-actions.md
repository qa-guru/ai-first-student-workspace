---
id: ci-github-actions
domain: config
adr: 002
tags: [ci, github-actions]
related: [ci-gradle-args, cfg-stands, test-pyramid]
---
# GitHub Actions takeaway

**id:** `ci-github-actions`

Глаголы — skills `qa-review-ci` · `qa-create-ci` · `qa-fix-ci` · `qa-run-ci` · `qa-stop-ci`. Этот чанк — факты YAML. Не путать с `qa-run-stand` (Gradle на app).

`-Denv=` в jobs — как в `ci-gradle-args`.

## Jobs (как `autotests-ai-multistack-app`, без Sonar / TestOps)

```
backend-unit-tests → integration-tests → build-backend
frontend-unit-tests ─┐
tests-harness ───────┴→ ui-mock-tests → build-frontend
tests-harness → api-tests-stage / api-tests / e2e-tests-stage / e2e-tests
build-* → deploy-backend-stage / deploy-frontend-stage
  → api-tests-stage → e2e-tests-stage
  → deploy-backend / deploy-frontend → api-tests → e2e-tests
publish-allure-report (всегда собирает артефакты; Pages — soft)
```

`tests-harness` = `testinfra/` (не слой пирамиды). Красный harness не гоняет mock/api/e2e. Не встраивать шагом внутрь api/e2e — там другой `-DincludeTags` и чужой JaCoCo.

PR: unit / integration / harness / mock. `build-*` и `deploy-*` — `main` / `workflow_dispatch`.  
Deploy skip, если `DEPLOY_HOST` / `STAGE_HOST` пустые.  
Pipeline api/e2e (`-Denv=ci`) — локально (`qa-run-stand`), не job CI. Job `api-tests` / `e2e-tests` = **prod** после SSH.

## Vars / secrets (когда поднимаете свой стенд)

| Ключ | Роль |
|------|------|
| `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_APP_DIR` | SSH prod compose |
| `DEPLOY_COMPOSE_PROJECT` | `--project-name` если на хосте уже есть другой compose (матрица) |
| `DEPLOY_COMPOSE_ENV_FILE` | remap портов (`BACKEND_JAVA_PORT`, `CI_GATEWAY_PORT`) |
| `STAGE_HOST` / `STAGE_USER` / `STAGE_APP_DIR` | SSH stage |
| `STAGE_COMPOSE_PROJECT` / `STAGE_COMPOSE_ENV_FILE` | stage twin |
| `secrets.DEPLOY_SSH_KEY` | ключ |
| `secrets.SELENOID_REMOTE_URL` | хаб с кредами — prod/stage e2e |

В этом файле **нет** TestOps / Telegram / Sonar — это школьный контур позже, не копировать из матрицы.

## CLI (run / stop)

```bash
gh workflow list
gh run list --limit 5
gh workflow run CI
gh run rerun <run-id> --failed
gh run cancel <run-id>
```

## Don't

- Копировать matrix `ci.yml` поверх takeaway.
- Хардкодить `ALLURE_TOKEN` / пароль хаба в YAML.
- Ждать зелёный `deploy-backend`, если DNS ещё не поднят — смотрите jobs на PR.
