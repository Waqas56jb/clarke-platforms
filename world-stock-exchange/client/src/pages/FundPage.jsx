// Gold & Diamond fund: the proposed policy text, an illustrative calculator and the server's ledger.
import { Gem } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { fetchFund } from '../services/fundService';
import FeeCalculator from '../components/fund/FeeCalculator';
import FundLedger from '../components/fund/FundLedger';
import PageHeader from '../components/site/PageHeader';
import { AsyncView, EmptyState } from '../components/StateView';
import { count, euros } from '../utils/format';

const PROGRAMMES = [
  [
    'Fee destination',
    'A dedicated World Stock Exchange business account and separately tracked fund ledger, subject to approved banking and safeguarding arrangements.',
  ],
  [
    'Gold programme',
    'Planned purchase and lawful import of verified gold into Grenada, with documented origin, assay, valuation, customs declarations and insurance.',
  ],
  [
    'Diamond programme',
    'Planned sourcing from Guyana and other South American suppliers, subject to verified provenance, lawful export/import permits and applicable conflict-free sourcing standards.',
  ],
];

export default function FundPage() {
  const fund = useAsync(fetchFund, []);
  return (
    <div className="stack-lg" id="gold-diamond-fund">
      <PageHeader eyebrow="SELLER PROFIT CONTRIBUTION · PROPOSED POLICY" title="2% seller-profit fee in euros">
        For approved company-share sales, the proposed exchange fee is 2% of the seller’s realised profit (not 2% of the
        full sale proceeds). The fee is calculated and settled in EUR and allocated to the World Stock Exchange Gold
        &amp; Diamond Import Fund.
      </PageHeader>
      <div className="card-grid">
        {PROGRAMMES.map(([title, text]) => (
          <div className="company-card" key={title}>
            <b>{title}</b>
            <p className="muted">{text}</p>
          </div>
        ))}
      </div>
      <AsyncView state={fund} count={2} loadingText="Loading the fund ledger">
        {(f) => (
          <div className="stack-lg">
            <div className="layout-even">
              <section className="panel" aria-labelledby="calcTitle">
                <h2 id="calcTitle" className="card-title">
                  Fee calculator (illustration)
                </h2>
                <FeeCalculator settings={f.settings} />
              </section>
              <section className="panel" aria-labelledby="fundTitle">
                <b id="fundTitle">Gold &amp; Diamond Fund (demo ledger)</b>
                <div className="big" id="fundTotal">
                  {euros(f.totalEur)}
                </div>
                <p className="muted">
                  Illustrative accumulated fee allocation from {count(f.entries)} completed company-share sale(s),
                  recorded by the exchange. No money is collected.
                </p>
                <p className="fine-print">
                  Live collection requires a licensed operating model, transparent seller agreement, bank account,
                  transaction reconciliation, tax advice and applicable financial-services approvals. Physical gold and
                  diamonds must not be purchased or imported until trade, customs, AML, sanctions and provenance checks
                  are complete.
                </p>
              </section>
            </div>
            <section className="card table-card" aria-labelledby="ledgerTitle">
              <h2 className="card-title table-card-title" id="ledgerTitle">
                Fund ledger
              </h2>
              {f.ledger.length ? (
                <FundLedger ledger={f.ledger} />
              ) : (
                <EmptyState icon={Gem} plain title="No fees recorded yet.">
                  Entries are added automatically when a company-share sale completes.
                </EmptyState>
              )}
            </section>
          </div>
        )}
      </AsyncView>
    </div>
  );
}
