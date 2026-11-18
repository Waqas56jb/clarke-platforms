// SQL expression and formatter that reproduce Python's datetime.isoformat() for UTC timestamps,
// e.g. "2026-01-02T03:04:05.123456+00:00" (microseconds omitted when zero).
const isoTimestampSql = (column) => `to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')`;

const toPythonIso = (value) => `${value.replace(/\.000000$/, '')}+00:00`;

module.exports = { isoTimestampSql, toPythonIso };
