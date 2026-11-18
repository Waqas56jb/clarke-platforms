import { useEffect, useState } from 'react';

const canPickOutput = () =>
  typeof HTMLMediaElement !== 'undefined' &&
  'setSinkId' in HTMLMediaElement.prototype &&
  Boolean(navigator.mediaDevices?.enumerateDevices);

// Audio output devices, only when the browser can route call audio to a chosen device and
// there is more than one to choose from; otherwise an empty list.
export function useAudioOutputs() {
  const [outputs, setOutputs] = useState([]);
  useEffect(() => {
    if (!canPickOutput()) return undefined;
    let active = true;
    const load = () =>
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const list = devices.filter((d) => d.kind === 'audiooutput');
          if (active) setOutputs(list.length > 1 ? list : []);
        })
        .catch(() => {});
    load();
    navigator.mediaDevices.addEventListener?.('devicechange', load);
    return () => {
      active = false;
      navigator.mediaDevices.removeEventListener?.('devicechange', load);
    };
  }, []);
  return outputs;
}
