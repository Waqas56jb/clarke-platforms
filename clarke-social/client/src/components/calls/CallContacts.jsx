import { Phone, Users, Video } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { listContacts } from '../../services/messagesService';
import Avatar from '../Avatar';
import { AsyncView, EmptyState } from '../StateView';

export default function CallContacts({ onCall }) {
  const state = useAsync(() => listContacts().then((d) => d.contacts), []);
  return (
    <AsyncView
      state={state}
      skeleton="list"
      count={3}
      loadingText="Loading contacts"
      errorTitle="Couldn't load contacts"
    >
      {(contacts) =>
        contacts.length ? (
          <ul className="call-list">
            {contacts.map((u) => (
              <li className="list-row call-row" key={u.id}>
                <Avatar src={u.avatar} name={u.displayName} />
                <div className="list-row-main">
                  <span className="list-row-title">{u.displayName}</span>
                  <span className="list-row-sub">@{u.username}</span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Start voice call with ${u.displayName}`}
                  onClick={() => onCall('audio', u.id, u.displayName, u.avatar)}
                >
                  <Phone size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Start video call with ${u.displayName}`}
                  onClick={() => onCall('video', u.id, u.displayName, u.avatar)}
                >
                  <Video size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Users} title="No one to call yet" plain>
            You can call dating matches and members who follow you back.
          </EmptyState>
        )
      }
    </AsyncView>
  );
}
