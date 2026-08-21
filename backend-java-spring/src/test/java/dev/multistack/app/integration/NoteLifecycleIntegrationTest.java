package dev.multistack.app.integration;

import dev.multistack.app.allure.IntegrationTestBase;
import dev.multistack.app.dto.AuthResponse;
import dev.multistack.app.dto.LoginRequest;
import dev.multistack.app.dto.NoteDto;
import dev.multistack.app.dto.NotePutRequest;
import dev.multistack.app.dto.RegisterRequest;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@Epic("Note")
@Feature("Note lifecycle")
@Severity(SeverityLevel.CRITICAL)
@DisplayName("Note singleton lifecycle in-process")
class NoteLifecycleIntegrationTest extends IntegrationTestBase {

    private static final MediaType MERGE_PATCH = MediaType.parseMediaType("application/merge-patch+json");

    /**
     * HTTP+DB round-trip for the singleton note. User is a factory account, not seed user1.
     * PUT creates (201, not 409); 401 without a token is already covered by the /api/** chain.
     */
    @Test
    @DisplayName("PUT create 201 → GET 200 → PUT replace 200 → PATCH merge 200 → DELETE 204 → GET 404")
    void noteLifecycleRoundTrip() {
        String token = registerAndLogin();

        ResponseEntity<NoteDto> created = rest.exchange(
                "/api/note",
                HttpMethod.PUT,
                jsonBearerEntity(new NotePutRequest("Draft", "First persist"), token),
                NoteDto.class);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        assertNotEquals(HttpStatus.CONFLICT, created.getStatusCode());
        assertNotNull(created.getBody());
        assertEquals("Draft", created.getBody().title());
        assertEquals("First persist", created.getBody().text());
        Long noteId = created.getBody().id();
        assertNotNull(noteId);

        ResponseEntity<NoteDto> persisted = rest.exchange(
                "/api/note",
                HttpMethod.GET,
                bearerEntity(token),
                NoteDto.class);
        assertEquals(HttpStatus.OK, persisted.getStatusCode());
        assertNotNull(persisted.getBody());
        assertEquals(noteId, persisted.getBody().id());
        assertEquals("Draft", persisted.getBody().title());
        assertEquals("First persist", persisted.getBody().text());

        ResponseEntity<NoteDto> replaced = rest.exchange(
                "/api/note",
                HttpMethod.PUT,
                jsonBearerEntity(new NotePutRequest("Replaced", "Second persist"), token),
                NoteDto.class);
        assertEquals(HttpStatus.OK, replaced.getStatusCode());
        assertNotNull(replaced.getBody());
        assertEquals(noteId, replaced.getBody().id());
        assertEquals("Replaced", replaced.getBody().title());
        assertEquals("Second persist", replaced.getBody().text());

        ResponseEntity<NoteDto> merged = mergePatch(token, "{\"title\":\"Merged\"}");
        assertEquals(HttpStatus.OK, merged.getStatusCode());
        assertNotNull(merged.getBody());
        assertEquals(noteId, merged.getBody().id());
        assertEquals("Merged", merged.getBody().title());
        assertEquals("Second persist", merged.getBody().text());

        ResponseEntity<Void> deleted = rest.exchange(
                "/api/note",
                HttpMethod.DELETE,
                bearerEntity(token),
                Void.class);
        assertEquals(HttpStatus.NO_CONTENT, deleted.getStatusCode());

        ResponseEntity<String> missing = rest.exchange(
                "/api/note",
                HttpMethod.GET,
                bearerEntity(token),
                String.class);
        assertEquals(HttpStatus.NOT_FOUND, missing.getStatusCode());
    }

    private String registerAndLogin() {
        String username = "note_" + UUID.randomUUID().toString().substring(0, 8);
        String password = "password123";

        ResponseEntity<AuthResponse> register = rest.postForEntity(
                "/api/auth/register",
                jsonEntity(new RegisterRequest(username, password)),
                AuthResponse.class);
        assertEquals(HttpStatus.CREATED, register.getStatusCode());

        ResponseEntity<AuthResponse> login = rest.postForEntity(
                "/api/auth/login",
                jsonEntity(new LoginRequest(username, password)),
                AuthResponse.class);
        assertEquals(HttpStatus.OK, login.getStatusCode());
        assertNotNull(login.getBody());
        assertNotNull(login.getBody().token());
        return login.getBody().token();
    }

    /**
     * JDK HttpClient supports PATCH; the default HttpURLConnection factory does not.
     */
    private ResponseEntity<NoteDto> mergePatch(String token, String jsonBody) {
        RestTemplate patchClient = new RestTemplate(new JdkClientHttpRequestFactory());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MERGE_PATCH);
        headers.setBearerAuth(token);
        return patchClient.exchange(
                rest.getRootUri() + "/api/note",
                HttpMethod.PATCH,
                new HttpEntity<>(jsonBody, headers),
                NoteDto.class);
    }
}
