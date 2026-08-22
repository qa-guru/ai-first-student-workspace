import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HomePage } from '../../pages/HomePage';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

function renderHome(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<div data-testid="login-landed">login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function stubDefaultApis(
  overrides?: (url: string, init?: RequestInit) => Response | Promise<Response> | null,
) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const override = overrides?.(url, init);
      if (override) return Promise.resolve(override);

      if (url.includes('/api/health')) {
        return Promise.resolve(jsonResponse({ status: 'UP', service: 'backend-java-spring' }));
      }
      if (url.includes('/api/items')) {
        return Promise.resolve(
          jsonResponse({ items: [{ id: 1, name: 'Alpha', description: 'First item' }] }),
        );
      }
      if (url.includes('/api/auth/me') && init?.method === 'DELETE') {
        return Promise.resolve({ ok: true, status: 204, json: async () => ({}) } as Response);
      }
      if (url.includes('/api/auth/me')) {
        return Promise.resolve(jsonResponse({ username: 'user1' }));
      }
      if (url.includes('/api/auth/logout')) {
        return Promise.resolve({ ok: true, status: 204, json: async () => ({}) } as Response);
      }
      if (url.includes('/api/note')) {
        const method = init?.method ?? 'GET';
        if (method === 'GET') {
          return Promise.resolve(jsonResponse({ message: 'Not found' }, false, 404));
        }
      }
      if (url.includes('/api/')) {
        return Promise.resolve(jsonResponse({ message: 'Not found' }, false, 404));
      }
      return Promise.reject(new Error(`unexpected request: ${url}`));
    }),
  );
}

type FetchMock = Mock<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>;

function deleteAccountCalls() {
  return (globalThis.fetch as unknown as FetchMock).mock.calls.filter(
    ([input, init]) => String(input).includes('/api/auth/me') && init?.method === 'DELETE',
  );
}

function noContentResponse(): Response {
  return { ok: true, status: 204, json: async () => ({}) } as Response;
}

function noteMethod(init?: RequestInit): string {
  return init?.method ?? 'GET';
}

function noteCalls(method: string) {
  return (globalThis.fetch as unknown as FetchMock).mock.calls.filter(
    ([input, init]) => String(input).includes('/api/note') && noteMethod(init) === method,
  );
}

