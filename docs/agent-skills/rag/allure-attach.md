---
id: allure-attach
domain: testing
adr: 002
tags: [allure, screenshot]
---
# Allure attachments

**id:** `allure-attach`

Results: `tests/java/tests-java-gradle-junit5-allure3-selenide/build/allure-results`.  
Lifecycle: `TestBase` + `allure/Attachments`.

## Do

- Включать screenshot флагами env / `-DattachLastScreenshot=true`, не копипастой `Selenide.screenshot` в каждом тесте.
- После прогона проверить, что каталог results не пустой.

## Don't

- Удалять `allure-results` без OK.
- `attachHarLogs=true` без Chromium / без HAR — будет пустой attachment.
