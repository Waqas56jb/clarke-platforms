// Listing document types and the client-side pre-check. The server checks each file's real content.
export const DOCUMENT_KINDS = [
  ['prospectus', 'Prospectus / offering document'],
  ['financials', 'Financial statements / audit reports'],
  ['incorporation', 'Certificate of incorporation'],
  ['regulatory', 'Regulatory registration / exemption evidence'],
];

export const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const EXTENSIONS = ACCEPT.split(',');
const MAX_MB = 20;

export const ACCEPT_NOTE = `PDF, Word (.doc/.docx), JPEG or PNG, up to ${MAX_MB} MB.`;

export function fileProblem(file) {
  const name = file.name.toLowerCase();
  if (!EXTENSIONS.some((ext) => name.endsWith(ext)))
    return 'Documents must be PDF, Word (.doc/.docx), JPEG or PNG files.';
  if (file.size > MAX_MB * 1024 * 1024) return `This file is larger than ${MAX_MB} MB.`;
  if (!file.size) return 'This file is empty.';
  return '';
}
