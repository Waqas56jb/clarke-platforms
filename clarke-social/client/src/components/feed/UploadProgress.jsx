import { CircleAlert } from 'lucide-react';
import UploadRow from '../ui/UploadProgress';

// The shared progress row while uploading; the failure message with Retry afterwards.
export default function UploadProgress({ upload, label = 'Uploading', showProgress = true, onRetry }) {
  if (upload.uploading && showProgress)
    return <UploadRow label={label} progress={upload.progress} onCancel={upload.cancel} />;
  if (upload.status === 'failed')
    return (
      <div className="notice notice-error" role="alert">
        <CircleAlert size={16} aria-hidden="true" />
        <span className="grow">{upload.error}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  return null;
}
