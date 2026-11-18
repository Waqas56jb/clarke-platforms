// A picked photo/video plus a local preview URL. Callers release it when it is replaced or discarded.
export const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

export const toMedia = (file) =>
  file ? { file, url: URL.createObjectURL(file), isVideo: file.type.startsWith('video/') } : null;

export const releaseMedia = (media) => {
  if (media) URL.revokeObjectURL(media.url);
};
