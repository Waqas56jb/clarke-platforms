export default function PaymentCard({ eyebrow, title, price, period, text, buttonLabel, featured, onPay }) {
  return (
    <article className={`card-panel payment-card${featured ? ' featured' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <div className="payment-price">
        {price} <small>{period}</small>
      </div>
      <p>{text}</p>
      <button className="btn btn-primary" onClick={onPay}>
        {buttonLabel}
      </button>
    </article>
  );
}
