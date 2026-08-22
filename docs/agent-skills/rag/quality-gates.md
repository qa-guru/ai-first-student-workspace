---
id: quality-gates
domain: testing
adr: 005
tags: [jacoco, sonar, coverage, pyramid]
related: [test-pyramid, be-module-tests]
---
# JaCoCo / Sonar ≠ пирамида

**id:** `quality-gates`

Три разные оси. Их нельзя складывать в одно число «покрытие 100%».  
Пирамида считается **целиком** (сценарии продукта × верный ярус), не как «каждый `@Layer` довести до 100%».

| Ось | Что меряет | В takeaway сейчас |
|-----|------------|-------------------|
| Пирамида | сценарий на верном `@Layer` | таблица `qa-coverage-audit` |
| JaCoCo | % строк/веток **unit** backend | `backend/java/backend-java-spring`: LINE+BRANCH **1.0** (CI job `backend-unit-tests`) |
| Vitest coverage | % JS/TS component | job `frontend-unit-tests` (`npm test -- --coverage`) |
| Sonar QG | bugs / smells / duplications / coverage ingest | школьный [sonar.qa.guru](https://sonar.qa.guru) — **опционально**; в `ci.yml` takeaway **нет** Sonar |

E2e/Selenide **не** кормит JaCoCo живого Spring. «100% e2e» строками — бессмыслица.

`jacocoPendingNoteClasses` в `backend/java/backend-java-spring/build.gradle` — дыра занятия (заметка без unit), не шаблон. Не расширять. Снимать на ярусе **unit** (`qa-make-full-pyramid`). Зелёный гейт с непустым списком ≠ «модуль покрыт». Фронт: не понижать пол в `vitest.config.ts`; stub fetch ≠ покрытие сценария.

## Do

- Backend unit: оставить (или довести) `jacocoTestCoverageVerification`.
- Дыры сценариев закрывать ярусом (`qa-pyramid-plan`), не «ещё e2e».
- Sonar: отдельный projectKey на модуль (`student-<login>-backend` / `-frontend` / `-tests`), не один mega-key.
- Пока нет `SONAR_TOKEN` — **предложить** wiring, не ломать CI.

## Don't

- Требовать 100% line на фронте в первом гейте.
- Расширять JaCoCo exclude под новую фичу; понижать `minimum = 1.0`.
- Включать `SONAR_REQUIRED=true` до зелёного QG на дашборде.
- Класть токен в workflow-файл или в чат.
