// Remembers the literal text of JSON numbers (e.g. "10.50") so amounts are echoed exactly as the
// Python service did. Uses JSON.parse source-text access where the runtime supports it.
const sources = new WeakMap();

function reviver(key, value, context) {
  if (typeof value === 'number' && context && typeof context.source === 'string') {
    if (!sources.has(this)) sources.set(this, {});
    sources.get(this)[key] = context.source;
  }
  return value;
}

const numberSourcesOf = (holder) => (holder && typeof holder === 'object' ? sources.get(holder) || {} : {});

module.exports = { reviver, numberSourcesOf };
