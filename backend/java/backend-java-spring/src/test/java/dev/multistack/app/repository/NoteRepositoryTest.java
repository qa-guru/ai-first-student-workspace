package dev.multistack.app.repository;

import dev.multistack.app.entity.NoteEntity;
import dev.multistack.app.entity.UserEntity;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Epic("Persistence")
@Feature("Note repository")
@Severity(SeverityLevel.CRITICAL)
@DisplayName("NoteRepository on real PostgreSQL")
class NoteRepositoryTest extends PostgresSliceTestBase {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("findByUser returns the saved note with generated id")
    void findByUserReturnsSavedNote() {
        UserEntity user = userRepository.saveAndFlush(new UserEntity("note-alice", "hash"));
        NoteEntity saved = noteRepository.saveAndFlush(new NoteEntity(user, "Title", "Body text"));

        NoteEntity found = noteRepository.findByUser(user).orElseThrow();

        assertNotNull(saved.getId());
        assertEquals(saved.getId(), found.getId());
        assertEquals("Title", found.getTitle());
        assertEquals("Body text", found.getText());
    }

    @Test
    @DisplayName("findByUser is empty when the user has no note")
    void findByUserEmptyWhenMissing() {
        UserEntity user = userRepository.saveAndFlush(new UserEntity("note-nobody", "hash"));

        assertTrue(noteRepository.findByUser(user).isEmpty());
    }

    @Test
    @DisplayName("setters persist a replace of title and text")
    void settersPersistReplace() {
        UserEntity user = userRepository.saveAndFlush(new UserEntity("note-bob", "hash"));
        NoteEntity note = noteRepository.saveAndFlush(new NoteEntity(user, "Old", "Old body"));

        note.setTitle("New");
        note.setText("New body");
        noteRepository.saveAndFlush(note);

        NoteEntity found = noteRepository.findByUser(user).orElseThrow();
        assertEquals("New", found.getTitle());
        assertEquals("New body", found.getText());
    }

    @Test
    @DisplayName("second note for the same user violates the unique user_id constraint (V3)")
    void duplicateUserViolatesUniqueConstraint() {
        UserEntity user = userRepository.saveAndFlush(new UserEntity("note-carol", "hash"));
        noteRepository.saveAndFlush(new NoteEntity(user, "First", "First body"));

        assertThrows(
                DataIntegrityViolationException.class,
                () -> noteRepository.saveAndFlush(new NoteEntity(user, "Second", "Second body")));
    }
}
