import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_KEY } from '../../lib/auth';
import { deleteNote, fetchNote, putNote } from '../../lib/note';

describe('note client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when there is no auth token', async () => {
    await expect(fetchNote()).rejects.toThrow('Missing auth token');
    await expect(putNote('t', 'body')).rejects.toThrow('Missing auth token');
    await expect(deleteNote()).rejects.toThrow('Missing auth token');
  });

  it('GET 404 is an empty singleton, not an error', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Note not found' }),
      }),
    );

    await expect(fetchNote()).resolves.toBeNull();
  });

  it('non-404 errors surface the API message', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Note store down' }),
      }),
    );

    await expect(fetchNote()).rejects.toThrow('Note store down');
    await expect(putNote('t', 'body')).rejects.toThrow('Note store down');
    await expect(deleteNote()).rejects.toThrow('Note store down');
  });

  it('falls back when the error body has no string message', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 503 }),
      }),
    );

    await expect(fetchNote()).rejects.toThrow('Request failed');
    await expect(putNote('t', 'body')).rejects.toThrow('Request failed');
    await expect(deleteNote()).rejects.toThrow('Request failed');
  });

  it('falls back when the error body is not JSON', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('not json');
        },
      }),
    );

    await expect(fetchNote()).rejects.toThrow('Request failed');
  });
});
