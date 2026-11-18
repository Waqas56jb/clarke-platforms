// The four listing document types of one application. Files can be added and removed while it is pending.
import { ACCEPT_NOTE, DOCUMENT_KINDS } from '../../utils/documents';
import DocumentRow from './DocumentRow';

export default function DocumentManager({ application: a, onDocumentsChange }) {
  const editable = a.status === 'pending';
  // Updaters, so uploads finishing at the same time in different rows are all kept.
  const add = (doc) => onDocumentsChange((docs) => [...docs, doc]);
  const remove = (id) => onDocumentsChange((docs) => docs.filter((d) => d.id !== id));
  return (
    <div className="doc-manager">
      {editable && (
        <p className="file-note">
          {ACCEPT_NOTE} Each file is checked by its content and stored privately for the exchange reviewers.
        </p>
      )}
      {DOCUMENT_KINDS.map(([kind, label]) => (
        <DocumentRow
          key={kind}
          applicationId={a.id}
          kind={kind}
          label={label}
          docs={a.documents.filter((d) => d.kind === kind)}
          editable={editable}
          onAdded={add}
          onRemoved={remove}
        />
      ))}
    </div>
  );
}
