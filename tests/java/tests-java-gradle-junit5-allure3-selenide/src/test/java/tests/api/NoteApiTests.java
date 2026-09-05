package tests.api;

import annotations.Layer;
import api.ApiTestBase;
import api.AuthApiClient;
import api.NoteApiClient;
import api.model.NotePutRequest;
import helpers.DataFaker;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;

/**
 * HTTP contract of singleton {@code /api/note}: RFC verbs, statuses, schemas.
 * Accounts are factory + teardown (never seed {@code user1}), so the same tests
 * run on pipeline / stage / prod without {@code if (prod)}.
 */
@Layer("api")
@Epic("Note")
@Feature("Note")
@Severity(SeverityLevel.CRITICAL)
@DisplayName("Note API")
class NoteApiTests extends ApiTestBase {

    private static final String PASSWORD = "password123";
    private static final String NOTE_SCHEMA = "schemas/note.json";
    private static final String ERROR_SCHEMA = "schemas/error.json";

    private final List<String> throwawayUsernames = new ArrayList<>();

    @AfterEach
    void teardownFactoryAccounts() {
        for (String username : throwawayUsernames) {
            AuthApiClient.deleteAccountQuietly(username, PASSWORD);
        }
        throwawayUsernames.clear();
    }

    @Test
    @Tag("api")
    @Tag("positive")
    @Tag("smoke")
    @DisplayName("PUT /api/note creates with 201 and Content-Location")
    void putCreatesWith201AndContentLocation() {
        String token = factoryToken();

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest("Draft", "First persist"))
                .when()
                .put(NoteApiClient.PATH)
                .then()
                .statusCode(201)
                .statusCode(not(409))
                .header("Content-Location", equalTo(NoteApiClient.PATH))
                .body(matchesJsonSchemaInClasspath(NOTE_SCHEMA))
                .body("title", equalTo("Draft"))
                .body("text", equalTo("First persist"));
    }

    @Test
    @Tag("api")
    @Tag("positive")
    @DisplayName("PUT /api/note replaces with 200, not 409")
    void putReplacesWith200Not409() {
        String token = factoryToken();
        NoteApiClient.put(token, "Draft", "First persist");

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest("Replaced", "Second persist"))
                .when()
                .put(NoteApiClient.PATH)
                .then()
                .statusCode(200)
                .statusCode(not(409))
                .header("Content-Location", emptyOrNullString())
                .body(matchesJsonSchemaInClasspath(NOTE_SCHEMA))
                .body("title", equalTo("Replaced"))
                .body("text", equalTo("Second persist"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("POST /api/note is not a create verb (no 201, no 409)")
    void postIsNotAllowedOnSingleton() {
        String token = factoryToken();

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest("Nope", "No post on singleton"))
                .when()
                .post(NoteApiClient.PATH)
                .then()
                .statusCode(not(201))
                .statusCode(not(409));

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get(NoteApiClient.PATH)
                .then()
                .statusCode(404);
    }

    @Test
    @Tag("api")
    @Tag("positive")
    @DisplayName("GET /api/note returns 200 for the owner's singleton")
    void getReturns200() {
        String token = factoryToken();
        NoteApiClient.put(token, "Hello", "World");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get(NoteApiClient.PATH)
                .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath(NOTE_SCHEMA))
                .body("title", equalTo("Hello"))
                .body("text", equalTo("World"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("GET /api/note returns 404 when the user has no note")
    void getMissingReturns404() {
        String token = factoryToken();

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get(NoteApiClient.PATH)
                .then()
                .statusCode(404)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", equalTo("Note not found"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("GET /api/note with another user's JWT returns the caller's own 404")
    void getWithForeignJwtReturnsOwn404() {
        String ownerToken = factoryToken();
        String strangerToken = factoryToken();
        NoteApiClient.put(ownerToken, "Secret", "Owner text");

        given()
                .header("Authorization", "Bearer " + strangerToken)
                .when()
                .get(NoteApiClient.PATH)
                .then()
                .statusCode(404)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", equalTo("Note not found"));

        given()
                .header("Authorization", "Bearer " + ownerToken)
                .when()
                .get(NoteApiClient.PATH)
                .then()
                .statusCode(200)
                .body("text", equalTo("Owner text"));
    }

    @Test
    @Tag("api")
    @Tag("positive")
    @DisplayName("PATCH /api/note merge-patch returns 200")
    void patchMergeReturns200() {
        String token = factoryToken();
        NoteApiClient.put(token, "Draft", "Keep me");

        given()
                .contentType(NoteApiClient.MERGE_PATCH)
                .header("Authorization", "Bearer " + token)
                .body("{\"title\":\"Merged\"}")
                .when()
                .patch(NoteApiClient.PATH)
                .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath(NOTE_SCHEMA))
                .body("title", equalTo("Merged"))
                .body("text", equalTo("Keep me"));
    }

    @Test
    @Tag("api")
    @Tag("positive")
    @DisplayName("PATCH /api/note with {} is a 200 no-op")
    void patchEmptyObjectReturns200() {
        String token = factoryToken();
        NoteApiClient.put(token, "Draft", "Keep me");

        given()
                .contentType(NoteApiClient.MERGE_PATCH)
                .header("Authorization", "Bearer " + token)
                .body("{}")
                .when()
                .patch(NoteApiClient.PATH)
                .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath(NOTE_SCHEMA))
                .body("title", equalTo("Draft"))
                .body("text", equalTo("Keep me"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("PATCH /api/note with application/json returns 415 and Accept-Patch")
    void patchJsonReturns415WithAcceptPatch() {
        String token = factoryToken();

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body("{}")
                .when()
                .patch(NoteApiClient.PATH)
                .then()
                .statusCode(415)
                .header("Accept-Patch", equalTo(NoteApiClient.MERGE_PATCH))
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", equalTo("Unsupported media type"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("PATCH /api/note with text null returns 422")
    void patchTextNullReturns422() {
        String token = factoryToken();
        NoteApiClient.put(token, "Draft", "Keep me");

        given()
                .contentType(NoteApiClient.MERGE_PATCH)
                .header("Authorization", "Bearer " + token)
                .body("{\"text\":null}")
                .when()
                .patch(NoteApiClient.PATH)
                .then()
                .statusCode(422)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", equalTo("text cannot be null"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("PATCH /api/note returns 404 when the user has no note")
    void patchMissingReturns404() {
        String token = factoryToken();

        given()
                .contentType(NoteApiClient.MERGE_PATCH)
                .header("Authorization", "Bearer " + token)
                .body("{}")
                .when()
                .patch(NoteApiClient.PATH)
                .then()
                .statusCode(404)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", equalTo("Note not found"));
    }

    @Test
    @Tag("api")
    @Tag("positive")
    @DisplayName("DELETE /api/note returns 204")
    void deleteReturns204() {
        String token = factoryToken();
        NoteApiClient.put(token, "Draft", "To delete");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(NoteApiClient.PATH)
                .then()
                .statusCode(204);

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get(NoteApiClient.PATH)
                .then()
                .statusCode(404);
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("DELETE /api/note returns 404 when the user has no note")
    void deleteMissingReturns404() {
        String token = factoryToken();

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(NoteApiClient.PATH)
                .then()
                .statusCode(404)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", equalTo("Note not found"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("GET/PUT/PATCH/DELETE /api/note without a token returns 401")
    void noteWithoutTokenReturns401() {
        given().when().get(NoteApiClient.PATH).then().statusCode(401);
        given()
                .contentType(JSON)
                .body(new NotePutRequest("x", "y"))
                .when()
                .put(NoteApiClient.PATH)
                .then()
                .statusCode(401);
        given().contentType(NoteApiClient.MERGE_PATCH).body("{}").when().patch(NoteApiClient.PATH).then().statusCode(401);
        given().when().delete(NoteApiClient.PATH).then().statusCode(401);
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("PUT /api/note with empty text returns 400 and the error schema")
    void putEmptyTextReturns400() {
        String token = factoryToken();

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest("Hello", ""))
                .when()
                .put(NoteApiClient.PATH)
                .then()
                .statusCode(400)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", containsString("text"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("PUT /api/note rejects title over 120 with 400 and the error schema")
    void putTitleOverLimitReturns400() {
        String token = factoryToken();

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest("t".repeat(121), "ok"))
                .when()
                .put(NoteApiClient.PATH)
                .then()
                .statusCode(400)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", containsString("title"));
    }

    @Test
    @Tag("api")
    @Tag("negative")
    @DisplayName("PUT /api/note rejects text over 2000 with 400 and the error schema")
    void putTextOverLimitReturns400() {
        String token = factoryToken();

        given()
                .contentType(JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest("ok", "a".repeat(2001)))
                .when()
                .put(NoteApiClient.PATH)
                .then()
                .statusCode(400)
                .body(matchesJsonSchemaInClasspath(ERROR_SCHEMA))
                .body("message", containsString("text"));
    }

    /** Throwaway account — never seeded user1. Deleted in {@link #teardownFactoryAccounts()}. */
    private String factoryToken() {
        String username = DataFaker.username();
        String token = AuthApiClient.register(username, PASSWORD);
        throwawayUsernames.add(username);
        return token;
    }
}
