# ADR 007 (учебный): backend — JSON API, UI не в Spring

**Статус:** принято  
**Дата:** 2026-08-21

## Контекст

Развилка: Thymeleaf/SSR в `backend-java-spring` vs SPA в `frontend-typescript-react`. Смешать HTML и `/api` в одном JAR дёшево на старте и дорого откатывать: CSRF, деплой, Selenide, матрица фронтов.

## Решение

1. Spring — **только** JSON `/api/**`. UI отдаёт nginx-контейнер фронта.
2. Auth — Bearer JWT, session **STATELESS**, CSRF **выкл.** (нет cookie-credential).
3. Слои — классический Spring: controller → service → repository; схема — Flyway. Как делать — RAG, не этот файл.
4. HTTP-глаголы — RAG `crud-http`, не таблица в skill.

## Последствия

- Не добавлять `@Controller` + шаблоны, static HTML, cookie-session.
- Новый публичный путь — явно в `SecurityConfig`; иначе `/api/**` = authenticated.
- Пирамида takeaway (`tests-java-…`) — отдельный skill, не этот модуль.

## RAG

`be-spring-layers` · `be-module-tests` · `crud-http`
