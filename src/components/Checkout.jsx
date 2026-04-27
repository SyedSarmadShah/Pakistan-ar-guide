import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_TOTAL = 25000;
const PROMOS = {
  PAKISTAN10: 10,
  TOURISM20: 20,
  FYPDEMO: 15,
};

const initialErrors = {
  cardName: false,
  cardNumber: false,
  cardExpiry: false,
  cardCvv: false,
  epPhone: false,
  jcPhone: false,
  jcPin: false,
  bankTxn: false,
};

const Checkout = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const [currentMethod, setCurrentMethod] = useState('card');
  const [discountPct, setDiscountPct] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoMessageType, setPromoMessageType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('PAK-AR-2026-0000');
  const [errors, setErrors] = useState(initialErrors);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [billingCity, setBillingCity] = useState('');
  const [billingCountry, setBillingCountry] = useState('Pakistan');

  const [epPhone, setEpPhone] = useState('');
  const [jcPhone, setJcPhone] = useState('');
  const [jcPin, setJcPin] = useState('');
  const [bankTxn, setBankTxn] = useState('');

  const cardBrand = useMemo(() => {
    const num = cardNumber.replace(/\D/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return 'card';
  }, [cardNumber]);

  const discountAmount = useMemo(() => Math.round((BASE_TOTAL * discountPct) / 100), [discountPct]);
  const totalAmount = useMemo(() => BASE_TOTAL - discountAmount, [discountAmount]);

  const clearError = (key) => {
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const setError = (key) => {
    setErrors((prev) => ({ ...prev, [key]: true }));
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  };

  const formatPhone = (value) => value.replace(/\D/g, '').slice(0, 11);

  const validateCard = () => {
    let ok = true;
    const num = cardNumber.replace(/\D/g, '');

    if (!cardName.trim()) {
      setError('cardName');
      ok = false;
    }

    if (num.length < 16) {
      setError('cardNumber');
      ok = false;
    }

    if (cardExpiry.trim().length < 5) {
      setError('cardExpiry');
      ok = false;
    }

    if (cardCvv.trim().length < 3) {
      setError('cardCvv');
      ok = false;
    }

    return ok;
  };

  const validateWallet = (type) => {
    let ok = true;

    if (type === 'easypaisa') {
      if (epPhone.length !== 11 || !epPhone.startsWith('03')) {
        setError('epPhone');
        ok = false;
      }
    }

    if (type === 'jazzcash') {
      if (jcPhone.length !== 11 || !jcPhone.startsWith('03')) {
        setError('jcPhone');
        ok = false;
      }
      if (jcPin.length < 4) {
        setError('jcPin');
        ok = false;
      }
    }

    return ok;
  };

  const validateBank = () => {
    if (!bankTxn.trim()) {
      setError('bankTxn');
      return false;
    }
    return true;
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoMessageType('error');
      setPromoMessage('Please enter a promo code.');
      return;
    }

    if (PROMOS[code]) {
      setDiscountPct(PROMOS[code]);
      setPromoMessageType('success');
      setPromoMessage(`Promo applied: ${PROMOS[code]}% off`);
      return;
    }

    setPromoMessageType('error');
    setPromoMessage('Invalid promo code');
  };

  const processPayment = () => {
    setErrors(initialErrors);

    let valid = false;
    if (currentMethod === 'card') valid = validateCard();
    if (currentMethod === 'easypaisa') valid = validateWallet('easypaisa');
    if (currentMethod === 'jazzcash') valid = validateWallet('jazzcash');
    if (currentMethod === 'bank') valid = validateBank();

    if (!valid) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setBookingRef(`PAK-AR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setShowSuccess(true);
    }, 1800);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className="checkout-page">
      <style>{`
        :root {
          --emerald: #1a6b4a;
          --emerald-light: #2d9c6e;
          --emerald-dark: #0f4530;
          --gold: #c9972c;
          --cream: #fdf8f0;
          --ink: #1a1a1a;
          --muted: #6b6b6b;
          --border: #e0d9cc;
          --card-bg: #ffffff;
          --error: #c0392b;
          --success: #1a6b4a;
        }

        * { box-sizing: border-box; }

        .checkout-page {
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          font-family: DM Sans, sans-serif;
        }

        .checkout-header {
          background: var(--emerald-dark);
          padding: 16px 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .checkout-back-btn {
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: transparent;
          color: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        .checkout-back-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .checkout-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: var(--gold);
          font-weight: 700;
        }

        .checkout-brand {
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .checkout-secure {
          margin-left: auto;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.8rem;
          letter-spacing: 0.06em;
        }

        .checkout-wrapper {
          max-width: 1020px;
          margin: 36px auto;
          padding: 0 16px;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .card-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          font-weight: 700;
          font-size: 1rem;
        }

        .card-body {
          padding: 20px;
        }

        .method-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 20px;
        }

        .method-tab {
          border: 2px solid var(--border);
          background: #fff;
          border-radius: 10px;
          height: 48px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .method-tab.active {
          border-color: var(--emerald);
          color: var(--emerald);
          background: #f0f9f5;
        }

        .form-section { margin-bottom: 16px; }

        .form-row {
          display: grid;
          gap: 12px;
        }

        .cols-2 { grid-template-columns: 1fr 1fr; }
        .cols-3 { grid-template-columns: 2fr 1fr 1fr; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .form-group input,
        .form-group select {
          height: 42px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 0 12px;
          background: #fff;
          color: var(--ink);
          outline: none;
          font-size: 0.9rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: var(--emerald);
          box-shadow: 0 0 0 3px rgba(26, 107, 74, 0.12);
        }

        .form-group .error-msg {
          display: none;
          color: var(--error);
          font-size: 0.75rem;
        }

        .form-group.has-error input {
          border-color: var(--error);
        }

        .form-group.has-error .error-msg {
          display: block;
        }

        .panel {
          display: none;
          margin-bottom: 16px;
        }

        .panel.visible {
          display: block;
        }

        .wallet-panel {
          padding: 14px;
          border: 1.5px solid var(--emerald-light);
          border-radius: 10px;
          background: #f8fffe;
        }

        .wallet-panel p {
          font-size: 0.86rem;
          color: var(--muted);
          margin: 0 0 10px;
          line-height: 1.5;
        }

        .bank-info-box {
          background: #fffbf0;
          border: 1.5px solid var(--gold);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .bank-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid rgba(201, 151, 44, 0.2);
          font-size: 0.82rem;
        }

        .bank-row:last-child {
          border-bottom: none;
        }

        .pay-btn {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--emerald), var(--emerald-light));
          color: #fff;
          font-size: 0.96rem;
          font-weight: 700;
          cursor: pointer;
        }

        .pay-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .promo-row {
          display: flex;
          gap: 8px;
          margin: 12px 0;
        }

        .promo-input {
          flex: 1;
          height: 38px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 0 10px;
        }

        .promo-btn {
          height: 38px;
          border: none;
          background: var(--emerald-dark);
          color: #fff;
          border-radius: 8px;
          font-weight: 600;
          padding: 0 14px;
          cursor: pointer;
        }

        .promo-msg {
          margin: 0;
          font-size: 0.78rem;
        }

        .promo-msg.success { color: var(--success); }
        .promo-msg.error { color: var(--error); }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.86rem;
        }

        .price-row.total {
          border-top: 2px solid var(--border);
          margin-top: 8px;
          padding-top: 12px;
          font-weight: 700;
          font-size: 1rem;
        }

        .discount {
          color: var(--error);
        }

        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 69, 48, 0.85);
          display: grid;
          place-items: center;
          z-index: 100;
        }

        .success-box {
          width: min(420px, 92vw);
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .success-ref {
          margin: 16px 0;
          padding: 10px;
          border-radius: 8px;
          background: #f0f9f5;
          color: var(--emerald-dark);
          font-weight: 700;
        }

        .summary-title {
          margin: 0 0 12px;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .summary-note {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 0.74rem;
          text-align: center;
        }

        .summary-item {
          border-bottom: 1px solid var(--border);
          padding: 10px 0;
        }

        .summary-item:last-of-type {
          border-bottom: none;
        }

        @media (max-width: 900px) {
          .checkout-wrapper {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .checkout-header {
            flex-wrap: wrap;
            row-gap: 10px;
          }

          .checkout-secure {
            width: 100%;
            margin-left: 0;
          }

          .method-tabs {
            grid-template-columns: 1fr 1fr;
          }

          .cols-2,
          .cols-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="checkout-header">
        <button type="button" className="checkout-back-btn" onClick={goHome}>
          Back to Home
        </button>
        <div className="checkout-logo">PK</div>
        <div className="checkout-brand">Ghoomo Pakistan</div>
        <div className="checkout-secure">SECURE CHECKOUT</div>
      </header>

      <div className="checkout-wrapper">
        <div className="card">
          <div className="card-header">Payment Method</div>
          <div className="card-body">
            <div className="method-tabs">
              <button
                type="button"
                className={`method-tab ${currentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setCurrentMethod('card')}
              >
                Card
              </button>
              <button
                type="button"
                className={`method-tab ${currentMethod === 'easypaisa' ? 'active' : ''}`}
                onClick={() => setCurrentMethod('easypaisa')}
              >
                Easypaisa
              </button>
              <button
                type="button"
                className={`method-tab ${currentMethod === 'jazzcash' ? 'active' : ''}`}
                onClick={() => setCurrentMethod('jazzcash')}
              >
                JazzCash
              </button>
              <button
                type="button"
                className={`method-tab ${currentMethod === 'bank' ? 'active' : ''}`}
                onClick={() => setCurrentMethod('bank')}
              >
                Bank Transfer
              </button>
            </div>

            <div className={`panel ${currentMethod === 'card' ? 'visible' : ''}`}>
              <div className="form-section">
                <div className="form-row">
                  <div className={`form-group ${errors.cardName ? 'has-error' : ''}`}>
                    <label>Full Name on Card</label>
                    <input
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value);
                        clearError('cardName');
                      }}
                      placeholder="e.g. Ahmed Hassan"
                    />
                    <span className="error-msg">Please enter the cardholder name</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-row" style={{ marginBottom: 12 }}>
                  <div className={`form-group ${errors.cardNumber ? 'has-error' : ''}`}>
                    <label>Card Number</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(formatCardNumber(e.target.value));
                        clearError('cardNumber');
                      }}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                    <span className="error-msg">Enter a valid 16-digit card number</span>
                  </div>
                </div>

                <div className="form-row cols-3">
                  <div className={`form-group ${errors.cardExpiry ? 'has-error' : ''}`}>
                    <label>Expiry Date</label>
                    <input
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(formatExpiry(e.target.value));
                        clearError('cardExpiry');
                      }}
                      placeholder="MM / YY"
                      maxLength={7}
                    />
                    <span className="error-msg">Invalid expiry date</span>
                  </div>

                  <div className={`form-group ${errors.cardCvv ? 'has-error' : ''}`}>
                    <label>CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                        clearError('cardCvv');
                      }}
                      placeholder="***"
                      maxLength={4}
                    />
                    <span className="error-msg">Enter CVV</span>
                  </div>

                  <div className="form-group">
                    <label>Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label>Billing City</label>
                    <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} placeholder="Lahore" />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)}>
                      <option>Pakistan</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>UAE</option>
                      <option>Saudi Arabia</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#6b6b6b' }}>
                  Card type: {cardBrand}
                </p>
              </div>
            </div>

            <div className={`panel wallet-panel ${currentMethod === 'easypaisa' ? 'visible' : ''}`}>
              <p>Enter your Easypaisa registered mobile number to receive a payment request.</p>
              <div className={`form-group ${errors.epPhone ? 'has-error' : ''}`}>
                <label>Easypaisa Mobile Number</label>
                <input
                  value={epPhone}
                  onChange={(e) => {
                    setEpPhone(formatPhone(e.target.value));
                    clearError('epPhone');
                  }}
                  placeholder="03XXXXXXXXX"
                />
                <span className="error-msg">Enter a valid Pakistani mobile number</span>
              </div>
            </div>

            <div className={`panel wallet-panel ${currentMethod === 'jazzcash' ? 'visible' : ''}`}>
              <p>Enter your JazzCash number and MPIN to authorize payment.</p>
              <div className={`form-group ${errors.jcPhone ? 'has-error' : ''}`}>
                <label>JazzCash Mobile Number</label>
                <input
                  value={jcPhone}
                  onChange={(e) => {
                    setJcPhone(formatPhone(e.target.value));
                    clearError('jcPhone');
                  }}
                  placeholder="03XXXXXXXXX"
                />
                <span className="error-msg">Enter a valid Pakistani mobile number</span>
              </div>
              <div className={`form-group ${errors.jcPin ? 'has-error' : ''}`} style={{ marginTop: 12 }}>
                <label>JazzCash MPIN</label>
                <input
                  type="password"
                  value={jcPin}
                  onChange={(e) => {
                    setJcPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                    clearError('jcPin');
                  }}
                  placeholder="4 to 6 digit MPIN"
                />
                <span className="error-msg">Enter your JazzCash MPIN</span>
              </div>
            </div>

            <div className={`panel ${currentMethod === 'bank' ? 'visible' : ''}`}>
              <div className="bank-info-box">
                <div className="bank-row"><span>Bank Name</span><span>HBL Bank</span></div>
                <div className="bank-row"><span>Account Title</span><span>Ghoomo Pakistan Pvt</span></div>
                <div className="bank-row"><span>Account No.</span><span>0123-4567890-001</span></div>
                <div className="bank-row"><span>IBAN</span><span>PK36HABB0000123456789001</span></div>
              </div>

              <div className={`form-group ${errors.bankTxn ? 'has-error' : ''}`}>
                <label>Transaction / Reference Number</label>
                <input
                  value={bankTxn}
                  onChange={(e) => {
                    setBankTxn(e.target.value);
                    clearError('bankTxn');
                  }}
                  placeholder="Enter bank transaction ID"
                />
                <span className="error-msg">Please enter your transaction reference number</span>
              </div>
            </div>

            <button className="pay-btn" type="button" onClick={processPayment} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Pay ${currency} ${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Order Summary</div>
          <div className="card-body">
            <p className="summary-title">Hunza + Lahore Package</p>

            <div className="summary-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>Hunza Valley AR Tour</span>
                <strong>PKR 18,000</strong>
              </div>
            </div>

            <div className="summary-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>Lahore Heritage Walk</span>
                <strong>PKR 5,500</strong>
              </div>
            </div>

            <div className="promo-row">
              <input
                className="promo-input"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code"
              />
              <button type="button" className="promo-btn" onClick={applyPromo}>Apply</button>
            </div>

            {promoMessage ? (
              <p className={`promo-msg ${promoMessageType === 'success' ? 'success' : 'error'}`}>
                {promoMessage}
              </p>
            ) : null}

            <div style={{ marginTop: 12 }}>
              <div className="price-row"><span>Subtotal</span><span>PKR 23,500</span></div>
              <div className="price-row"><span>Service Fee (3%)</span><span>PKR 705</span></div>
              <div className="price-row"><span>GST (17%)</span><span>PKR 795</span></div>
              {discountPct > 0 ? (
                <div className="price-row discount"><span>Promo Discount</span><span>- PKR {discountAmount.toLocaleString()}</span></div>
              ) : null}
              <div className="price-row total"><span>Total</span><span>PKR {totalAmount.toLocaleString()}</span></div>
            </div>

            <p className="summary-note">Prices include taxes. Booking is non-refundable within 48 hours of tour date.</p>
          </div>
        </div>
      </div>

      {showSuccess ? (
        <div className="success-overlay">
          <div className="success-box">
            <h2>Booking Confirmed</h2>
            <p>Your payment was processed successfully. A confirmation email has been sent.</p>
            <div className="success-ref">Booking Ref: {bookingRef}</div>
            <button type="button" className="pay-btn" onClick={closeSuccess}>Back to Home</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Checkout;
