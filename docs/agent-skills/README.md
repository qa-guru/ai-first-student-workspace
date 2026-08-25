# Agent skills (курс AI-first QA)

Workflows для **Cline** (VS Code + Ollama) в учебном Java/Gradle репо.  
В Cursor те же лимиты: `.cursor/rules/*.mdc` + этот каталог. Не копировать monorepo `.cursor/skills/`.

Карта пака: [PACK.md](PACK.md) · RAG-диета: [rag/README.md](rag/README.md)  
Листы A4 (skill / rule / RAG / ADR): [docs/handouts/](../handouts/)

Контракт HTTP CRUD: в этом репо — [`rag/crud-http.md`](rag/crud-http.md). Generic skills (`qa-write-test`, `be-add-resource`, `fe-add-ui`) таблицу глаголов не держат. Продукт: `be-add-resource` / `fe-add-ui`; пирамида takeaway — `qa-make-full-pyramid` после влитой фичи.

## Структура

```text
docs/agent-skills/
├── PACK.md                   ← каталог skills / rules / RAG / ADR
├── README.md
├── _templates/               ← skill-stub.md, adr-stub.md
├── rag/                      ← дистиллят чанков (id = имя файла)
├── <name>/SKILL.md           ← QA-skills (qa-smoke-debug, …)
├── be-add-resource/SKILL.md
└── fe-add-ui/SKILL.md
```

ADR занятия 4 — в `docs/adr/`, не здесь. Нет `examples/multistack/` и `templates/qa-*`.

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

## Занятия 2–4

Сценарии, второе окно преподавателя и полные чеклисты сдачи — в **monorepo курса**, не в этом студенческом клоне. Self-check здесь: skill [`qa-homework-check`](qa-homework-check/SKILL.md) + RAG `hw-check-ai-first`.

Студентам — пути **своего** репо. Не копировать monorepo `projects/…/ethalon/`.
