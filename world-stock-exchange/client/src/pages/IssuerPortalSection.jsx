import { useState } from 'react';
import { useExchange } from '../context/ExchangeContext';
import { submitApplication } from '../services/issuersService';
import { CURRENCIES, SECTORS } from '../utils/marketData';

const FILE_FIELDS = [
  [
    'prospectusFile',
    'Prospectus / offering document',
    '.pdf,.doc,.docx',
    'PDF or Word document. File selection is for this local demo only.',
  ],
  [
    'financialFile',
    'Financial statements / audit reports',
    '.pdf,.doc,.docx,.xls,.xlsx',
    'PDF, Word or Excel. File selection is for this local demo only.',
  ],
  [
    'incorporationFile',
    'Certificate of incorporation',
    '.pdf,.jpg,.jpeg,.png',
    'PDF or image. File selection is for this local demo only.',
  ],
  [
    'regulatoryFile',
    'Regulatory registration / exemption evidence',
    '.pdf,.doc,.docx',
    'Attach relevant approval or exemption evidence.',
  ],
];

// Only file names are recorded; the documents themselves are never uploaded.
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
    files: FILE_FIELDS.map(([id]) => el[id].files[0]?.name || '').filter(Boolean),
    declaration: el.issuerDeclaration.checked,
  };
}

export default function IssuerPortalSection() {
  const { reload } = useExchange();
  const [message, setMessage] = useState(
    'Demo only: submissions are stored in this browser, not sent to the exchange.'
  );
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    try {
      await submitApplication(readForm(form));
      setMessage(
        'Application saved in this browser demo. It is pending review and is not yet visible in Buying Selection. File names only are recorded; files are not uploaded.'
      );
      form.reset();
      await reload();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="issuer" className="panel" style={{ marginTop: 20 }}>
      <div className="eyebrow">COMPANY ISSUER PORTAL</div>
      <h2>Upload your company shares for review</h2>
      <p className="muted">
        Companies can create a profile, submit share-offering details and provide supporting documents. Submissions
        remain private and pending until reviewed and approved by the exchange administrator.
      </p>
      <div className="issuer-notice">
        <b>Important:</b> Submitting a form does not make shares public or authorize a securities offer. Before any
        offer is displayed or trading enabled, the issuer must satisfy the laws and regulator requirements in every
        relevant jurisdiction, including any required prospectus or exemption, issuer registration and exchange
        approval.
      </div>
      <form id="issuerForm" className="issuer-form" onSubmit={onSubmit}>
        <div>
          <label htmlFor="issuerName">Registered company name *</label>
          <input id="issuerName" required maxLength={120} placeholder="Company legal name" />
        </div>
        <div>
          <label htmlFor="issuerCountry">Country of incorporation *</label>
          <input id="issuerCountry" required maxLength={80} placeholder="Country" />
        </div>
        <div>
          <label htmlFor="issuerSymbol">Proposed ticker / share symbol *</label>
          <input id="issuerSymbol" required maxLength={12} placeholder="e.g. ABC" />
        </div>
        <div>
          <label htmlFor="issuerSector">Industry / sector *</label>
          <select id="issuerSector" required defaultValue="">
            <option value="">Select sector</option>
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="issuerWebsite">Company website</label>
          <input id="issuerWebsite" type="url" placeholder="https://" />
        </div>
        <div>
          <label htmlFor="issuerEmail">Authorized contact email *</label>
          <input id="issuerEmail" type="email" required placeholder="name@company.com" />
        </div>
        <div>
          <label htmlFor="shareClass">Share class *</label>
          <input id="shareClass" required placeholder="Ordinary shares / Class A" />
        </div>
        <div>
          <label htmlFor="shareCount">Number of shares offered *</label>
          <input id="shareCount" type="number" min="1" step="1" required placeholder="100000" />
        </div>
        <div>
          <label htmlFor="sharePrice">Proposed offer price per share *</label>
          <input id="sharePrice" type="number" min="0.0001" step="0.0001" required placeholder="10.00" />
        </div>
        <div>
          <label htmlFor="shareCurrency">Offer currency *</label>
          <select id="shareCurrency" required>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="full">
          <label htmlFor="issuerDescription">Company profile and business description *</label>
          <input
            id="issuerDescription"
            required
            maxLength={600}
            placeholder="Describe the company, its business and operations"
          />
        </div>
        {FILE_FIELDS.map(([id, label, accept, note]) => (
          <div key={id}>
            <label htmlFor={id}>{label}</label>
            <input id={id} type="file" accept={accept} />
            <div className="file-note">{note}</div>
          </div>
        ))}
        <div className="full">
          <label>
            <input id="issuerDeclaration" type="checkbox" required style={{ width: 'auto', marginRight: 8 }} />I confirm
            I am authorized to submit this company information and understand that the listing is subject to
            verification, legal review and exchange approval.
          </label>
        </div>
        <div className="full">
          <button className="gold" type="submit" disabled={submitting}>
            Submit company for review
          </button>{' '}
          <span className="muted" id="issuerMessage" style={{ fontSize: 12 }}>
            {message}
          </span>
        </div>
      </form>
    </section>
  );
}
