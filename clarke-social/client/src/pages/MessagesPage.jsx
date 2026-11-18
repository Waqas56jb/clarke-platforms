import ViewHeading from '../components/ViewHeading';

export default function MessagesPage() {
  return (
    <>
      <ViewHeading title="Private messages" subtitle="Secure conversations are a core part of Clarke." />
      <div className="empty-state">
        <div style={{ fontSize: 30, color: 'var(--blue)' }}>▤</div>
        <b>Private chat is being secured</b>
        <p>
          We are not enabling message storage until a maintained Signal Protocol implementation, device identity
          verification and key management are integrated. This avoids presenting ordinary server-readable messages as
          end-to-end encrypted.
        </p>
      </div>
    </>
  );
}
