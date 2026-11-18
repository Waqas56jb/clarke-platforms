// One document type of an application: its uploaded files (download, remove while pending) and, while
// pending, a file picker that uploads straight away with progress, cancel and retry.
import { useState } from 'react';
import { Download, FileText, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { openDocument, removeDocument } from '../../services/issuerService';
import { uploadDocument } from '../../services/http';
import { ACCEPT, fileProblem } from '../../utils/documents';
import { fileSize } from '../../utils/format';
import { useConfirm } from '../ui/ConfirmDialog';
import UploadProgress, { useUploadTask } from '../ui/UploadProgress';

function UploadedFile({ applicationId, doc, editable, onRemoved }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [busy, setBusy] = useState(false);

  const download = () => openDocument(applicationId, doc.id).catch((e) => toast(e.message, 'error'));
  const remove = async () => {
    const ok = await confirm({
      title: 'Remove this document?',
      message: `${doc.name} will be deleted from this application.`,
      confirmLabel: 'Remove document',
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await removeDocument(applicationId, doc.id);
      onRemoved(doc.id);
      toast('Document removed.', 'success');
    } catch (e) {
      toast(e.message, 'error');
      setBusy(false);
    }
  };

  return (
    <li className="doc-file">
      <FileText size={20} aria-hidden="true" />
      <span className="grow">
        <span className="doc-name">{doc.name}</span>
        <span className="caption">{fileSize(doc.size)}</span>
      </span>
      <button type="button" className="icon-btn" aria-label={`Download ${doc.name}`} onClick={download}>
        <Download size={18} aria-hidden="true" />
      </button>
      {editable && (
        <button type="button" className="icon-btn" aria-label={`Remove ${doc.name}`} onClick={remove} disabled={busy}>
          <Trash2 size={18} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

export default function DocumentRow({ applicationId, kind, label, docs, editable, onAdded, onRemoved }) {
  const toast = useToast();
  const task = useUploadTask();
  const [failed, setFailed] = useState(null); // { file, message, retry }
  const [uploading, setUploading] = useState('');
  const inputId = `doc-${kind}-${applicationId}`;

  const send = async (file) => {
    setFailed(null);
    setUploading(file.name);
    try {
      const { document } = await task.run((options) => uploadDocument(applicationId, kind, file, options));
      onAdded(document);
      toast(`${file.name} uploaded.`, 'success');
    } catch (e) {
      setFailed({ file, message: e.message, retry: true });
    }
  };

  const onPick = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const problem = fileProblem(file);
    if (problem) setFailed({ file, message: problem, retry: false });
    else send(file);
  };

  return (
    <div className="doc-row">
      <div className="doc-row-head">
        <span className="field-label">{label}</span>
        {editable && !task.busy && (
          <span className="file-picker">
            <input
              id={inputId}
              name={`doc-${kind}`}
              type="file"
              accept={ACCEPT}
              className="file-input"
              onChange={onPick}
            />
            <label htmlFor={inputId} className="btn btn-secondary btn-sm">
              <Upload size={16} aria-hidden="true" />
              {docs.length ? 'Add file' : 'Choose file'}
            </label>
          </span>
        )}
      </div>
      {docs.length > 0 && (
        <ul className="doc-files">
          {docs.map((doc) => (
            <UploadedFile
              key={doc.id}
              applicationId={applicationId}
              doc={doc}
              editable={editable}
              onRemoved={onRemoved}
            />
          ))}
        </ul>
      )}
      {!docs.length && !task.busy && !failed && <p className="caption">No file uploaded.</p>}
      {task.busy && <UploadProgress label={`Uploading ${uploading}`} progress={task.progress} onCancel={task.cancel} />}
      {failed && (
        <div className="notice notice-error doc-error" role="alert">
          <span className="grow">
            {failed.file.name}: {failed.message}
          </span>
          {failed.retry && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => send(failed.file)}>
              <RotateCcw size={16} aria-hidden="true" />
              Retry
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFailed(null)}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
