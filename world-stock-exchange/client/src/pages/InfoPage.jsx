import { BusinessModel, PaymentsPanel, SecurityPanel } from '../components/site/InfoSections';
import PageHeader from '../components/site/PageHeader';

export default function InfoPage() {
  return (
    <div className="stack">
      <PageHeader eyebrow="ABOUT THE PLATFORM" title="Payments, security and business model" />
      <div className="layout-even">
        <PaymentsPanel />
        <SecurityPanel />
      </div>
      <BusinessModel />
    </div>
  );
}