function savedNoteResponse(title: string, text: string, status = 201): Response {
  return jsonResponse({ id: 7, title, text }, true, status);
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    stubDefaultApis();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the reference layout with health and items from the API', async () => {
    renderHome();

    expect(screen.getByTestId('multistack-layout')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId('health-status')).toHaveTextContent(
        '→ UP | service: backend-java-spring | frontend: frontend-typescript-react',
      ),
    );

    expect(await screen.findByTestId('item-row')).toHaveTextContent('Alpha');
  });

  it('keeps the welcome panel hidden without a session token', async () => {
    renderHome();

    await waitFor(() => expect(screen.getByTestId('item-row')).toBeInTheDocument());
    expect(screen.getByTestId('welcome-panel')).not.toBeVisible();
  });

  it('shows welcome, logout and delete account when profile loads for a session token', async () => {
    localStorage.setItem('authToken', 'valid-token');
    renderHome();

    expect(await screen.findByTestId('welcome-message')).toHaveTextContent('Welcome, user1!');
    expect(screen.getByTestId('welcome-panel')).toBeVisible();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-account-button')).toHaveTextContent('Delete account');
  });

  it('clears invalid session and keeps welcome hidden', async () => {
    localStorage.setItem('authToken', 'bad-token');
    stubDefaultApis((url) => {
      if (url.includes('/api/auth/me')) {
        return jsonResponse({ message: 'Unauthorized' }, false, 401);
      }
      return null;
    });

    renderHome();

    await waitFor(() => expect(screen.getByTestId('item-row')).toBeInTheDocument());
    expect(screen.getByTestId('welcome-panel')).not.toBeVisible();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('does not clear session after unmount when profile fetch fails', async () => {
    localStorage.setItem('authToken', 'stale-token');
    let rejectProfile!: (reason?: unknown) => void;
    const profilePromise = new Promise<Response>((_resolve, reject) => {
      rejectProfile = reject;
    });

    stubDefaultApis((url) => {
      if (url.includes('/api/auth/me')) {
        return profilePromise;
      }
      return null;
    });

    const { unmount } = renderHome();
    await waitFor(() => expect(screen.getByTestId('item-row')).toBeInTheDocument());
    unmount();
    rejectProfile(new Error('aborted'));
    await Promise.resolve();

    expect(localStorage.getItem('authToken')).toBe('stale-token');
  });

  it('does not apply health error after unmount', async () => {
    let rejectHealth!: (reason?: unknown) => void;
    const healthPromise = new Promise<Response>((_resolve, reject) => {
      rejectHealth = reject;
    });
    stubDefaultApis((url) => {
      if (url.includes('/api/health')) {
        return healthPromise;
      }
      return null;
    });

    const { unmount } = renderHome();
    await waitFor(() => expect(screen.getByTestId('item-row')).toBeInTheDocument());
    unmount();
    rejectHealth(new Error('aborted'));
    await Promise.resolve();
  });

  it('does not apply items error after unmount', async () => {
    let rejectItems!: (reason?: unknown) => void;
    const itemsPromise = new Promise<Response>((_resolve, reject) => {
      rejectItems = reject;
    });
    stubDefaultApis((url) => {
      if (url.includes('/api/items')) {
        return itemsPromise;
      }
      return null;
    });

    const { unmount } = renderHome();
    await waitFor(() => expect(screen.getByTestId('health-status')).toBeInTheDocument());
    unmount();
    rejectItems(new Error('aborted'));
    await Promise.resolve();
  });

  it('does not set welcome after unmount when profile resolves', async () => {
    localStorage.setItem('authToken', 'valid-token');
    let resolveProfile!: (value: Response) => void;
    const profilePromise = new Promise<Response>((resolve) => {
      resolveProfile = resolve;
    });
    stubDefaultApis((url) => {
      if (url.includes('/api/auth/me')) {
        return profilePromise;
      }
      return null;
    });

    const { unmount } = renderHome();
    await waitFor(() => expect(screen.getByTestId('item-row')).toBeInTheDocument());
    unmount();
    resolveProfile(jsonResponse({ username: 'user1' }));
    await Promise.resolve();
  });

  it('logs out and navigates to login', async () => {
    const user = userEvent.setup();
    localStorage.setItem('authToken', 'valid-token');
    renderHome();

    await screen.findByTestId('logout-button');
    await user.click(screen.getByTestId('logout-button'));

    expect(await screen.findByTestId('login-landed')).toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('deletes the account, clears the session and navigates to login', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('authToken', 'valid-token');
    renderHome();

    await screen.findByTestId('delete-account-button');
    await user.click(screen.getByTestId('delete-account-button'));

    expect(confirmSpy).toHaveBeenCalledWith('Delete this account? This cannot be undone.');
    expect(deleteAccountCalls()).toHaveLength(1);
    expect(deleteAccountCalls()[0][1]).toMatchObject({
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-token' },
    });
    expect(await screen.findByTestId('login-landed')).toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBeNull();
    confirmSpy.mockRestore();
  });

  it('cancelling the confirm keeps the session and sends no delete request', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    localStorage.setItem('authToken', 'valid-token');
    renderHome();

    await screen.findByTestId('delete-account-button');
    await user.click(screen.getByTestId('delete-account-button'));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(deleteAccountCalls()).toHaveLength(0);
    expect(screen.queryByTestId('login-landed')).not.toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBe('valid-token');
    confirmSpy.mockRestore();
  });

  // Mirrors logout: the local session goes even when the API refuses the token.
  it('clears the session when the delete call is rejected', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('authToken', 'valid-token');
    stubDefaultApis((url, init) => {
      if (url.includes('/api/auth/me') && init?.method === 'DELETE') {
        return jsonResponse({ message: 'Unauthorized' }, false, 401);
      }
      return null;
    });

    renderHome();

    await screen.findByTestId('delete-account-button');
    await user.click(screen.getByTestId('delete-account-button'));

    expect(await screen.findByTestId('login-landed')).toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBeNull();
    confirmSpy.mockRestore();
  });

  it('shows health error state when health API fails', async () => {
    stubDefaultApis((url) => {
      if (url.includes('/api/health')) {
        return jsonResponse({ message: 'down' }, false, 500);
      }
      return null;
    });

    renderHome();

    await waitFor(() =>
      expect(screen.getByTestId('health-status')).toHaveTextContent('✗ health: HTTP 500'),
    );
  });

  it('shows items error state when items API fails', async () => {
    stubDefaultApis((url) => {
      if (url.includes('/api/items')) {
        return jsonResponse({ message: 'boom' }, false, 500);
      }
      return null;
    });

    renderHome();

    await waitFor(() =>
      expect(screen.getByTestId('items-list')).toHaveTextContent('✗ items: HTTP 500'),
    );
  });

  it('treats a missing items array as empty', async () => {
    stubDefaultApis((url) => {
      if (url.includes('/api/items')) {
        return jsonResponse({});
      }
      return null;
    });

    renderHome();

    await waitFor(() =>
      expect(screen.getByTestId('items-list')).toHaveTextContent('No items found.'),
    );
  });

  it('does not update health after unmount', async () => {
    let resolveHealth!: (value: Response) => void;
    const healthPromise = new Promise<Response>((resolve) => {
      resolveHealth = resolve;
    });
    stubDefaultApis((url) => {
      if (url.includes('/api/health')) {
        return healthPromise;
      }
      return null;
    });

    const { unmount } = renderHome();
    unmount();
    resolveHealth(jsonResponse({ status: 'UP', service: 'backend-java-spring' }));
    await Promise.resolve();
  });

  it('shows empty items state when API returns no rows', async () => {
    stubDefaultApis((url) => {
      if (url.includes('/api/items')) {
        return jsonResponse({ items: [] });
      }
      return null;
    });

    renderHome();

    await waitFor(() =>
      expect(screen.getByTestId('items-list')).toHaveTextContent('No items found.'),
    );
  });

  describe('note-panel', () => {
    async function renderLoggedInNotePanel() {
      localStorage.setItem('authToken', 'valid-token');
      renderHome();
      expect(await screen.findByTestId('welcome-message')).toHaveTextContent('Welcome, user1!');
      await waitFor(() => expect(screen.getByTestId('note-panel')).toBeVisible());
    }

    it('keeps the panel hidden without a session token', async () => {
      renderHome();

      expect(await screen.findByTestId('item-row')).toBeInTheDocument();
      expect(screen.getByTestId('note-panel')).not.toBeVisible();
      expect(noteCalls('GET')).toHaveLength(0);
    });

    it('keeps the note panel hidden until GET /api/note settles', async () => {
      localStorage.setItem('authToken', 'valid-token');
      let resolveNote!: (value: Response) => void;
      const notePromise = new Promise<Response>((resolve) => {
        resolveNote = resolve;
      });
      stubDefaultApis((url, init) => {
        if (url.includes('/api/note') && noteMethod(init) === 'GET') {
          return notePromise;
        }
        return null;
      });

      renderHome();
      expect(await screen.findByTestId('welcome-message')).toHaveTextContent('Welcome, user1!');
      expect(screen.getByTestId('note-panel')).not.toBeVisible();

      resolveNote(jsonResponse({ id: 7, title: 'Ship', text: 'Write the PUT path' }));
      await waitFor(() => expect(screen.getByTestId('note-panel')).toBeVisible());
      expect(screen.getByTestId('note-title-input')).toHaveValue('Ship');
      expect(screen.getByTestId('note-input')).toHaveValue('Write the PUT path');
    });

    it('shows empty state when GET /api/note is 404', async () => {
      await renderLoggedInNotePanel();

      await waitFor(() => expect(noteCalls('GET')).toHaveLength(1));
      expect(screen.getByTestId('note-form')).toBeInTheDocument();
      expect(screen.getByTestId('note-title-input')).toHaveValue('');
      expect(screen.getByTestId('note-input')).toHaveValue('');
      expect(screen.getByTestId('note-save-button')).toBeEnabled();
      expect(screen.getByTestId('note-delete-button')).toBeDisabled();
      expect(screen.getByTestId('note-error')).not.toBeVisible();
    });

    it('fills the form from GET /api/note 200', async () => {
      stubDefaultApis((url, init) => {
        if (url.includes('/api/note') && noteMethod(init) === 'GET') {
          return jsonResponse({ id: 7, title: 'Ship', text: 'Write the PUT path' });
        }
        return null;
      });

      await renderLoggedInNotePanel();

      await waitFor(() => expect(screen.getByTestId('note-title-input')).toHaveValue('Ship'));
      expect(screen.getByTestId('note-input')).toHaveValue('Write the PUT path');
      expect(screen.getByTestId('note-delete-button')).toBeEnabled();
    });

    it('save sends PUT with JSON, never PATCH', async () => {
      const user = userEvent.setup();
      stubDefaultApis((url, init) => {
        if (url.includes('/api/note') && init?.method === 'PUT') {
          const body = JSON.parse(String(init.body)) as { title: string; text: string };
          return savedNoteResponse(body.title, body.text, 201);
        }
        return null;
      });

      await renderLoggedInNotePanel();
      await user.type(screen.getByTestId('note-title-input'), 'Ship');
      await user.type(screen.getByTestId('note-input'), 'Write the PUT path');
      await user.click(screen.getByTestId('note-save-button'));

      await waitFor(() => expect(noteCalls('PUT')).toHaveLength(1));
      await waitFor(() => expect(screen.getByTestId('note-delete-button')).toBeEnabled());
      expect(noteCalls('PATCH')).toHaveLength(0);
      expect(noteCalls('POST')).toHaveLength(0);
      expect(noteCalls('PUT')[0][1]).toMatchObject({
        method: 'PUT',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
      });
      expect(JSON.parse(String(noteCalls('PUT')[0][1]?.body))).toEqual({
        title: 'Ship',
        text: 'Write the PUT path',
      });
      expect(screen.getByTestId('note-error')).not.toBeVisible();
    });

    it('edit of an existing note still sends PUT, not PATCH', async () => {
      const user = userEvent.setup();
      stubDefaultApis((url, init) => {
        const method = noteMethod(init);
        if (!url.includes('/api/note')) {
          return null;
        }
        if (method === 'GET') {
          return jsonResponse({ id: 7, title: 'Ship', text: 'Draft' });
        }
        if (method === 'PUT') {
          const body = JSON.parse(String(init?.body)) as { title: string; text: string };
          return savedNoteResponse(body.title, body.text, 200);
        }
        return null;
      });

      await renderLoggedInNotePanel();
      await waitFor(() => expect(screen.getByTestId('note-input')).toHaveValue('Draft'));
      await user.clear(screen.getByTestId('note-input'));
      await user.type(screen.getByTestId('note-input'), 'Write the PUT path');
      await user.click(screen.getByTestId('note-save-button'));

      await waitFor(() => expect(noteCalls('PUT')).toHaveLength(1));
      expect(noteCalls('PATCH')).toHaveLength(0);
      expect(JSON.parse(String(noteCalls('PUT')[0][1]?.body))).toEqual({
        title: 'Ship',
        text: 'Write the PUT path',
      });
    });

    it('delete returns the form to empty state', async () => {
      const user = userEvent.setup();
      stubDefaultApis((url, init) => {
        const method = noteMethod(init);
        if (!url.includes('/api/note')) {
          return null;
        }
        if (method === 'GET') {
          return jsonResponse({ id: 7, title: 'Ship', text: 'Write the PUT path' });
        }
        if (method === 'DELETE') {
          return noContentResponse();
        }
        return null;
      });

      await renderLoggedInNotePanel();
      await waitFor(() => expect(screen.getByTestId('note-delete-button')).toBeEnabled());
      await user.click(screen.getByTestId('note-delete-button'));

      await waitFor(() => expect(noteCalls('DELETE')).toHaveLength(1));
      expect(noteCalls('DELETE')[0][1]).toMatchObject({
        method: 'DELETE',
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(screen.getByTestId('note-title-input')).toHaveValue('');
      expect(screen.getByTestId('note-input')).toHaveValue('');
      expect(screen.getByTestId('note-delete-button')).toBeDisabled();
      expect(screen.getByTestId('note-error')).not.toBeVisible();
    });

    it('shows required-text error in the panel without sending PUT', async () => {
      const user = userEvent.setup();
      await renderLoggedInNotePanel();

      await user.type(screen.getByTestId('note-title-input'), 'Ship');
      await user.click(screen.getByTestId('note-save-button'));

      await waitFor(() =>
        expect(screen.getByTestId('note-error')).toHaveTextContent('Text is required'),
      );
      expect(screen.getByTestId('note-error')).toBeVisible();
      expect(noteCalls('PUT')).toHaveLength(0);
    });

    it('shows the API error text when save fails', async () => {
      const user = userEvent.setup();
      stubDefaultApis((url, init) => {
        if (url.includes('/api/note') && init?.method === 'PUT') {
          return jsonResponse({ message: 'text: must not be blank' }, false, 400);
        }
        return null;
      });

      await renderLoggedInNotePanel();
      await user.type(screen.getByTestId('note-input'), 'Write the PUT path');
      await user.click(screen.getByTestId('note-save-button'));

      await waitFor(() =>
        expect(screen.getByTestId('note-error')).toHaveTextContent('text: must not be blank'),
      );
      expect(screen.getByTestId('note-error')).toBeVisible();
      expect(screen.getByTestId('note-delete-button')).toBeDisabled();
    });

    it('shows the API error text when delete fails', async () => {
      const user = userEvent.setup();
      stubDefaultApis((url, init) => {
        const method = noteMethod(init);
        if (!url.includes('/api/note')) {
          return null;
        }
        if (method === 'GET') {
          return jsonResponse({ id: 7, title: 'Ship', text: 'Write the PUT path' });
        }
        if (method === 'DELETE') {
          return jsonResponse({ message: 'Note is locked' }, false, 500);
        }
        return null;
      });

      await renderLoggedInNotePanel();
      await waitFor(() => expect(screen.getByTestId('note-delete-button')).toBeEnabled());
      await user.click(screen.getByTestId('note-delete-button'));

      await waitFor(() =>
        expect(screen.getByTestId('note-error')).toHaveTextContent('Note is locked'),
      );
      expect(screen.getByTestId('note-title-input')).toHaveValue('Ship');
      expect(screen.getByTestId('note-delete-button')).toBeEnabled();
    });

    it('shows the API error text when GET /api/note fails', async () => {
      stubDefaultApis((url, init) => {
        if (url.includes('/api/note') && noteMethod(init) === 'GET') {
          return jsonResponse({ message: 'Note store down' }, false, 500);
        }
        return null;
      });

      await renderLoggedInNotePanel();

      await waitFor(() =>
        expect(screen.getByTestId('note-error')).toHaveTextContent('Note store down'),
      );
      expect(screen.getByTestId('note-error')).toBeVisible();
    });

    it('does not apply a late GET /api/note after unmount', async () => {
      localStorage.setItem('authToken', 'valid-token');
      let resolveNote!: (value: Response) => void;
      const notePromise = new Promise<Response>((resolve) => {
        resolveNote = resolve;
      });
      stubDefaultApis((url, init) => {
        if (url.includes('/api/note') && noteMethod(init) === 'GET') {
          return notePromise;
        }
        return null;
      });

      const { unmount } = renderHome();
      expect(await screen.findByTestId('welcome-message')).toHaveTextContent('Welcome, user1!');
      unmount();
      resolveNote(jsonResponse({ id: 7, title: 'Late', text: 'Should not apply' }));
      await Promise.resolve();

      expect(screen.queryByTestId('note-title-input')).not.toBeInTheDocument();
    });

    it('does not set welcome after unmount when profile arrives late', async () => {
      localStorage.setItem('authToken', 'valid-token');
      let resolveProfile!: (value: Response) => void;
      const profilePromise = new Promise<Response>((resolve) => {
        resolveProfile = resolve;
      });
      stubDefaultApis((url, init) => {
        if (url.includes('/api/auth/me') && init?.method !== 'DELETE') {
          return profilePromise;
        }
        return null;
      });

      const { unmount } = renderHome();
      expect(await screen.findByTestId('item-row')).toBeInTheDocument();
      unmount();
      resolveProfile(jsonResponse({ username: 'late-user' }));
      await Promise.resolve();

      expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
    });
  });
});
