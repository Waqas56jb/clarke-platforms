// Company listing application → POST /api/applications. Documents are uploaded in the next step.
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { submitApplication } from '../../services/issuerService';
import { CURRENCIES, SECTORS } from '../../utils/markets';

function readForm(form) {
  const el = form.elements;
  const v = (id) => el[id].value.trim();
  return {
    name: v('issuerName'),
    country: v('issuerCountry'),
    symbol: v('issuerSymbol').toUpperCase(),
    sector: el.issuerSector.value,
    website: v('issuerWebsite'),
    email: v('issuerEmail'),
    shareClass: v('shareClass'),
    shares: Number(el.shareCount.value),
    price: Number(el.sharePrice.value),
    currency: el.shareCurrency.value,
    description: v('issuerDescription'),
    declaration: true,
  };
}

function Field({ id, label, full, children }) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function IssuerForm({ onSubmitted }) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { application } = await submitApplication(readForm(e.currentTarget));
      onSubmitted(application);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="issuerTitle">
      <div className="eyebrow">COMPANY ISSUER PORTAL</div>
      <h2 id="issuerTitle">Upload your company shares for review</h2>
      <p className="muted">
        Companies can create a profile, submit share-offering details and provide supporting documents. Submissions
        remain private and pending until reviewed and approved by the exchange administrator.
      </p>
      <div className="gold-notice">
        <b>Important:</b> Submitting a form does not make shares public or authorize a securities offer. Before any
        offer is displayed or trading enabled, the issuer must satisfy the laws and regulator requirements in every
        relevant jurisdiction, including any required prospectus or exemption, issuer registration and exchange
        approval.
      </div>
      <form id="issuerForm" className="issuer-form" onSubmit={onSubmit}>
        <Field id="issuerName" label="Registered company name *">
          <input id="issuerName" required maxLength={120} placeholder="Company legal name" />
        </Field>
        <Field id="issuerCountry" label="Country of incorporation *">
          <input id="issuerCountry" required maxLength={80} placeholder="Country" />
        </Field>
        <Field id="issuerSymbol" label="Proposed ticker / share symbol *">
          <input id="issuerSymbol" required maxLength={12} placeholder="e.g. ABC" autoCapitalize="characters" />
        </Field>
        <Field id="issuerSector" label="Industry / sector *">
          <select id="issuerSector" required defaultValue="">
            <option value="">Select sector</option>
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field id="issuerWebsite" label="Company website">
          <input id="issuerWebsite" type="url" maxLength={300} placeholder="https://" />
        </Field>
        <Field id="issuerEmail" label="Authorized contact email *">
          <input id="issuerEmail" type="email" required maxLength={200} placeholder="name@company.com" />
        </Field>
        <Field id="shareClass" label="Share class *">
          <input id="shareClass" required maxLength={120} placeholder="Ordinary shares / Class A" />
        </Field>
        <Field id="shareCount" label="Number of shares offered *">
          <input id="shareCount" type="number" min="1" step="1" required placeholder="100000" inputMode="numeric" />
        </Field>
        <Field id="sharePrice" label="Proposed offer price per share *">
          <input
            id="sharePrice"
            type="number"
            min="0.0001"
            step="0.0001"
            required
            placeholder="10.00"
            inputMode="decimal"
          />
        </Field>
        <Field id="shareCurrency" label="Offer currency *">
          <select id="shareCurrency" required>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field id="issuerDescription" label="Company profile and business description *" full>
          <textarea
            id="issuerDescription"
            required
            maxLength={600}
            rows={4}
            placeholder="Describe the company, its business and operations"
          />
        </Field>
        <label className="check-row full" htmlFor="issuerDeclaration">
          <input id="issuerDeclaration" type="checkbox" required />
          <span>
            I confirm I am authorized to submit this company information and understand that the listing is subject to
            verification, legal review and exchange approval.
          </span>
        </label>
        <div className="full stack-sm">
          <div role="alert">
            {error && (
              <p className="notice notice-error">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
          </div>
          <div className="row-wrap">
            <button
              className="btn btn-accent"
              type="submit"
              id="issuerSubmit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting && <span className="spinner" aria-hidden="true" />}
              Submit company for review
            </button>
            <span className="caption" id="issuerMessage">
              After submitting you can upload the supporting documents. Submissions stay private until a reviewer
              approves them.
            </span>
          </div>
        </div>
      </form>
    </section>
  );
}
