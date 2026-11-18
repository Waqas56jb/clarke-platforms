// Same reference format the page generated before ("WSE-" / "DEMO-" + base-36 timestamp),
// bumped by a millisecond when two records are created in the same instant.
function makeIdFactory(prefix, exists) {
  return () => {
    let t = Date.now();
    let id = `${prefix}-${t.toString(36).toUpperCase()}`;
    while (exists(id)) {
      t += 1;
      id = `${prefix}-${t.toString(36).toUpperCase()}`;
    }
    return id;
  };
}

module.exports = { makeIdFactory };
