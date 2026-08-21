# Домашка: два запроса

Нужен **Docker Desktop** (запущен) и аккаунт GitHub.

Не коммить в `qa-guru`. Не `git push` / `git reset --hard`. Не гонять prod.

Свой DNS/nginx — **опционально**, отдельный task: skill `qa-setup-host` + RAG `cfg-host`. Витрина курса уже на [ai-first.autotests.ai](https://ai-first.autotests.ai/).

Лист A4: [docs/handouts/index.html#40-homework](docs/handouts/index.html#40-homework).

---

## ДЗ-1 · ветка `main` · живой стенд

1. Форкни https://github.com/qa-guru/ai-first-student-workspace (кнопка **Fork**). Не клонируй `qa-guru` напрямую.
2. Cursor или VS Code + Cline: **Open Folder** → новая пустая папка.
3. Вставь промпт ДЗ-1. Дождись конца (clone **твоего форка** + `main` + compose + e2e).
4. Сдай в чат курса блок **«Сдача ДЗ»** из ответа агента.

На `main` нет `/api/note` — так и должно быть.

### Промпт ДЗ-1

```text
Пустой workspace. Сделай takeaway рабочим локально с ветки main. Не коммить. Не push. Не prod. Не git reset --hard.

Цель этого ДЗ — живой стенд и зелёный учебный e2e. Фичу note не пиши (её нет на main).

1) Не клонируй https://github.com/qa-guru/ai-first-student-workspace.git
   Работать только со СВОИМ форком.

   Если форка ещё нет:
   gh repo fork qa-guru/ai-first-student-workspace --clone=false
   Затем clone форка в текущую папку:
   git clone "https://github.com/$(gh api user --jq .login)/ai-first-student-workspace.git" .
   Если gh нет — спроси мой GitHub login и клонируй
   https://github.com/<login>/ai-first-student-workspace.git
   Если папка не пустая — clone в подкаталог и работай там.

   Проверь: git remote -v → origin = мой форк, не qa-guru.
   Явно: git checkout main.

2) Rules ON. Прочитай AGENTS.md, .cursor/rules/ (или .clinerules/),
docs/agent-skills/qa-smoke-debug/SKILL.md
и только чанки docs/agent-skills/rag/ci-gradle-args.md, cfg-stands.md, allure-attach.md.
Не читай всю папку rag/.

3) В корне репо:
docker compose up -d --build
curl -sf http://localhost:8800/api/health
UI: http://localhost:9821/ (не :9811)

4) Учебный e2e (нет task testE2e; @Tag("smoke") — prod slice, не эта команда):
cd tests-java-gradle-junit5-allure3-selenide
./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock

5) ДЗ готово только если все пункты ниже истинны. Иначе статус «не сдано» и что чинить — без commit.
   - origin указывает на мой форк, не на qa-guru
   - текущая ветка = main
   - health :8800 → HTTP 2xx
   - UI открывается с gateway :9821
   - Gradle-команда ровно с -Denv=ci и -DincludeTags=e2e -DexcludeTags=screenshot,mock
   - exit code = 0, failed = 0
   - каталог tests-java-gradle-junit5-allure3-selenide/build/allure-results не пустой
   - в git нет нового commit / push

6) В конце ответа — один блок «Сдача ДЗ». Его человек копирует в чат курса. Не эссе, заполни факты:

## Сдача ДЗ
- Форк: https://github.com/<login>/ai-first-student-workspace
- Origin: (вывод git remote -v, строка origin)
- Ветка: main
- Health: curl -sf http://localhost:8800/api/health → <код/тело>
- UI: http://localhost:9821/
- Команда:
  cd tests-java-gradle-junit5-allure3-selenide
  ./gradlew test -Denv=ci -DincludeTags=e2e -DexcludeTags=screenshot,mock
- Exit code: <N>
- Tests: run=<N> failed=<N>
- Allure results: tests-java-gradle-junit5-allure3-selenide/build/allure-results
- Статус: сдано / не сдано
```

---

## ДЗ-2 · ветка `develop` · note + план пирамиды

Делай **после** принятого ДЗ-1, в том же репозитории (новый чат агента).

1. Вставь промпт ДЗ-2.
2. Агент встаёт на `develop`, пересобирает compose, проверяет `/api/note`, пишет **план** пирамиды.
3. Сдай в чат курса блок **«Сдача ДЗ»**. Тесты note и ярусы takeaway в этом ДЗ **не пишут**.

Фича уже на `develop` (`NoteController`, `note-panel`, ADR 006). Дальше, отдельными чатами: «следующий ярус» по `qa-make-full-pyramid`.

### Промпт ДЗ-2

```text
Репозиторий уже развёрнут с прошлого ДЗ (main + compose + e2e). Это второе ДЗ: ветка develop с фичей note и ПЛАН пирамиды. Не коммить. Не push. Не prod. Не git reset --hard.

Фичу note не реализуй — она уже на develop. Автотесты note не пиши. qa-make-full-pyramid не открывай, пока я не скажу «следующий ярус».

1) Встань на develop.
   origin = мой форк. Если origin/develop нет:
   git remote add upstream https://github.com/qa-guru/ai-first-student-workspace.git
   (если upstream уже есть — не дублируй)
   git fetch origin
   git fetch upstream  (если remote есть)
   git checkout develop
   либо git checkout -B develop upstream/develop
   Проверь: git branch --show-current = develop.
   Не мержи develop в main.

2) Пересобери локальный pipeline-стенд (новая миграция + UI):
   в корне: docker compose up -d --build
   curl -sf http://localhost:8800/api/health
   UI: http://localhost:9821/
   Проверка фичи, не тесты:
   curl -s -o /dev/null -w "%{http_code}" http://localhost:9821/api/note
   (без токена ожидаем 401, не 404).
   В коде: NoteController, ADR 006, data-testid="note-panel".

3) Rules ON. Только после checkout develop прочитай:
   AGENTS.md
   docs/agent-skills/qa-coverage-audit/SKILL.md
   docs/agent-skills/qa-pyramid-plan/SKILL.md
   docs/adr/006-one-note-not-list.md
   и только RAG: test-pyramid, crud-http, cfg-stands, adr-when.
   Контекст: docs/lessons/note-crud-pyramid.md — сверка после своего плана, не копируй таблицу как ответ.
   Не читай всю папку rag/.

4) Составь план 100% пирамиды по уже влитой фиче /api/note.
   Inventory: backend unit/integration, frontend component, tests api/e2e/manual — что есть по note, чего нет.
   Таблица: сценарий × unit × integration × component × api × e2e × manual × дыра?
   Канон HTTP — RAG crud-http (синглтон: PUT 201/200, нет POST и нет 409; PATCH только api; один e2e happy-path).
   Slice (smoke / screenshot / mock) ≠ ярус. JaCoCo ≠ «100% пирамиды».
   Для каждой дыры: ярус + класс-якорь + стенды (pipeline / stage / prod). Delete на prod — фабрика+teardown, не сид user1.
   Порядок, когда начнём закрывать: unit → integration → component → api → e2e → manual.
   Реализацию не начинай.

5) ДЗ готово только если все пункты ниже истинны. Иначе статус «не сдано» и что чинить — без commit.
   - текущая ветка = develop (не main)
   - health :8800 → HTTP 2xx
   - GET /api/note без токена → 401 (фича на стенде есть)
   - в ответе есть таблица сценарий × ярус, не «у нас всё покрыто» без таблицы
   - названы 3 приоритетные дыры: ярус + якорь + почему не e2e
   - у каждой дыры стенды: pipeline / stage / prod
   - в плане нет POST+409 на синглтоне и нет @Layer("screenshot") / @Layer("smoke")
   - файлы тестов note не созданы и не изменены
   - в git нет нового commit / push

6) В конце ответа — один блок «Сдача ДЗ». Его человек копирует в чат курса. Не эссе, заполни факты:

## Сдача ДЗ
- Форк: https://github.com/<login>/ai-first-student-workspace
- Origin: (git remote -v, строка origin)
- Ветка: develop
- Health: curl -sf http://localhost:8800/api/health → <код/тело>
- UI: http://localhost:9821/
- GET /api/note без токена: <HTTP-код, ожидаем 401>
- Фича в коде: NoteController + note-panel — да/нет
- Покрытие takeaway по note: <N>/6 ярусов (на develop должно быть 0/6)
- Таблица плана: (вставь таблицу сценарий × unit × int × cmp × api × e2e × man × дыра)
- 3 дыры:
  1) <сценарий> → ярус <…> → якорь <класс> → стенды <pipeline/stage/prod> → почему не e2e
  2) …
  3) …
- Следующий ярус (когда скажут): unit
- Тесты note в этом ДЗ: не писались
- Статус: сдано / не сдано
```
