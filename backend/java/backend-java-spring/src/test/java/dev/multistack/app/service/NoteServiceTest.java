package dev.multistack.app.service;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dev.multistack.app.allure.UnitTestBase;
import dev.multistack.app.dto.NoteDto;
import dev.multistack.app.dto.NotePutRequest;
import dev.multistack.app.dto.NotePutResult;
import dev.multistack.app.entity.NoteEntity;
import dev.multistack.app.entity.UserEntity;
import dev.multistack.app.exception.AuthException;
import dev.multistack.app.exception.NoteException;
import dev.multistack.app.repository.NoteRepository;
import dev.multistack.app.repository.UserRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Epic("Note")
@Feature("NoteService")
@Severity(SeverityLevel.CRITICAL)
@ExtendWith(MockitoExtension.class)
@DisplayName("NoteService")
class NoteServiceTest extends UnitTestBase {

    private static final String USERNAME = "user1";

    @Mock
    private UserRepository userRepository;

    @Mock
    private NoteRepository noteRepository;

    private UserEntity user;
    private NoteEntity note;
    private NoteService service;

    @BeforeEach
    void setUp() {
        user = new UserEntity(USERNAME, "hash");
        ReflectionTestUtils.setField(user, "id", 7L);
        note = new NoteEntity(user, "Old title", "Old text");
        ReflectionTestUtils.setField(note, "id", 1L);
        service = new NoteService(userRepository, noteRepository, passthroughTransactions());
    }

    @Test
    @DisplayName("put creates the singleton note and does not conflict")
    void putCreatesWhenMissing() {
        givenUser();
        when(noteRepository.findByUser(user)).thenReturn(Optional.empty());
        givenCreateAssignsId();

        NotePutResult result = service.put(USERNAME, new NotePutRequest("Hello", "World"));

        assertTrue(result.created());
        assertEquals(1L, result.note().id());
        assertEquals("Hello", result.note().title());
        assertEquals("World", result.note().text());
    }

    @Test
    @DisplayName("put replaces an existing note instead of 409")
    void putReplacesWhenPresent() {
        givenNote();
        when(noteRepository.save(note)).thenReturn(note);

        NotePutResult result = service.put(USERNAME, new NotePutRequest("New title", "New text"));

        assertFalse(result.created());
        assertEquals(1L, result.note().id());
        assertEquals("New title", result.note().title());
        assertEquals("New text", result.note().text());
        verify(noteRepository).save(note);
    }

    @Test
    @DisplayName("put recovers a unique user_id race as replace 200, not 500")
    void putCreateRaceBecomesReplace() {
        givenUser();
        when(noteRepository.findByUser(user))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(note));
        when(noteRepository.saveAndFlush(any(NoteEntity.class)))
                .thenThrow(new DataIntegrityViolationException("notes_user_id_key"));
        when(noteRepository.save(note)).thenReturn(note);

        NotePutResult result = service.put(USERNAME, new NotePutRequest("Hello", "World"));

