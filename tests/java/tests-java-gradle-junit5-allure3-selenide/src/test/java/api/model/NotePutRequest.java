package api.model;

/** Request body for {@code PUT /api/note} — serialized by Rest Assured via Jackson. */
public record NotePutRequest(String title, String text) {
}
