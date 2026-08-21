# Rule · Skill · RAG · ADR

Учебные листы A4 (альбом) для занятий 2–4. Лежат в **этом** репо — их смотрят и печатают студенты.

**Открыть:** [index.html](index.html) в репо · live: [qa-guru.github.io/…/docs/handouts/](https://qa-guru.github.io/ai-first-student-workspace/docs/handouts/index.html). Клик по строке прыгает к листу **на этой же странице**.

## Итог

Промпт живёт в чате и умирает вместе с ним. Четыре файла живут в git:

| Слой | Вопрос | Где | Загрузка |
|------|--------|-----|----------|
| **Skill** | Как сделать задачу? | `docs/agent-skills/<name>/SKILL.md` | «прочитай SKILL.md» |
| **Rule** | Что нельзя всегда? | `.clinerules/`, `.cursor/rules/`, `AGENTS.md` | авто (toggle) |
| **RAG** | Откуда факт? | `docs/agent-skills/rag/<id>.md` | 2–4 пути из skill |
| **ADR** | Почему A, не B? | `docs/adr/` | skill ссылается |

Один файл на 500 строк — антипаттерн. В IDE rule включается сам; skill — по промпту; RAG — только названные чанки; ADR — «почему так», не копия skill.

Канон на одном сценарии: *неверный пароль на логине*.

- UI: `LoginTests#shouldShowErrorWhenPasswordIsWrong` + `pages/LoginPage` (`data-testid`)
- HTTP 401: `AuthApiTests#loginWithInvalidPassword`
- Команда: `./gradlew test -Denv=ci -DincludeTags=e2e -Dtest=LoginTests#shouldShowErrorWhenPasswordIsWrong`  
  Gradle-task `testE2e` **нет**. `@Tag("smoke")` — prod slice, не ярус.

Без слоя агент типично: свой `ChromeDriver`, CSS в `*Tests`, `localhost`, full suite, commit, выдуманный `testE2e`, второй e2e «на 401», `@Layer("screenshot")`. Со слоями — канон выше. Открытый код в IDE — это **сцена**, не пятый слой (иначе копипаст happy → sad).

Линейка занятий: skill → + rule (занятие 2) → + RAG (3) → + ADR (4).

Пак: [PACK.md](../agent-skills/PACK.md). Внешность листов — токены design-system (тёмный surface, panel chrome).

## По одной на слой + общая

- [00 · Общая карта](index.html#00-overview) — четыре вопроса, чайник = прогон e2e, quiz
- [01 · Skill](index.html#01-skills) — маршрутный лист, пак, глагол+объект
- [02 · Rule](index.html#02-rules) — ПДД, пять files takeaway
- [03 · RAG](index.html#03-rag) — 2–4 карточки, диета
- [04 · ADR](index.html#04-adr) — почему A не B, 005 / 006

## Login · без слоя / со слоем

Промпт: «Добавь автотест на неуспешный логин с неправильным паролем». Без «не коммить» в чате — это Rule. Слева — ответ без слоя, справа — канон.

- [20 · сценарий](index.html#20-login) — что уже в репо
- [21 · skill](index.html#21-login-skill) — ChromeDriver vs `qa-write-test`
- [22 · rule](index.html#22-login-rule) — full suite / commit vs tags + `-Denv`
- [23 · RAG](index.html#23-login-rag) — `$("input")` vs `data-testid`
- [24 · ADR](index.html#24-login-adr) — e2e на 401 vs api + screenshot-slice

## Login · живой опыт (абляция)

Тот же промпт, две вкладки. Ctx (открытый код) всегда в кадре — не путать со слоем.

- [30 · микропроект](index.html#30-login-micro) — `LoginTests` + `LoginPage`
- [31 · полный стек](index.html#31-login-full) — канон `shouldShowErrorWhenPasswordIsWrong`
- [32 · полный − 1](index.html#32-login-minus-one) — у каждого слоя своя галлюцинация
- [33 · пары](index.html#33-login-pairs) — 2 из 4
- [34 · одиночки / пусто](index.html#34-login-singles) — 1 из 4 и «учебный интернет»
- [35 · ctx ≠ слой](index.html#35-login-context) — открытый канон кормит копипаст

Перед live закомментируй `shouldShowErrorWhenPasswordIsWrong`. New Agent после смены слоёв. На занятии достаточно полного стека + «ничего»; пары — с листа.

## Наращивание

- [10 · skills](index.html#10-stack-skills) — только skill: есть маршрут, нет тормозов
- [11 · skills + rules](index.html#11-stack-skills-rules) — занятие 2
- [12 · + RAG](index.html#12-stack-skills-rules-rag) — занятие 3
- [13 · полный стек](index.html#13-stack-skills-rules-rag-adr) — занятие 4

## Домашка

- [40 · ДЗ · main → develop](index.html#40-homework) — два промпта, блок «Сдача ДЗ»; тексты: [HOMEWORK.md](../../HOMEWORK.md)

## Печать

PDF: [pdf/](pdf/). Пересборка:

```bash
cd docs/handouts
./assemble-index.sh
./render-pdf.sh
```

Нужен Google Chrome. Печать из HTML: A4 альбомная, поля 0, фоновая графика ON.
