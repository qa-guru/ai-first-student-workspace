package tests.e2e;

import annotations.Layer;
import api.AuthApiClient;
import helpers.DataFaker;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import tests.TestBase;

@Layer("e2e")
@Epic("Note")
@Feature("Note")
@Severity(SeverityLevel.CRITICAL)
@DisplayName("Note")
class NoteTests extends TestBase {

    private static final String PASSWORD = "password123";

    /** Throwaway account — never seeded user1. */
    private String throwawayUsername;

    @AfterEach
    void cleanupThrowawayUser() {
        if (throwawayUsername != null) {
            AuthApiClient.deleteAccountQuietly(throwawayUsername, PASSWORD);
            throwawayUsername = null;
        }
    }

    @Test
    @Tag("e2e")
    @Tag("positive")
    @DisplayName("Logged-in user can see or create a note by saving")
    void shouldSeeOrCreateNoteAfterLogin() {
        throwawayUsername = DataFaker.username();
        AuthApiClient.register(throwawayUsername, PASSWORD);
        String title = "Takeaway note";
        String text = "Saved with PUT " + UUID.randomUUID();

        loginPage.openPage()
                .fillAndSubmitForm(throwawayUsername, PASSWORD)
                .shouldShowNotePanel()
                .fillAndSaveNote(title, text)
                .shouldShowNote(title, text);
    }
}
