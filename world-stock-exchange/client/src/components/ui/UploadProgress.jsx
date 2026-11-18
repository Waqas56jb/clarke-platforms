// Upload progress row (label, percent, bar, Cancel) and a hook that runs one cancellable upload.
import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

// run(send) calls send({ onProgress, signal }) and tracks its progress; cancel() aborts it
// (the upload then rejects with code 'UPLOAD_CANCELLED').
export function useUploadTask() {
  const [progress, setProgress] = useState(null);
  const controller = useRef(null);

  const run = useCallback(async (send) => {
    controller.current = new AbortController();
    setProgress(0);
    try {
      return await send({ onProgress: setProgress, signal: controller.current.signal });
    } finally {
      controller.current = null;
      setProgress(null);
    }
  }, []);

  const cancel = useCallback(() => controller.current?.abort(), []);
  return { progress, busy: progress !== null, run, cancel };
}

export default function UploadProgress({ label, progress, onCancel }) {
  return (
    <div className="upload-item">
      <span className="upload-thumb" aria-hidden="true">
        <Upload size={20} />
      </span>
      <div className="upload-meta">
        <div className="row">
          <span className="grow truncate text-sm">{label}</span>
          <span className="caption">{progress}%</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
