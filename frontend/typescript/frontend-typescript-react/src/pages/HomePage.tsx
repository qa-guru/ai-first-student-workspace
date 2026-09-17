import { Button, Panel, PlaqueField } from '@zero-design-system/react';
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { fetchHealth, fetchItems, type Item } from '../lib/api';
import { UI_MOUNT } from '../lib/appBase';
import {
  clearSession,
  deleteAccount,
  fetchProfile,
  formatMessage,
  getToken,
  logout,
} from '../lib/auth';
import { NOTE_MESSAGES } from '../lib/messages';
import { deleteNote, fetchNote, putNote } from '../lib/note';

type HealthState =
  | { status: 'checking' }
  | { status: 'ok'; service: string; health: string }
  | { status: 'error'; message: string };
type ItemsState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'loaded'; items: Item[] }
  | { status: 'error'; message: string };

function Blurb({ template }: { template: string }) {
  const [before, after] = template.split('{api}');
  return (
    <p className="text text--muted">
      {before}
      <code>/api/items</code>
      {after}
    </p>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { copy } = useI18n();
  const [health, setHealth] = useState<HealthState>({ status: 'checking' });
  const [items, setItems] = useState<ItemsState>({ status: 'loading' });
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [hasNote, setHasNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteBusy, setNoteBusy] = useState(false);
  const [noteReady, setNoteReady] = useState(false);

  useEffect(() => {
    let active = true;

    fetchHealth()
      .then((payload) => {
        if (active) {
          setHealth({ status: 'ok', health: payload.status, service: payload.service });
        }
      })
      .catch((error: Error) => {
        if (active) {
          setHealth({ status: 'error', message: error.message });
        }
      });

    fetchItems()
      .then((payload) => {
        if (!active) return;
        const list = payload.items ?? [];
        setItems(list.length ? { status: 'loaded', items: list } : { status: 'empty' });
      })
      .catch((error: Error) => {
        if (active) {
          setItems({ status: 'error', message: error.message });
        }
      });

    if (getToken()) {
      fetchProfile()
        .then(async (profile) => {
          if (!active) {
            return;
          }
          setWelcomeName(profile.username);
          try {
            const note = await fetchNote();
            if (!active) {
              return;
            }
            if (note) {
              setNoteTitle(note.title);
              setNoteText(note.text);
              setHasNote(true);
            }
          } catch (error) {
            if (active) {
              setNoteError(error instanceof Error ? error.message : NOTE_MESSAGES.errorSaveFailed);
            }
          } finally {
            if (active) {
              setNoteReady(true);
            }
          }
        })
        .catch(() => {
          if (active) {
            clearSession();
          }
        });
    }

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(copy.home.deleteConfirm)) {
      return;
    }
    await deleteAccount();
    navigate('/login');
  };

  const handleSaveNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNoteError('');
    if (!noteText.trim()) {
      setNoteError(NOTE_MESSAGES.errorTextRequired);
      return;
    }
    setNoteBusy(true);
    try {
      const saved = await putNote(noteTitle, noteText);
      setNoteTitle(saved.title);
      setNoteText(saved.text);
      setHasNote(true);
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : NOTE_MESSAGES.errorSaveFailed);
    } finally {
      setNoteBusy(false);
    }
  };

  const handleDeleteNote = async () => {
    setNoteError('');
    setNoteBusy(true);
    try {
      await deleteNote();
      setNoteTitle('');
      setNoteText('');
      setHasNote(false);
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : NOTE_MESSAGES.errorDeleteFailed);
    } finally {
      setNoteBusy(false);
    }
  };

  const healthText =
    health.status === 'checking'
      ? copy.home.healthChecking
      : health.status === 'ok'
        ? formatMessage(copy.home.healthOk, {
            status: health.health,
            service: health.service,
            frontend: UI_MOUNT,
          })
        : formatMessage(copy.home.healthError, { message: health.message });

  return (
    <main
      className="page-shell page-shell--below-header grid multistack"
      data-testid="multistack-layout"
    >
      <Panel title={copy.home.title}>
        <Blurb template={copy.home.blurb} />
      </Panel>

      <Panel
        title={copy.home.session}
        testId="welcome-panel"
        hidden={welcomeName === null}
        bodyClassName="multistack__welcome-body"
      >
        <p id="welcome-message" className="text" data-testid="welcome-message">
          {welcomeName === null ? '' : formatMessage(copy.home.welcome, { username: welcomeName })}
        </p>
        <Button
          id="logout-button"
          variant="primary"
          data-testid="logout-button"
          onClick={handleLogout}
        >
          {copy.home.logout}
        </Button>
        <Button
          id="delete-account-button"
          variant="danger"
          data-testid="delete-account-button"
          onClick={handleDeleteAccount}
        >
          {copy.home.deleteAccount}
        </Button>
      </Panel>

      <Panel
        title="Note"
        testId="note-panel"
        hidden={welcomeName === null || !noteReady}
        bodyClassName="multistack__note-body"
      >
        <form
          id="note-form"
          className="auth-form"
          data-testid="note-form"
          onSubmit={handleSaveNote}
        >
          <div className="plaque-field-list">
            <PlaqueField
              label="Title"
              id="note-title-input"
              name="noteTitle"
              type="text"
              maxLength={120}
              data-testid="note-title-input"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <PlaqueField
              label="Text"
              id="note-input"
              name="noteText"
              multiline
              rows={4}
              maxLength={2000}
              data-testid="note-input"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          <p
            className="multistack__error"
            aria-live="polite"
            data-testid="note-error"
            hidden={!noteError}
          >
            {noteError}
          </p>
          <div className="multistack__note-actions">
            <Button
              id="note-save-button"
              type="submit"
              variant="primary"
              data-testid="note-save-button"
              disabled={noteBusy}
            >
              Save
            </Button>
            <Button
              id="note-delete-button"
              type="button"
              variant="danger"
              data-testid="note-delete-button"
              disabled={noteBusy || !hasNote}
              onClick={handleDeleteNote}
            >
              Delete
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title={copy.home.health} testId="health-panel">
        <p
          className={
            health.status === 'error'
              ? 'text text--sm text--muted multistack__error'
              : 'text text--sm text--muted'
          }
          data-testid="health-status"
        >
          {healthText}
        </p>
      </Panel>

      <div className="grid" data-testid="items-list" aria-live="polite">
        {items.status === 'loading' && (
          <Panel title={copy.home.items}>
            <p className="text text--muted">{copy.home.itemsLoading}</p>
          </Panel>
        )}
        {items.status === 'empty' && (
          <Panel title={copy.home.items}>
            <p className="text text--muted">{copy.home.itemsEmpty}</p>
          </Panel>
        )}
        {items.status === 'error' && (
          <Panel title={copy.home.items}>
            <p className="multistack__error">
              {formatMessage(copy.home.itemsError, { message: items.message })}
            </p>
          </Panel>
        )}
        {items.status === 'loaded' &&
          items.items.map((item) => (
            <Panel key={item.id} title={item.name} testId="item-row">
              <p className="text text--muted">{item.description}</p>
            </Panel>
          ))}
      </div>
    </main>
  );
}
