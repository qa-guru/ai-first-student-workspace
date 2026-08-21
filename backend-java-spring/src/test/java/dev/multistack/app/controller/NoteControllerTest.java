package dev.multistack.app.controller;

import com.fasterxml.jackson.databind.JsonNode;
import dev.multistack.app.allure.SliceTestBase;
import dev.multistack.app.config.CorsConfig;
import dev.multistack.app.config.SecurityConfig;
import dev.multistack.app.dto.NoteDto;
import dev.multistack.app.dto.NotePutRequest;
import dev.multistack.app.dto.NotePutResult;
import dev.multistack.app.exception.NoteException;
import dev.multistack.app.service.JwtService;
import dev.multistack.app.service.NoteService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Epic("Note")
@Feature("NoteController")
@Severity(SeverityLevel.CRITICAL)
@WebMvcTest(controllers = NoteController.class)
@Import({NoteExceptionHandler.class, AuthExceptionHandler.class, SecurityConfig.class, CorsConfig.class})
@DisplayName("NoteController")
class NoteControllerTest extends SliceTestBase {

    private static final String MERGE_PATCH = "application/merge-patch+json";
    private static final NoteDto NOTE = new NoteDto(1L, "Hello", "World");

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NoteService noteService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @DisplayName("PUT /api/note returns 201 and Content-Location when created")
    void putCreatesWithContentLocation() throws Exception {
        when(noteService.put(eq("user1"), any(NotePutRequest.class)))
                .thenReturn(new NotePutResult(true, NOTE));

        mockMvc.perform(put("/api/note")
                        .with(authentication(user()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hello\",\"text\":\"World\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.CONTENT_LOCATION, "/api/note"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Hello"))
                .andExpect(jsonPath("$.text").value("World"));
    }

    @Test
    @DisplayName("PUT /api/note returns 200 when replacing")
    void putReplacesWithOk() throws Exception {
        when(noteService.put(eq("user1"), any(NotePutRequest.class)))
                .thenReturn(new NotePutResult(false, NOTE));

        mockMvc.perform(put("/api/note")
                        .with(authentication(user()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hello\",\"text\":\"World\"}"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist(HttpHeaders.CONTENT_LOCATION))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("PUT /api/note with empty text returns 400")
    void putEmptyTextIsBadRequest() throws Exception {
        mockMvc.perform(put("/api/note")
                        .with(authentication(user()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hello\",\"text\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("text")));
    }

    @Test
    @DisplayName("GET /api/note returns 200")
    void getReturnsNote() throws Exception {
        when(noteService.get("user1")).thenReturn(NOTE);

        mockMvc.perform(get("/api/note")
                        .with(authentication(user())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Hello"))
                .andExpect(jsonPath("$.text").value("World"));
    }

    @Test
    @DisplayName("GET /api/note returns 404 when missing")
    void getMissingIsNotFound() throws Exception {
        when(noteService.get("user1")).thenThrow(new NoteException(404, "Note not found"));

        mockMvc.perform(get("/api/note")
                        .with(authentication(user())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Note not found"));
    }

    @Test
    @DisplayName("PATCH /api/note merge-patch returns 200")
    void patchMergeReturnsOk() throws Exception {
        when(noteService.patch(eq("user1"), any(JsonNode.class))).thenReturn(NOTE);

        mockMvc.perform(patch("/api/note")
                        .with(authentication(user()))
                        .contentType(MERGE_PATCH)
                        .content("{\"title\":\"Hello\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Hello"));
    }

    @Test
    @DisplayName("PATCH /api/note with application/json returns 415 and Accept-Patch")
    void patchJsonIsUnsupportedMediaType() throws Exception {
        mockMvc.perform(patch("/api/note")
                        .with(authentication(user()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(header().string(HttpHeaders.ACCEPT_PATCH, MERGE_PATCH))
                .andExpect(jsonPath("$.message").value("Unsupported media type"));
    }

    @Test
    @DisplayName("PATCH /api/note maps text null to 422")
    void patchTextNullIsUnprocessable() throws Exception {
        when(noteService.patch(eq("user1"), any(JsonNode.class)))
                .thenThrow(new NoteException(422, "text cannot be null"));

        mockMvc.perform(patch("/api/note")
                        .with(authentication(user()))
                        .contentType(MERGE_PATCH)
                        .content("{\"text\":null}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("text cannot be null"));
    }

    @Test
    @DisplayName("DELETE /api/note returns 204")
    void deleteReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/note")
                        .with(authentication(user())))
                .andExpect(status().isNoContent());

        verify(noteService).delete("user1");
    }

    private static UsernamePasswordAuthenticationToken user() {
        return new UsernamePasswordAuthenticationToken("user1", null, List.of());
    }
}
