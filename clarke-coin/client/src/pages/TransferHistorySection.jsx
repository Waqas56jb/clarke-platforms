export default function TransferHistorySection({ transfers }) {
  return (
    <section className="panel" style={{ marginTop: 15 }} id="walletActivity">
      <h3>WALLET TRANSFER HISTORY</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Transfer ID</th>
              <th>Direction</th>
              <th>Wallet ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody id="transferRows">
            {transfers.length ? (
              transfers
                .slice()
                .reverse()
                .map((t) => (
                  <tr key={`${t.id}-${t.direction}`}>
                    <td>{t.id}</td>
                    <td>{t.direction}</td>
                    <td>{t.otherWallet}</td>
                    <td>{t.amount.toFixed(2)} CC</td>
                    <td>
                      <span className="pill">{t.status}</span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={6} className="muted">
                  No wallet transfers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
