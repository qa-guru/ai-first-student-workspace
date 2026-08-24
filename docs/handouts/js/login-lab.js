(function () {
  "use strict";

  var LAYERS = ["ctx", "skill", "rule", "rag", "adr"];
  var HASH_TO_LAYER = { c: "ctx", s: "skill", r: "rule", g: "rag", a: "adr" };
  var LAYER_TO_HASH = { ctx: "c", skill: "s", rule: "r", rag: "g", adr: "a" };
  var LABELS = { ctx: "Context", skill: "Skill", rule: "Rule", rag: "RAG", adr: "ADR" };

  var PRESETS = [
    { id: "full", label: "всё включено", state: { ctx: true, skill: true, rule: true, rag: true, adr: true } },
    { id: "empty", label: "включен только контекст", state: { ctx: true, skill: false, rule: false, rag: false, adr: false } },
    { id: "meta", label: "включены только ии-meta", state: { ctx: false, skill: true, rule: true, rag: true, adr: true } },
    { id: "noct", label: "все выключено", state: { ctx: false, skill: false, rule: false, rag: false, adr: false } }
  ];

  var IDES = ["cursor", "cline", "claude", "codex"];
  var IDE_TO_HASH = { cursor: "c", cline: "l", claude: "a", codex: "x" };
  var HASH_TO_IDE = { c: "cursor", l: "cline", a: "claude", x: "codex", "1": "cursor", "0": "cline" };

  var FULL = { ctx: true, skill: true, rule: true, rag: true, adr: true };
  var state = { ctx: true, skill: true, rule: true, rag: true, adr: true };
  var ide = "cursor";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var KW = {
    void: 1, class: 1, new: 1, public: 1, private: 1, protected: 1, static: 1,
    final: 1, return: 1, if: 1, else: 1, extends: 1, import: 1, package: 1, true: 1,
    false: 1, null: 1, this: 1, var: 1, boolean: 1, int: 1, long: 1,
    def: 1, from: 1, assert: 1, in: 1, and: 1, or: 1, not: 1
  };

  function tok(cls, s) {
    return '<span class="tok tok--' + cls + '">' + esc(s) + "</span>";
  }

  function highlight(text) {
    var html = "";
    var i = 0;
    var n = text.length;
    while (i < n) {
      var ch = text.charAt(i);
      if (ch === "/" && text.charAt(i + 1) === "/") {
        html += tok("cmt", text.slice(i));
        break;
      }
      if (ch === "#" && (i === 0 || /\s/.test(text.charAt(i - 1)))) {
        html += tok("cmt", text.slice(i));
        break;
      }
      if (ch === '"') {
        var j = i + 1;
        while (j < n) {
          if (text.charAt(j) === "\\") {
            j += 2;
            continue;
          }
          if (text.charAt(j) === '"') {
            j++;
            break;
          }
          j++;
        }
        html += tok("str", text.slice(i, j));
        i = j;
        continue;
      }
      if (ch === "@" && /[A-Za-z]/.test(text.charAt(i + 1))) {
        var j = i + 1;
        while (j < n && /[A-Za-z0-9]/.test(text.charAt(j))) j++;
        html += tok("ann", text.slice(i, j));
        i = j;
        continue;
      }
      if (/[0-9]/.test(ch)) {
        var j = i;
        while (j < n && /[0-9]/.test(text.charAt(j))) j++;
        html += tok("num", text.slice(i, j));
        i = j;
        continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        var j = i + 1;
        while (j < n && /[A-Za-z0-9_$]/.test(text.charAt(j))) j++;
        var w = text.slice(i, j);
        var k = j;
        while (k < n && text.charAt(k) === " ") k++;
        if (KW[w]) html += tok("kw", w);
        else if (text.charAt(k) === "(") html += tok("fn", w);
        else if (/^[A-Z]/.test(w) && (i === 0 || text.charAt(i - 1) !== "-")) html += tok("type", w);
        else html += esc(w);
        i = j;
        continue;
      }
      html += esc(ch);
      i++;
    }
    return html;
  }

  function ln(kind, text) {
    return { kind: kind, text: text };
  }

  function panel(id, title, kind, lines, extraOf) {
    return { id: id, title: title, kind: kind, lines: lines, extraOf: extraOf || "" };
  }

  function withExtras(mains, extras) {
    var out = [];
    mains.forEach(function (p) {
      out.push(p);
      extras.forEach(function (e) {
        if (e.extraOf === p.id) out.push(e);
      });
    });
    return out;
  }

  function compose(s) {
    var ctx = s.ctx;
    var skill = s.skill;
    var rule = s.rule;
    var rag = s.rag;
    var adr = s.adr;
    var n = (skill ? 1 : 0) + (rule ? 1 : 0) + (rag ? 1 : 0) + (adr ? 1 : 0);
    var holds = [];
    var holes = [];
    var cls = skill ? "LoginTests" : "LoginSadPathTests";
    var method = skill ? "shouldShowErrorWhenPasswordIsWrong" : "testWrongPassword";

    if (ctx) holds.push({ layer: "ctx", text: "открыты LoginTests, LoginPage и HomePage" });
    if (skill) holds.push({ layer: "skill", text: "пишет в PO и гоняет один метод" });
    if (rule) holds.push({ layer: "rule", text: "не гоняет весь suite и сам не коммитит" });
    if (rag) holds.push({ layer: "rag", text: "берёт data-testid и текст ошибки из карточек" });
    if (adr) holds.push({ layer: "adr", text: "401 не кликает, screenshot не считает слоем" });

    if (!ctx) {
      holes.push({
        layer: "ctx",
        text: n === 0
          ? "вкладки закрыты, не видит что репо на Java — пишет pytest"
          : "вкладки закрыты, не на что опереться"
      });
    }
    if (!skill) holes.push({ layer: "skill", text: "новый класс, гоняет всё подряд, DoD нет" });
    if (!rule) holes.push({ layer: "rule", text: "весь suite, коммит, localhost в коде" });
    if (!rag) {
      holes.push({
        layer: "rag",
        text: ctx
          ? "копирует successful login, не расширяет PO, текст ошибки выдумывает"
          : n === 0
            ? "селекторы с потолка, pytest"
            : "берёт $(\"input\") и «Invalid credentials»"
      });
    }
    if (!adr) holes.push({ layer: "adr", text: "ещё полезет e2e на 401 и повесит @Layer(screenshot)" });

    var verdict;
    if (n === 4) verdict = "Все слои включены. Тест как в репо.";
    else if (n === 0 && ctx) verdict = "Слоёв нет, вкладки открыты. Спишет с successful login или сунет ChromeDriver.";
    else if (n === 0) verdict = "Ни слоёв, ни вкладок. Не понял, что это Java, написал pytest.";
    else if (!rag) verdict = "Без RAG смотрит на successful login и копирует его на неверный пароль.";
    else if (!rule) verdict = "Без rule сам тест может быть ок, но гоняет весь suite и коммитит сам.";
    else if (!skill) verdict = "Без skill тест иногда выходит, но в новом классе и без «как гонять».";
    else verdict = "Без ADR полезет e2e на 401 и сделает screenshot слоем.";

    function pack(panels) {
      return { panels: panels, holds: holds, holes: holes, n: n, verdict: verdict };
    }

    if (n === 0 && !ctx) {
      return pack([
        panel("test", "test · test_login.py", "bad", [
          ln("dim", "# вкладок не было, Java не увидел"),
          ln("dim", "from selenium import webdriver"),
          ln("dim", ""),
          ln("bad", "def test_wrong_password():"),
          ln("bad", "    driver = webdriver.Chrome()"),
          ln("bad", "    driver.get(\"http://localhost:3000/login\")"),
          ln("bad", "    driver.find_element(\"css selector\", \"input\").send_keys(\"admin\")"),
          ln("bad", "    driver.find_element(\"css selector\", \"#password\").send_keys(\"123\")"),
          ln("bad", "    driver.find_element(\"css selector\", \"button\").click()"),
          ln("bad", "    assert \"Invalid credentials\" in driver.page_source")
        ]),
        panel("page", "page · LoginPage.java", "bad", [
          ln("dim", "// LoginPage.java агент не видел"),
          ln("dim", ""),
          ln("dim", "// локаторы не вынес — CSS в pytest:"),
          ln("bad", "driver.find_element(\"css selector\", \"input\")"),
          ln("bad", "driver.find_element(\"css selector\", \"#password\")"),
          ln("bad", "driver.find_element(\"css selector\", \"button\")")
        ]),
        panel("home", "page · HomePage.java", "bad", [
          ln("dim", "// HomePage.java агент не видел"),
          ln("dim", ""),
          ln("bad", "// shouldHaveWelcomeMessage — не видел, откуда Welcome")
        ]),
        // cli = шелл (#). Java open() / // — в test/page.
        panel("cli", "cli · терминал", "bad", [
          ln("bad", "pytest test_login.py"),
          ln("bad", "git commit -am \"add login test\""),
          ln("dim", ""),
          ln("bad", "# в этом репо такого файла нет")
        ]),
        panel("gradle", "build · build.gradle", "bad", [
          ln("dim", "// Gradle не видел"),
          ln("bad", "# pom.xml / requirements.txt из головы"),
          ln("bad", "selenium==4.15.2"),
          ln("bad", "pytest==8.3.2")
        ]),
        panel("props", "props · default.properties", "bad", [
          ln("dim", "# properties не видел"),
          ln("bad", "baseUrl=http://localhost:3000/"),
          ln("bad", "# -Denv= нет")
        ]),
        panel("ci", "ci · ci.yml", "bad", [
          ln("dim", "# GitHub Actions не видел"),
          ln("bad", "name: pytest"),
          ln("bad", "jobs:"),
          ln("bad", "  e2e:"),
          ln("bad", "    steps:"),
          ln("bad", "      - run: pytest test_login.py")
        ])
      ]);
    }

    var testLines = [];
    if (skill) {
      testLines.push(ln("ok", "// расширил существующий класс"));
      testLines.push(ln("dim", ""));
      testLines.push(ln("ok", "@Layer(\"e2e\")"));
      if (!adr) {
        testLines.push(ln("bad", "@Layer(\"screenshot\")"));
        testLines.push(ln("bad", "// нет ADR 005 — screenshot не слой"));
      }
      testLines.push(ln("ok", "@Epic(\"Authentication\")"));
      testLines.push(ln("ok", "@Feature(\"Login\")"));
      testLines.push(ln("ok", "class LoginTests extends TestBase {"));
    } else {
      testLines.push(ln("bad", "// новый файл, не LoginTests"));
      testLines.push(ln("dim", ""));
      if (!adr) {
        testLines.push(ln("bad", "@Layer(\"screenshot\")"));
        testLines.push(ln("bad", "// нет ADR"));
      } else {
        testLines.push(ln("dim", "@Layer(\"e2e\")"));
      }
      testLines.push(ln("bad", "class LoginSadPathTests {"));
    }

    testLines.push(ln("dim", ""));
    testLines.push(ln(skill ? "ok" : (!adr ? "bad" : "dim"), "  @Test"));
    if (skill) {
      testLines.push(ln("ok", "  @Tag(\"e2e\")"));
      testLines.push(ln("ok", "  @Tag(\"negative\")"));
    } else if (!adr) {
      testLines.push(ln("bad", "  @Tag(\"e2e\")"));
      testLines.push(ln("bad", "  @Tag(\"api\")"));
      testLines.push(ln("bad", "  // два слоя, нет skill"));
    } else {
      testLines.push(ln("dim", "  @Tag(\"e2e\")"));
    }

    testLines.push(ln(skill ? "ok" : "dim", "  @DisplayName(\"Wrong password shows readable error\")"));
    testLines.push(ln(skill ? "ok" : "dim", "  void " + method + "() {"));

    if (rag) {
      if (!rule) {
        testLines.push(ln("bad", "    open(\"http://localhost:9821/login\");"));
        testLines.push(ln("ok", "    loginPage.typeUsername(\"user1\")"));
      } else {
        testLines.push(ln("ok", "    loginPage.openPage()"));
        testLines.push(ln("ok", "        .typeUsername(\"user1\")"));
      }
      testLines.push(ln("ok", "        .typePassword(\"wrongpassword\")"));
      testLines.push(ln("ok", "        .submitExpectingError()"));
      testLines.push(ln("ok", "        .shouldHaveErrorMessage(\"Wrong login or password\");"));
    } else if (ctx) {
      if (!rule) {
        testLines.push(ln("bad", "    open(\"http://localhost:9821/login\");"));
        testLines.push(ln("bad", "    loginPage.fillAndSubmitForm(\"user1\", \"wrongpassword\")"));
      } else {
        testLines.push(ln("bad", "    loginPage.openPage()"));
        testLines.push(ln("bad", "        .fillAndSubmitForm(\"user1\", \"wrongpassword\")"));
      }
      testLines.push(ln("bad", "        .shouldHaveWelcomeMessage(\"Welcome, user1!\");"));
      testLines.push(ln("dim", "    // открыт successful login, sad path срисован оттуда"));
      testLines.push(ln("bad", "    // или: $(\".alert\").shouldHave(text(\"Invalid credentials\"));"));
    } else if (skill) {
      if (!rule) {
        testLines.push(ln("bad", "    open(\"http://localhost:9821/login\");"));
        testLines.push(ln("bad", "    loginPage.setUser(\"user1\").setPass(\"123\").clickLogin();"));
      } else {
        testLines.push(ln("bad", "    loginPage.openPage()"));
        testLines.push(ln("bad", "        .setUser(\"user1\").setPass(\"123\").clickLogin();"));
      }
      testLines.push(ln("bad", "    $(\".alert\").shouldHave(text(\"Invalid credentials\"));"));
    } else {
      testLines.push(ln("bad", "    WebDriver d = new ChromeDriver();"));
      if (!rule) testLines.push(ln("bad", "    d.get(\"http://localhost:9821/login\");"));
      else {
        testLines.push(ln("ok", "    open(\"/login\");"));
        testLines.push(ln("ok", "    // URL не в Java"));
      }
      testLines.push(ln("bad", "    $(\"input\").setValue(\"user1\");"));
      testLines.push(ln("bad", "    $(\"input[type=password]\").setValue(\"wrong\");"));
      testLines.push(ln("bad", "    $(\"button\").click();"));
      testLines.push(ln("bad", "    assertEquals(\"Invalid credentials\", $(\".err\").text());"));
    }

    testLines.push(ln("dim", "  }"));
    testLines.push(ln("dim", "}"));

    var pageLines;
    var pageKind;
    if (rag) {
      pageKind = "ok";
      pageLines = [
        ln("ok", "// расширил LoginPage"),
        ln("dim", ""),
        ln("ok", "class LoginPage {"),
        ln("dim", ""),
        ln("ok", "  errorMessage = $(\"[data-testid='error-message']\");"),
        ln("dim", ""),
        ln("ok", "  LoginPage submitExpectingError() {"),
        ln("ok", "    submitButton.click();"),
        ln("ok", "    errorMessage.shouldBe(visible);"),
        ln("ok", "    return this;"),
        ln("dim", "  }"),
        ln("dim", ""),
        ln("ok", "  LoginPage shouldHaveErrorMessage(String message) {"),
        ln("ok", "    errorMessage.shouldHave(text(message));"),
        ln("ok", "    return this;"),
        ln("dim", "  }"),
        ln("dim", "}")
      ];
    } else if (ctx) {
      pageKind = "bad";
      pageLines = [
        ln("dim", "// не расширил LoginPage — срисовал happy path"),
        ln("dim", ""),
        ln("dim", "class LoginPage {"),
        ln("dim", ""),
        ln("dim", "  HomePage fillAndSubmitForm(String username, String password) {"),
        ln("dim", "    typeUsername(username).typePassword(password).submit();"),
        ln("dim", "    return new HomePage();"),
        ln("dim", "  }"),
        ln("dim", ""),
        ln("bad", "  // errorMessage — не добавил"),
        ln("bad", "  // submitExpectingError() — не добавил"),
        ln("bad", "  // shouldHaveErrorMessage(String message) — не добавил"),
        ln("dim", "}")
      ];
    } else if (skill) {
      pageKind = "bad";
      pageLines = [
        ln("bad", "// навыдумал PO — локаторы не вынес"),
        ln("dim", ""),
        ln("bad", "class LoginPage {"),
        ln("dim", ""),
        ln("bad", "  LoginPage setUser(String username) {"),
        ln("bad", "    $(\"#login\").setValue(username);"),
        ln("bad", "    return this;"),
        ln("dim", "  }"),
        ln("bad", "  LoginPage setPass(String password) {"),
        ln("bad", "    $(\"#password\").setValue(password);"),
        ln("bad", "    return this;"),
        ln("dim", "  }"),
        ln("bad", "  void clickLogin() {"),
        ln("bad", "    $(\"button\").click();"),
        ln("dim", "  }"),
        ln("dim", "}")
      ];
    } else {
      pageKind = "bad";
      pageLines = [
        ln("dim", "// LoginPage не открывал"),
        ln("dim", ""),
        ln("dim", "// локаторы не вынес — CSS в *Tests:"),
        ln("bad", "$(\"input\")"),
        ln("bad", "$(\"input[type=password]\")"),
        ln("bad", "$(\"button\")"),
        ln("bad", "$(\".err\")")
      ];
    }

    var homeKind;
    var homeLines;
    if (ctx) {
      homeKind = "ok";
      homeLines = [
        ln("dim", "// не трогал — Welcome уже на HomePage"),
        ln("dim", ""),
        ln("dim", "class HomePage {"),
        ln("dim", ""),
        ln("dim", "  welcomeMessage = $(\"[data-testid='welcome-message']\");"),
        ln("dim", ""),
        ln("dim", "  HomePage shouldHaveWelcomeMessage(String message) {"),
        ln("dim", "    welcomeMessage.shouldHave(text(message));"),
        ln("dim", "    return this;"),
        ln("dim", "  }"),
        ln("dim", "}")
      ];
    } else {
      homeKind = "bad";
      homeLines = [
        ln("dim", "// HomePage не открывал"),
        ln("dim", ""),
        ln("bad", "// shouldHaveWelcomeMessage — не видел, откуда Welcome")
      ];
    }

    // cli · терминал = шелл (#). Java open() / // — в test/page, не сюда.
    var runLines = [];
    if (!rag && (skill || rule || adr)) {
      runLines.push(ln("bad", "./gradlew testE2e                      # такого task нет"));
    } else if (!rag) {
      runLines.push(ln("bad", "./gradlew test                         # full suite · учебный интернет"));
    } else if (rule && skill) {
      runLines.push(ln("ok", "cd tests/java/tests-java-gradle-junit5-allure3-selenide"));
      runLines.push(ln("ok", "./gradlew test -Denv=ci -DincludeTags=e2e \\"));
      runLines.push(ln("ok", "  -Dtest=" + cls + "#" + method));
    } else if (rule) {
      runLines.push(ln("ok", "./gradlew test -Denv=ci -DincludeTags=e2e"));
      runLines.push(ln("bad", "# весь срез e2e — нет -Dtest=Class#method"));
    } else {
      runLines.push(ln("bad", "./gradlew test                         # full suite"));
    }

    if (!rule) {
      runLines.push(ln("bad", "git commit -am \"login\"                 # без OK"));
    }

    runLines.push(ln("dim", ""));
    if (n === 4) {
      runLines.push(ln("ok", "# e2e · pipeline / stage / prod · exit 0 · нет commit"));
      runLines.push(ln("ok", "# 401 уже в AuthApiTests, не трогаем"));
    } else if (skill) {
      runLines.push(ln("ok", "# skill хотя бы сказал слой и DoD"));
      if (!adr) runLines.push(ln("bad", "# и ещё e2e на JSON «на всякий»"));
    } else {
      runLines.push(ln("bad", "# не сказал ни слой, ни стенды, ни exit"));
      if (rag && !adr) runLines.push(ln("bad", "# api прикрутил в тот же чат"));
    }

    var gradleLines;
    var gradleKind;
    if (rag) {
      gradleKind = "ok";
      gradleLines = [
        ln("ok", "// не трогал — версии как в репо"),
        ln("dim", ""),
        ln("ok", "javaVersion     = 21"),
        ln("ok", "junitVersion    = \"5.11.4\""),
        ln("ok", "selenideVersion = \"7.17.0\""),
        ln("ok", "allureVersion   = \"3.13.0\""),
        ln("ok", "ownerVersion    = \"1.0.12\""),
        ln("dim", ""),
        ln("ok", "testImplementation selenide, junit-jupiter,"),
        ln("ok", "                   allure-selenide, owner"),
        ln("ok", "// task testE2e нет")
      ];
    } else {
      gradleKind = "bad";
      gradleLines = [
        ln("bad", "// навыдумал task — в репо его нет"),
        ln("dim", ""),
        ln("bad", "task testE2e(type: Test) { useJUnitPlatform() }"),
        ln("dim", ""),
        ln("dim", "// в репо:"),
        ln("ok", "junitVersion    = \"5.11.4\""),
        ln("ok", "selenideVersion = \"7.17.0\""),
        ln("ok", "allureVersion   = \"3.13.0\""),
        ln("ok", "// task testE2e нет")
      ];
    }

    var propsKind;
    var propsLines;
    if (rule) {
      propsKind = "ok";
      propsLines = [
        ln("ok", "# не трогал — URL не в Java"),
        ln("dim", ""),
        ln("ok", "# default.properties"),
        ln("ok", "baseUrl="),
        ln("ok", "browser=chrome"),
        ln("ok", "browserVersion=148"),
        ln("ok", "browserSize=1920x1280"),
        ln("ok", "remoteUrl="),
        ln("dim", ""),
        ln("ok", "# ci.properties  (-Denv=ci)"),
        ln("ok", "baseUrl=http://localhost:9821/")
      ];
    } else {
      propsKind = "bad";
      propsLines = [
        ln("bad", "# захардкодил стенд в default"),
        ln("dim", ""),
        ln("bad", "baseUrl=http://localhost:9821/"),
        ln("dim", ""),
        ln("bad", "# -Denv= не читал"),
        ln("bad", "# pipeline / stage / prod — нет")
      ];
    }

    var ciKind;
    var ciLines;
    if (rag && rule) {
      ciKind = "ok";
      ciLines = [
        ln("ok", "# не трогал — два флага"),
        ln("dim", ""),
        ln("ok", "e2e-tests:"),
        ln("ok", "  env:"),
        ln("ok", "    LAYER: e2e"),
        ln("ok", "  steps:"),
        ln("ok", "    - uses: ./tests/.github/actions/e2e"),
        ln("ok", "      with:"),
        ln("ok", "        stand: prod"),
        ln("ok", "# ./gradlew test -Denv=prod"),
        ln("ok", "#   -DincludeTags=e2e"),
        ln("ok", "#   -DexcludeTags=mock,screenshot"),
        ln("ok", "# task testE2e нет")
      ];
    } else if (!rag) {
      ciKind = "bad";
      ciLines = [
        ln("bad", "# навыдумал job testE2e"),
        ln("dim", ""),
        ln("bad", "e2e:"),
        ln("bad", "  steps:"),
        ln("bad", "    - run: ./gradlew testE2e"),
        ln("dim", ""),
        ln("dim", "# в репо:"),
        ln("ok", "e2e-tests:"),
        ln("ok", "  steps:"),
        ln("ok", "    - uses: ./tests/.github/actions/e2e"),
        ln("ok", "# task testE2e нет")
      ];
    } else {
      ciKind = "bad";
      ciLines = [
        ln("bad", "# нет -Denv= — стенд не выбирает"),
        ln("dim", ""),
        ln("ok", "e2e-tests:"),
        ln("ok", "  steps:"),
        ln("ok", "    - uses: ./tests/.github/actions/e2e"),
        ln("bad", "# ./gradlew test -DincludeTags=e2e"),
        ln("dim", ""),
        ln("ok", "# в репо ещё -Denv=prod")
      ];
    }

    var extras = [];
    if (!skill) {
      extras.push(panel("extra-test", "test · LoginSadPathTests.java", "bad", testLines, "test"));
    }
    if (!adr) {
      extras.push(panel("extra-test-401", "test · Login401Tests.java", "bad", [
        ln("bad", "// нового e2e на 401 — нет ADR 005"),
        ln("dim", ""),
        ln("bad", "@Layer(\"screenshot\")"),
        ln("bad", "class Login401Tests {"),
        ln("dim", ""),
        ln("bad", "  @Test"),
        ln("bad", "  @Tag(\"api\")"),
        ln("bad", "  void shouldSee401() {"),
        ln("bad", "    $(\"pre\").shouldHave(text(\"401\"));"),
        ln("dim", "  }"),
        ln("dim", "}")
      ], "test"));
    }

    var mainTestLines;
    var mainTestKind;
    if (skill) {
      mainTestKind = rag && adr && rule ? "ok" : "bad";
      mainTestLines = testLines;
    } else {
      mainTestKind = "bad";
      mainTestLines = [
        ln("bad", "// не расширил существующий класс"),
        ln("dim", ""),
        ln("dim", "@Layer(\"e2e\")"),
        ln("dim", "@Epic(\"Authentication\")"),
        ln("dim", "@Feature(\"Login\")"),
        ln("dim", "class LoginTests extends TestBase {"),
        ln("dim", ""),
        ln("dim", "  @Test"),
        ln("dim", "  @Tag(\"e2e\")"),
        ln("dim", "  @Tag(\"smoke\")"),
        ln("dim", "  @Tag(\"positive\")"),
        ln("dim", "  @DisplayName(\"User is logged in with valid credentials\")"),
        ln("dim", "  void shouldLoginWithValidCredentials() {"),
        ln("dim", "    loginPage.openPage()"),
        ln("dim", "        .fillAndSubmitForm(\"user1\", \"password1\")"),
        ln("dim", "        .shouldHaveWelcomeMessage(\"Welcome, user1!\");"),
        ln("dim", "  }"),
        ln("bad", "  // shouldShowErrorWhenPasswordIsWrong — не добавил"),
        ln("dim", "}")
      ];
    }

    var panels = withExtras([
      panel("test", "test · LoginTests.java", mainTestKind, mainTestLines),
      panel("page", "page · LoginPage.java", pageKind, pageLines),
      panel("home", "page · HomePage.java", homeKind, homeLines),
      panel("gradle", "build · build.gradle", gradleKind, gradleLines),
      panel("props", "props · default.properties", propsKind, propsLines),
      panel("ci", "ci · ci.yml", ciKind, ciLines),
      panel("cli", "cli · терминал", rule && skill && rag ? "ok" : "bad", runLines)
    ], extras);

    return pack(panels);
  }

  function parseHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) return null;
    var next = { ctx: true, skill: true, rule: true, rag: true, adr: true };
    var found = false;
    var nextIde = null;
    Object.keys(HASH_TO_LAYER).forEach(function (ch) {
      var i = h.indexOf(ch);
      if (i < 0 || i === h.length - 1) return;
      var bit = h.charAt(i + 1);
      if (bit !== "0" && bit !== "1") return;
      next[HASH_TO_LAYER[ch]] = bit === "1";
      found = true;
    });
    var ui = h.indexOf("u");
    if (ui >= 0 && ui < h.length - 1) {
      var ubit = h.charAt(ui + 1);
      if (HASH_TO_IDE[ubit]) {
        nextIde = HASH_TO_IDE[ubit];
        found = true;
      }
    }
    return found ? { layers: next, ide: nextIde } : null;
  }

  function writeHash() {
    var h = LAYERS.map(function (k) {
      return LAYER_TO_HASH[k] + (state[k] ? "1" : "0");
    }).join("") + "u" + (IDE_TO_HASH[ide] || "c");
    if (history.replaceState) history.replaceState(null, "", "#" + h);
  }

  function pill(layer, on) {
    var cls = "chip chip--" + layer + (on ? " chip--on" : "");
    return '<span class="' + cls + '">' + LABELS[layer] + "</span>";
  }

  function paintLines(lines) {
    // .lab-ln is display:block — joining lines with a newline inside <pre> doubles blank lines.
    return lines
      .map(function (l) {
        return '<span class="lab-ln lab-ln--' + l.kind + '">' + highlight(l.text) + "</span>";
      })
      .join("");
  }

  function explain(s) {
    var n = (s.skill ? 1 : 0) + (s.rule ? 1 : 0) + (s.rag ? 1 : 0) + (s.adr ? 1 : 0);
    var match = n === 4 && s.ctx;
    var gaps = [];
    if (!s.ctx) {
      gaps.push({
        layer: "ctx",
        title: n === 0 ? "не увидел, что это Java" : "нет живого образца",
        ideal: "Открыты LoginTests (happy path), LoginPage (форма, fillAndSubmitForm → HomePage) и HomePage (shouldHaveWelcomeMessage). errorMessage и error-path методов на вкладке LoginPage нет.",
        expected: n === 0
          ? "pytest + ChromeDriver + localhost:3000. В этом репо такого файла нет."
          : "Слои читает, но не видит, как уже написан тест и PO — не на что опереться.",
        why: "Context — открытые вкладки, не skill и не rule. Без них агент не знает «как устроено здесь»."
      });
    }
    if (!s.skill) {
      gaps.push({
        layer: "skill",
        title: "новый класс, без «как гонять»",
        ideal: "Дописал LoginTests#shouldShowErrorWhenPasswordIsWrong. Прогон: -Dtest=LoginTests#метод. DoD: слой, стенды, exit, без commit.",
        expected: "Новый LoginSadPathTests / testWrongPassword. Гоняет всё подряд. Не сказал ни слой, ни стенды, ни exit.",
        why: "Skill отвечает на «как». Без него агент изобретает файл и ритуал прогона."
      });
    }
    if (!s.rule) {
      gaps.push({
        layer: "rule",
        title: "весь suite, commit, URL в Java",
        ideal: "Не commit / push без OK. URL только из properties. Всегда -Denv=. Один task = один метод.",
        expected: "git commit сам. ./gradlew test на весь suite. URL захардкожен в Java или в default.properties.",
        why: "Rule — «нельзя». Skill может сказать как писать тест, но без ПДД агент сам коммитит и не выбирает стенд."
      });
    }
    if (!s.rag) {
      var ragExpected;
      if (s.ctx) {
        ragExpected = "fillAndSubmitForm(\"user1\", \"wrongpassword\") и Welcome — срисовал вкладку. submitExpectingError в PO не появился. Или $(\".alert\") + «Invalid credentials». Навыдумал task testE2e.";
      } else if (n === 0) {
        ragExpected = "driver.find_element(\"input\"), assert «Invalid credentials».";
      } else {
        ragExpected = "$(\"input\") / $(\"#login\") и «Invalid credentials». task testE2e.";
      }
      gaps.push({
        layer: "rag",
        title: s.ctx ? "срисовал happy path" : (n === 0 ? "селекторы с потолка, pytest" : "выдумал CSS и текст ошибки"),
        ideal: "В LoginPage появляются errorMessage, submitExpectingError и shouldHaveErrorMessage. Текст «Wrong login or password». HomePage не трогает. task testE2e нет. Стенды pipeline / stage / prod.",
        expected: ragExpected,
        why: s.ctx
          ? "Без RAG смотрит на вкладку и копирует fillAndSubmitForm. Error-path в PO не дописывает."
          : "RAG — факт: как расширить PO, текст ошибки, как гоняют. Без карточек агент копирует то, что видит, или врёт."
      });
    }
    if (!s.adr) {
      gaps.push({
        layer: "adr",
        title: "e2e на 401 и screenshot-слой",
        ideal: "401 JSON уже в AuthApiTests — не трогаем. screenshot = @Tag, не @Layer. smoke тоже slice.",
        expected: "На LoginTests появляется лишний @Layer(\"screenshot\"). Ещё Login401Tests с тем же слоем и @Tag(\"api\"), клик по 401. Путает slice и ярус.",
        why: "ADR 005 фиксирует «почему так». Skill ссылается, сам не копирует. Без ADR агент «на всякий» добавит лишний e2e."
      });
    }
    return { match: match, gaps: gaps, n: n };
  }

  function paintPanels(el, panels, extra) {
    if (!el) return;
    el.className = "lab-out" + (extra ? " is-extra" : "");
    el.innerHTML = panels
      .map(function (p) {
        var cls = "panel lab-file" + (p.kind === "ok" ? " panel--good" : " panel--bad") + (p.extraOf ? " lab-file--extra" : "");
        return (
          '<section class="' + cls + '" data-slot="' + p.id + '"' + (p.extraOf ? ' data-extra="' + p.extraOf + '"' : "") + '>' +
            '<div class="panel__bar">' +
              '<span class="dots"><i class="dot dot--r"></i><i class="dot dot--y"></i><i class="dot dot--g"></i></span>' +
              '<p class="panel__title">' + esc(p.title) + "</p>" +
            "</div>" +
            '<div class="panel__body lab-code-wrap"><pre class="lab-code">' + paintLines(p.lines) + "</pre></div>" +
          "</section>"
        );
      })
      .join("");
  }

  function paintWhy(el, why, holds) {
    if (!el) return;
    var html = "";
    if (why.match) {
      html += '<p class="lab-why__ok">Ожидаемый совпадает с идеальным: вкладки открыты, все четыре слоя на месте.</p>';
    }
    html += why.gaps
      .map(function (g) {
        return (
          '<article class="lab-gap lab-gap--' + g.layer + '">' +
            '<header class="lab-gap__hd">' + pill(g.layer, false) +
              '<h3 class="lab-gap__title">' + esc(g.title) + "</h3></header>" +
            '<p class="lab-gap__ideal"><span>идеал</span> ' + esc(g.ideal) + "</p>" +
            '<p class="lab-gap__got"><span>ожидаемо</span> ' + esc(g.expected) + "</p>" +
            '<p class="lab-gap__why">' + esc(g.why) + "</p>" +
          "</article>"
        );
      })
      .join("");
    if (holds.length) {
      html +=
        '<h3 class="lab-why__sub">' +
        (why.match ? "что держит" : "что ещё ок") +
        "</h3><ul class=\"lab-list\">" +
        holds
          .map(function (item) {
            return "<li>" + pill(item.layer, true) + " " + esc(item.text) + "</li>";
          })
          .join("") +
        "</ul>";
    }
    el.innerHTML = html;
  }

  function render() {
    var out = compose(state);
    var ideal = compose(FULL);
    var why = explain(state);
    var outEl = document.getElementById("lab-out");
    var idealEl = document.getElementById("lab-ideal");
    var whyEl = document.getElementById("lab-why");
    var whyDiag = document.getElementById("lab-why-diag");
    var count = document.getElementById("lab-count");
    var expectedCol = document.getElementById("lab-expected-col");
    var whyCol = document.getElementById("lab-why-col");

    paintPanels(idealEl, ideal.panels, false);
    paintPanels(
      outEl,
      out.panels,
      out.panels.some(function (p) { return !!p.extraOf; })
    );
    paintWhy(whyEl, why, out.holds);

    if (expectedCol) expectedCol.classList.toggle("is-match", why.match);
    if (whyCol) whyCol.classList.toggle("is-match", why.match);

    if (whyDiag) {
      whyDiag.textContent = out.verdict;
      whyDiag.classList.toggle("is-ok", why.match);
      whyDiag.classList.toggle("is-bad", !why.match);
    }

    if (count) count.textContent = out.n + " из 4, вкладки " + (state.ctx ? "открыты" : "закрыты");

    document.querySelectorAll("[data-src]").forEach(function (el) {
      var on = !!state[el.getAttribute("data-src")];
      el.classList.toggle("is-off", !on);
      el.classList.toggle("panel--bad", !on);
      var st = el.querySelector(".lab-src__state");
      if (st) st.textContent = on ? "читает" : "не читает";
    });

    document.querySelectorAll("[data-layer]").forEach(function (btn) {
      var on = !!state[btn.getAttribute("data-layer")];
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-on", on);
    });

    document.querySelectorAll("[data-preset]").forEach(function (btn) {
      var id = btn.getAttribute("data-preset");
      var preset = PRESETS.filter(function (p) { return p.id === id; })[0];
      var match = preset && LAYERS.every(function (k) { return state[k] === preset.state[k]; });
      btn.classList.toggle("is-on", !!match);
    });

    var screen = document.querySelector(".lab-screen");
    if (screen) screen.setAttribute("data-rule-ide", ide);
    document.querySelectorAll("button[data-rule-ide]").forEach(function (btn) {
      var on = btn.getAttribute("data-rule-ide") === ide;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    writeHash();
  }

  function apply(next) {
    LAYERS.forEach(function (k) {
      state[k] = !!next[k];
    });
    render();
  }

  function bind() {
    document.querySelectorAll("[data-layer]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-layer");
        state[k] = !state[k];
        render();
      });
    });
    document.querySelectorAll("[data-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-preset");
        var preset = PRESETS.filter(function (p) { return p.id === id; })[0];
        if (preset) apply(preset.state);
      });
    });
    document.querySelectorAll("button[data-rule-ide]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var next = btn.getAttribute("data-rule-ide");
        if (IDES.indexOf(next) < 0) return;
        ide = next;
        render();
      });
    });
    document.querySelectorAll("[data-src]").forEach(function (el) {
      el.addEventListener("click", function () {
        var k = el.getAttribute("data-src");
        state[k] = !state[k];
        render();
      });
    });
    document.querySelectorAll(".lab-src__pop").forEach(function (pop) {
      pop.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var k = HASH_TO_LAYER[e.key.toLowerCase()];
      if (!k) return;
      e.preventDefault();
      state[k] = !state[k];
      render();
    });
  }

  function paintStatic() {
    document.querySelectorAll(".lab-src pre").forEach(function (pre) {
      if (pre.getAttribute("data-painted")) return;
      pre.setAttribute("data-painted", "1");
      pre.classList.add("lab-code");
      var raw = pre.textContent.replace(/\n$/, "");
      pre.innerHTML = raw.split("\n").map(function (line) {
        return '<span class="lab-ln">' + highlight(line) + "</span>";
      }).join(""); // not a newline join: .lab-ln is already a block line
    });
  }

  var fromHash = parseHash();
  if (fromHash) {
    LAYERS.forEach(function (k) {
      state[k] = !!fromHash.layers[k];
    });
    if (fromHash.ide) ide = fromHash.ide;
  }
  paintStatic();
  bind();
  render();
})();
