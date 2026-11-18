// Runs one upload at a time with progress, cancel and a failure message the dialog can offer to retry.
import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE = { status: 'idle', progress: 0, error: '' };

export function useUpload() {
  const [state, setState] = useState(IDLE);
  const controller = useRef(null);

  useEffect(() => () => controller.current?.abort(), []);

  // send({ onProgress, signal }) performs the request; resolves to its result, or null if it failed/was cancelled.
  const run = useCallback(async (send) => {
    const ctrl = new AbortController();
    controller.current = ctrl;
    setState({ status: 'uploading', progress: 0, error: '' });
    try {
      const result = await send({
        onProgress: (progress) => setState((s) => ({ ...s, progress })),
        signal: ctrl.signal,
      });
      setState(IDLE);
      return result;
    } catch (err) {
      setState(
        err.code === 'UPLOAD_CANCELLED'
          ? IDLE
          : { status: 'failed', progress: 0, error: err.message || 'Upload failed. Please try again.' }
      );
      return null;
    } finally {
      controller.current = null;
    }
  }, []);

  const cancel = useCallback(() => controller.current?.abort(), []);

  return { ...state, uploading: state.status === 'uploading', run, cancel };
}
