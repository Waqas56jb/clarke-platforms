const STATUS = {
  pending: ['badge-warning', 'Pending review'],
  approved: ['badge-success', 'Approved'],
  rejected: ['badge-error', 'Rejected'],
};

export default function StatusBadge({ status }) {
  const [className, label] = STATUS[status] || ['badge-neutral', status];
  return <span className={`badge ${className}`}>{label}</span>;
}