        assertFalse(result.created());
        assertEquals("Hello", result.note().title());
        assertEquals("World", result.note().text());
        verify(noteRepository).save(note);
    }

    @Test
    @DisplayName("put rethrows unique violation when the competing row is still missing")
    void putCreateRaceWithoutRowRethrows() {
        givenUser();
        when(noteRepository.findByUser(user)).thenReturn(Optional.empty());
        DataIntegrityViolationException constraint =
                new DataIntegrityViolationException("notes_user_id_key");
        when(noteRepository.saveAndFlush(any(NoteEntity.class))).thenThrow(constraint);

        DataIntegrityViolationException ex = assertThrows(
                DataIntegrityViolationException.class,
                () -> service.put(USERNAME, new NotePutRequest("Hello", "World")));

        assertEquals(constraint, ex);
    }

    @Test
    @DisplayName("get maps the persisted note to a DTO")
    void getMapsDto() {
        givenNote();

        NoteDto dto = service.get(USERNAME);

        assertEquals(1L, dto.id());
        assertEquals("Old title", dto.title());
        assertEquals("Old text", dto.text());
    }

    @Test
    @DisplayName("get returns 404 when the user has no note")
    void getMissingNoteIs404() {
        givenUser();
        when(noteRepository.findByUser(user)).thenReturn(Optional.empty());

        NoteException ex = assertThrows(NoteException.class, () -> service.get(USERNAME));

        assertEquals(404, ex.getStatus());
        assertEquals("Note not found", ex.getMessage());
    }

    @Test
    @DisplayName("get returns 401 when the user does not exist")
    void getUnknownUserIs401() {
        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

        AuthException ex = assertThrows(AuthException.class, () -> service.get(USERNAME));

        assertEquals(401, ex.getStatus());
        assertEquals("Unauthorized", ex.getMessage());
    }

    @Test
    @DisplayName("patch {} is a no-op keep of title and text")
    void patchEmptyObjectIsNoOp() {
        givenNote();
        when(noteRepository.save(note)).thenReturn(note);

        NoteDto dto = service.patch(USERNAME, objectNode());

        assertEquals("Old title", dto.title());
        assertEquals("Old text", dto.text());
    }

    @Test
    @DisplayName("patch merges title and text independently")
    void patchMergesSubset() {
        givenNote();
        when(noteRepository.save(note)).thenReturn(note);

        ObjectNode titleOnly = objectNode();
        titleOnly.put("title", "Only title");
        assertEquals("Only title", service.patch(USERNAME, titleOnly).title());
        assertEquals("Old text", note.getText());

        ObjectNode textOnly = objectNode();
        textOnly.put("text", "Only text");
        assertEquals("Only text", service.patch(USERNAME, textOnly).text());
        assertEquals("Only title", note.getTitle());
    }

    @Test
    @DisplayName("patch title null becomes empty string")
    void patchTitleNullBecomesEmpty() {
        givenNote();
        when(noteRepository.save(note)).thenReturn(note);

        ObjectNode patch = objectNode();
        patch.set("title", JsonNodeFactory.instance.nullNode());

        assertEquals("", service.patch(USERNAME, patch).title());
    }

    @Test
    @DisplayName("patch text null is 422")
    void patchTextNullIs422() {
        givenNote();

        ObjectNode patch = objectNode();
        patch.set("text", JsonNodeFactory.instance.nullNode());

        NoteException ex = assertThrows(NoteException.class, () -> service.patch(USERNAME, patch));

        assertEquals(422, ex.getStatus());
        assertEquals("text cannot be null", ex.getMessage());
    }

    @Test
    @DisplayName("patch rejects a null or non-object body with 400")
    void patchRejectsNonObject() {
        givenNote();

        NoteException missing = assertThrows(NoteException.class, () -> service.patch(USERNAME, null));
        assertEquals(400, missing.getStatus());
        assertEquals("Patch body must be a JSON object", missing.getMessage());

        NoteException array = assertThrows(
                NoteException.class,
                () -> service.patch(USERNAME, JsonNodeFactory.instance.arrayNode()));
        assertEquals(400, array.getStatus());
    }

    @Test
    @DisplayName("patch rejects a non-string title with 400")
    void patchRejectsNonStringTitle() {
        givenNote();

        ObjectNode patch = objectNode();
        patch.set("title", JsonNodeFactory.instance.numberNode(1));

        NoteException ex = assertThrows(NoteException.class, () -> service.patch(USERNAME, patch));

        assertEquals(400, ex.getStatus());
        assertEquals("title must be a string", ex.getMessage());
    }

    @Test
    @DisplayName("patch rejects a non-string text with 400")
    void patchRejectsNonStringText() {
        givenNote();

        ObjectNode patch = objectNode();
        patch.set("text", JsonNodeFactory.instance.booleanNode(true));

        NoteException ex = assertThrows(NoteException.class, () -> service.patch(USERNAME, patch));

        assertEquals(400, ex.getStatus());
        assertEquals("text must be a string", ex.getMessage());
    }

    @Test
    @DisplayName("patch accepts title of 120 characters and rejects 121")
    void patchEnforcesTitleLimit() {
        givenNote();
        when(noteRepository.save(note)).thenReturn(note);

        ObjectNode ok = objectNode();
        ok.put("title", "t".repeat(NoteService.TITLE_MAX));
        assertEquals(NoteService.TITLE_MAX, service.patch(USERNAME, ok).title().length());

        ObjectNode tooLong = objectNode();
        tooLong.put("title", "t".repeat(NoteService.TITLE_MAX + 1));
        NoteException ex = assertThrows(NoteException.class, () -> service.patch(USERNAME, tooLong));
        assertEquals(400, ex.getStatus());
        assertEquals("title must be at most 120 characters", ex.getMessage());
    }

    @Test
    @DisplayName("patch accepts text of 2000 characters and rejects blank or 2001")
    void patchEnforcesTextLimit() {
        givenNote();
        when(noteRepository.save(note)).thenReturn(note);

        ObjectNode ok = objectNode();
        ok.put("text", "a".repeat(NoteService.TEXT_MAX));
        assertEquals(NoteService.TEXT_MAX, service.patch(USERNAME, ok).text().length());

        ObjectNode blank = objectNode();
        blank.put("text", "   ");
        NoteException blankEx = assertThrows(NoteException.class, () -> service.patch(USERNAME, blank));
        assertEquals(400, blankEx.getStatus());
        assertEquals("text must be between 1 and 2000 characters", blankEx.getMessage());

        ObjectNode tooLong = objectNode();
        tooLong.put("text", "a".repeat(NoteService.TEXT_MAX + 1));
        NoteException longEx = assertThrows(NoteException.class, () -> service.patch(USERNAME, tooLong));
        assertEquals(400, longEx.getStatus());
        assertEquals("text must be between 1 and 2000 characters", longEx.getMessage());
    }

    @Test
    @DisplayName("delete removes the existing note")
    void deleteRemovesNote() {
        givenNote();

        service.delete(USERNAME);

        verify(noteRepository).delete(note);
    }

    private void givenUser() {
        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
    }

    private void givenNote() {
        givenUser();
        when(noteRepository.findByUser(user)).thenReturn(Optional.of(note));
    }

    private void givenCreateAssignsId() {
        when(noteRepository.saveAndFlush(any(NoteEntity.class))).thenAnswer(invocation -> {
            NoteEntity entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                ReflectionTestUtils.setField(entity, "id", 1L);
            }
            return entity;
        });
    }

    /** Executes transactional callbacks inline so unit tests do not need a Spring context. */
    private static PlatformTransactionManager passthroughTransactions() {
        return new PlatformTransactionManager() {
            @Override
            public TransactionStatus getTransaction(TransactionDefinition definition) {
                return new SimpleTransactionStatus(true);
            }

            @Override
            public void commit(TransactionStatus status) {
            }

            @Override
            public void rollback(TransactionStatus status) {
            }
        };
    }

    private static ObjectNode objectNode() {
        return JsonNodeFactory.instance.objectNode();
    }
}
