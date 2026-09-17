package dev.multistack.app.controller;

import com.fasterxml.jackson.databind.JsonNode;
import dev.multistack.app.dto.NoteDto;
import dev.multistack.app.dto.NotePutRequest;
import dev.multistack.app.dto.NotePutResult;
import dev.multistack.app.exception.NoteException;
import dev.multistack.app.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestController
@RequestMapping("/api/note")
public class NoteController {

    static final String MERGE_PATCH = "application/merge-patch+json";

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NoteDto> put(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody NotePutRequest request
    ) {
        NotePutResult result = noteService.put(username, request);
        if (result.created()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .header(HttpHeaders.CONTENT_LOCATION, "/api/note")
                    .body(result.note());
        }
        return ResponseEntity.ok(result.note());
    }

    @GetMapping
    public NoteDto get(@AuthenticationPrincipal String username) {
        return noteService.get(username);
    }

    @PatchMapping(consumes = MERGE_PATCH)
    public NoteDto patch(
            @AuthenticationPrincipal String username,
            @RequestBody JsonNode patch
    ) {
        return noteService.patch(username, patch);
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String username) {
        noteService.delete(username);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(NoteException.class)
    ResponseEntity<Map<String, String>> handleNoteException(NoteException ex) {
        return ResponseEntity.status(ex.getStatus()).body(Map.of("message", ex.getMessage()));
    }
}

/**
 * 415 is resolved before the controller method ({@code Handler Type = null}), so it cannot
 * live as {@code assignableTypes = NoteController} or a local {@code @ExceptionHandler}.
 * Gate by URI so neighbouring resources do not inherit {@code Accept-Patch}.
 */
@RestControllerAdvice
class NoteMediaTypeExceptionHandler {

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<Map<String, String>> handleUnsupportedMediaType(HttpServletRequest request) {
        if (!isNotePath(request)) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }
        var body = Map.of("message", "Unsupported media type");
        if ("PATCH".equalsIgnoreCase(request.getMethod())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .header(HttpHeaders.ACCEPT_PATCH, NoteController.MERGE_PATCH)
                    .body(body);
        }
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(body);
    }

    private static boolean isNotePath(HttpServletRequest request) {
        return String.valueOf(request.getRequestURI()).endsWith("/api/note");
    }
}
