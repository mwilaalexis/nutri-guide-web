export default function Logs() {
  return (
    <>
      <h1>System logs</h1>
      <p>Recent system activity.</p>

      <ul className="log-list">
        <li>[12:04] User Sarah Johnson updated her profile.</li>
        <li>[11:58] New recipe added: baked salmon.</li>
        <li>[11:40] Admin Alexis created a new plan.</li>
        <li>[11:22] Server restarted successfully.</li>
      </ul>
    </>
  );
}
