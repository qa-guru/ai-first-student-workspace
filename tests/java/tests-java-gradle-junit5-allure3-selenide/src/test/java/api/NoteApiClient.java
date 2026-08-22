package api;

import api.model.NotePutRequest;
import config.ConfigReader;
import io.qameta.allure.Step;
import io.restassured.http.ContentType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;

/**
 * Thin API client for the singleton {@code /api/note}. Tests use it to arrange
 * state through the product API instead of duplicating raw JSON.
 *
 * <p>Uses absolute URIs from {@link ConfigReader}, so it works from any test base
 * (browser tests never touch {@code RestAssured.baseURI}).
 */
public final class NoteApiClient {

    public static final String PATH = "/api/note";
    public static final String MERGE_PATCH = "application/merge-patch+json";

    private NoteApiClient() {
    }

    @Step("API: PUT /api/note")
    public static void put(String token, String title, String text) {
        given()
                .baseUri(ConfigReader.resolveApiBaseUrl())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + token)
                .body(new NotePutRequest(title, text))
                .when()
                .put(PATH)
                .then()
                .statusCode(anyOf(equalTo(200), equalTo(201)));
    }

    @Step("API: DELETE /api/note")
    public static void delete(String token) {
        given()
                .baseUri(ConfigReader.resolveApiBaseUrl())
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(PATH)
                .then()
                .statusCode(204);
    }
}
