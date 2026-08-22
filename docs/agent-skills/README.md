# Agent skills (курс AI-first QA)

Workflows для **Cline** (VS Code + Ollama) в учебном Java/Gradle репо.  
В Cursor monorepo аналог другой: `.cursor/skills/` — студентам не копировать.

Карта пака: [PACK.md](PACK.md) · RAG-диета: [rag/README.md](rag/README.md)  
Листы A4 (skill / rule / RAG / ADR): [docs/handouts/](../handouts/)

Контракт HTTP CRUD: SSOT `docs/rag/testing/crud-http.md` → диета `rag/crud-http.md`. Generic skills (`qa-write-test`, `be-add-resource`, `fe-add-ui`) таблицу глаголов не держат. Продукт: `be-add-resource` / `fe-add-ui`; пирамида takeaway — `qa-make-full-pyramid` после влитой фичи.

Контракт HTTP CRUD: SSOT `docs/rag/testing/crud-http.md` → диета `rag/crud-http.md`. Generic skills (`qa-write-test`) таблицу глаголов не держат.

## Структура

```text
docs/agent-skills/
├── PACK.md
├── PACK.md
├── adr/                      ← учебные ADR (занятие 4)
├── rag/                      ← дистиллят чанков (id = имя файла)
├── examples/multistack/      ← заполненный takeaway (команды живые)
└── templates/                ← placeholder'ы + skill-stub.md + adr-stub.md
```

После sync в учебный репо skills лежат плоско: `docs/agent-skills/qa-write-test/SKILL.md`.

## Rule vs Skill vs RAG vs ADR

| | Rule | Skill | RAG | ADR |
|---|------|-------|-----|-----|
| Путь | `.clinerules/`, `.cursor/rules/`, `AGENTS.md` | `docs/agent-skills/<name>/SKILL.md` | `docs/agent-skills/rag/` | `docs/adr/` (занятие 4) |
| Роль | лимиты | workflow + DoD | факты (2–4 файла) | почему |
| Загрузка | авто (toggle) | «прочитай SKILL.md» | путь в skill | skill ссылается |

Листы: [00 обзор](../handouts/index.html#00-overview) · [skill](../handouts/index.html#01-skills) · [rule](../handouts/index.html#02-rules) · [RAG](../handouts/index.html#03-rag) · [ADR](../handouts/index.html#04-adr).  
Login без/с: [сценарий](../handouts/index.html#20-login) · [skill](../handouts/index.html#21-login-skill) · [rule](../handouts/index.html#22-login-rule) · [RAG](../handouts/index.html#23-login-rag) · [ADR](../handouts/index.html#24-login-adr).  
Стеки: [только skill](../handouts/index.html#10-stack-skills) → [+ rules](../handouts/index.html#11-stack-skills-rules) → [+ RAG](../handouts/index.html#12-stack-skills-rules-rag) → [полный](../handouts/index.html#13-stack-skills-rules-rag-adr).  
ДЗ: [40 · main → develop](../handouts/index.html#40-homework) · промпты [HOMEWORK.md](../../HOMEWORK.md).

## Занятие 2

- Преподаватель, второе окно: [teacher-second-workspace.md](../qa-guru/ai-first-qa/lesson-02/teacher-second-workspace.md)
- Сценарий: [scenario-90min.md](../qa-guru/ai-first-qa/lesson-02/scenario-90min.md)
- Worked example: [worked-example-multistack.md](../qa-guru/ai-first-qa/lesson-02/worked-example-multistack.md)

## Занятия 3–4

- [Занятие 3 — RAG + CI](../qa-guru/ai-first-qa/lesson-03/README.md)
- [Занятие 4 — ADR + пирамида](../qa-guru/ai-first-qa/lesson-04/README.md)

Студентам — пути **своего** репо. Не копировать monorepo `projects/…/ethalon/`.
