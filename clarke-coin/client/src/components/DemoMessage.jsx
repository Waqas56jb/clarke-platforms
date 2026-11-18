export default function DemoMessage({ visible }) {
  return (
    <div id="message" style={visible ? { display: 'block' } : undefined}>
      This is a website preview. Trading and wallet functions are not connected.
    </div>
  );
}
