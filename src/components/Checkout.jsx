import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import { useDarkMode } from '../context/DarkModeContext';
import {
  Check,
  Lock,
  Calendar,
  MapPin,
  Users,
  Home as HotelIcon,
  Car,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RotateCcw,
  PhoneCall,
  Copy,
  Upload,
  Edit3,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Image,
  CheckCircle,
  Mail,
  Smartphone,
  Info
} from 'lucide-react';

const PROMOS = {
  PAKISTAN10: 10,
  TOURISM20: 20,
  FYPDEMO: 15,
};

const initialErrors = {
  contactName: false,
  contactEmail: false,
  contactPhone: false,
  departureDate: false,
  returnDate: false,
  pickupLocation: false,
  cardName: false,
  cardNumber: false,
  cardExpiry: false,
  cardCvv: false,
  epPhone: false,
  epPhoneConfirm: false,
  jcPhone: false,
  jcPhoneConfirm: false,
  jcPin: false,
  bankTxn: false,
  bankScreenshot: false,
};

const Checkout = () => {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [logoVisible, setLogoVisible] = useState(true);

  // Step state: 2 = Traveler Details, 3 = Payment & Review, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState(2);

  // Traveler Details Form State
  const [contactName, setContactName] = useState('Syed Sarmad Shah');
  const [contactEmail, setContactEmail] = useState('sarmad.shah@example.com');
  const [contactPhone, setContactPhone] = useState('03001234567');
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [departureDate, setDepartureDate] = useState('2026-06-24');
  const [returnDate, setReturnDate] = useState('2026-06-30');
  const [pickupLocation, setPickupLocation] = useState('Lahore Airport (LHE)');
  const [transportType, setTransportType] = useState('Private SUV (Prado)');
  const [accommodationName, setAccommodationName] = useState('Serena Hotel Hunza & Luxus Grand Lahore');
  const [roomType, setRoomType] = useState('Premium Deluxe Double Room');

  // Hardcoded package details for display
  const packageName = "Hunza Valley & Lahore Heritage Tour";
  const destinations = ['Hunza Valley', 'Lahore Heritage Walk'];

  // Payment Form States
  const [currentMethod, setCurrentMethod] = useState('card');
  const [discountPct, setDiscountPct] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoMessageType, setPromoMessageType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState('PAK-AR-2026-0000');
  const [errors, setErrors] = useState(initialErrors);

  // Card fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [billingCity, setBillingCity] = useState('');
  const [billingCountry, setBillingCountry] = useState('Pakistan');

  // Mobile wallets
  const [epPhone, setEpPhone] = useState('');
  const [epPhoneConfirm, setEpPhoneConfirm] = useState('');
  const [jcPhone, setJcPhone] = useState('');
  const [jcPhoneConfirm, setJcPhoneConfirm] = useState('');
  const [jcPin, setJcPin] = useState('');

  // Bank Transfer fields
  const [bankTxn, setBankTxn] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Mobile Accordion state
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  // Reactive Duration Calculation
  const durationDays = useMemo(() => {
    if (!departureDate || !returnDate) return 0;
    const dep = new Date(departureDate);
    const ret = new Date(returnDate);
    const diffTime = Math.abs(ret - dep);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }, [departureDate, returnDate]);

  // Dynamic Card Brand Recognition
  const cardBrand = useMemo(() => {
    const num = cardNumber.replace(/\D/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return 'card';
  }, [cardNumber]);

  // Reactive Pricing Logic scaling with traveler count
  const pricing = useMemo(() => {
    const hunzaRateAdult = 9000;
    const hunzaRateChild = 4500;
    const lahoreRateAdult = 2750;
    const lahoreRateChild = 1375;

    const hunzaCost = (hunzaRateAdult * adultCount) + (hunzaRateChild * childCount);
    const lahoreCost = (lahoreRateAdult * adultCount) + (lahoreRateChild * childCount);
    
    const subtotal = hunzaCost + lahoreCost;
    const serviceFee = Math.round(subtotal * 0.03);
    const gst = Math.round(subtotal * 0.17);
    const preDiscountTotal = subtotal + serviceFee + gst;
    
    const discountAmount = Math.round((preDiscountTotal * discountPct) / 100);
    const grandTotal = preDiscountTotal - discountAmount;

    return {
      hunzaCost,
      lahoreCost,
      subtotal,
      serviceFee,
      gst,
      preDiscountTotal,
      discountAmount,
      grandTotal
    };
  }, [adultCount, childCount, discountPct]);

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

  // Bank Account Details Copy
  const copyIBAN = () => {
    navigator.clipboard.writeText('PK36HABB0000123456789001');
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Drag and Drop Receipt Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadScreenshot(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadScreenshot(files[0]);
    }
  };

  const uploadScreenshot = (file) => {
    setIsUploading(true);
    setUploadProgress(20);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 100);

    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setScreenshotFile(file);
        setScreenshotPreview(reader.result);
        setIsUploading(false);
        clearError('bankScreenshot');
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = (e) => {
    e.stopPropagation();
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setUploadProgress(0);
  };

  // Step 2 Validation (Travelers & Details)
  const handleStep2Submit = () => {
    setErrors(initialErrors);
    let ok = true;
    
    if (!contactName.trim()) { setError('contactName'); ok = false; }
    if (!contactEmail.trim() || !contactEmail.includes('@')) { setError('contactEmail'); ok = false; }
    if (contactPhone.length !== 11 || !contactPhone.startsWith('03')) { setError('contactPhone'); ok = false; }
    if (!departureDate) { setError('departureDate'); ok = false; }
    if (!returnDate) { setError('returnDate'); ok = false; }
    if (departureDate && returnDate && new Date(departureDate) > new Date(returnDate)) {
      setError('returnDate');
      ok = false;
    }
    if (!pickupLocation.trim()) { setError('pickupLocation'); ok = false; }
    if (adultCount < 1) ok = false;

    if (ok) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const firstError = document.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const validateCard = () => {
    let ok = true;
    const num = cardNumber.replace(/\D/g, '');

    if (!cardName.trim()) { setError('cardName'); ok = false; }
    if (num.length < 16) { setError('cardNumber'); ok = false; }
    if (cardExpiry.trim().length < 5) { setError('cardExpiry'); ok = false; }
    if (cardCvv.trim().length < 3) { setError('cardCvv'); ok = false; }

    return ok;
  };

  const validateWallet = (type) => {
    let ok = true;
    if (type === 'easypaisa') {
      if (epPhone.length !== 11 || !epPhone.startsWith('03')) { setError('epPhone'); ok = false; }
      if (epPhoneConfirm !== epPhone) { setError('epPhoneConfirm'); ok = false; }
    } else if (type === 'jazzcash') {
      if (jcPhone.length !== 11 || !jcPhone.startsWith('03')) { setError('jcPhone'); ok = false; }
      if (jcPhoneConfirm !== jcPhone) { setError('jcPhoneConfirm'); ok = false; }
      if (jcPin.length < 4) { setError('jcPin'); ok = false; }
    }
    return ok;
  };

  const validateBank = () => {
    let ok = true;
    if (!bankTxn.trim()) { setError('bankTxn'); ok = false; }
    if (!screenshotFile) { setError('bankScreenshot'); ok = false; }
    return ok;
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
    else if (currentMethod === 'easypaisa') valid = validateWallet('easypaisa');
    else if (currentMethod === 'jazzcash') valid = validateWallet('jazzcash');
    else if (currentMethod === 'bank') valid = validateBank();

    if (!valid) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setBookingRef(`PAK-AR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  const goHome = () => {
    navigate('/');
  };

  const renderSummaryContent = () => (
    <>
      <p className="summary-title">{packageName}</p>
      
      <div className="summary-details-list">
        <div className="summary-detail-item">
          <MapPin className="icon" />
          <div className="info">
            <span className="label">Destinations</span>
            <span className="val">{destinations.join(' & ')}</span>
          </div>
        </div>
        
        <div className="summary-detail-item">
          <Calendar className="icon" />
          <div className="info">
            <span className="label">Travel Dates</span>
            <span className="val">
              {departureDate ? new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'} to {returnDate ? new Date(returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
            </span>
          </div>
        </div>
        
        <div className="summary-detail-item">
          <Users className="icon" />
          <div className="info">
            <span className="label">Travelers</span>
            <span className="val">{adultCount} Adults {childCount > 0 ? `, ${childCount} Children` : ''}</span>
          </div>
        </div>
        
        <div className="summary-detail-item">
          <HotelIcon className="icon" />
          <div className="info">
            <span className="label">Accommodation</span>
            <span className="val">
              {accommodationName}
              <span className="room-type">{roomType}</span>
            </span>
          </div>
        </div>
        
        <div className="summary-detail-item">
          <Car className="icon" />
          <div className="info">
            <span className="label">Transport</span>
            <span className="val">{transportType}</span>
          </div>
        </div>
        
        <div className="summary-detail-item">
          <Clock className="icon" />
          <div className="info">
            <span className="label">Duration</span>
            <span className="val">{durationDays} Days, {Math.max(0, durationDays - 1)} Nights</span>
          </div>
        </div>
      </div>

      <div className="pricing-section">
        <div className="price-row">
          <span>Subtotal</span>
          <span>PKR {pricing.subtotal.toLocaleString()}</span>
        </div>
        <div className="price-row">
          <span>Service Fee (3%)</span>
          <span>PKR {pricing.serviceFee.toLocaleString()}</span>
        </div>
        <div className="price-row">
          <span>GST / Taxes (17%)</span>
          <span>PKR {pricing.gst.toLocaleString()}</span>
        </div>

        <div className="promo-row">
          <input
            className="promo-input"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Promo code"
          />
          <button type="button" className="promo-btn" onClick={applyPromo}>
            Apply
          </button>
        </div>

        {promoMessage && (
          <p className={`promo-msg ${promoMessageType}`}>
            {promoMessage}
          </p>
        )}

        {discountPct > 0 && (
          <div className="price-row discount">
            <span>Promo Discount ({discountPct}%)</span>
            <span>- PKR {pricing.discountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="price-row total">
          <span>Grand Total</span>
          <span className="total-amount-display">PKR {pricing.grandTotal.toLocaleString()}</span>
        </div>
      </div>
      <p className="summary-note">Prices include local tourism development levies and taxes.</p>
    </>
  );

  return (
    <div className={`checkout-page ${isDark ? 'dark-theme' : ''}`}>
      <NavBar />
      <style>{`
        :root {
          --emerald: #1a6b4a;
          --emerald-light: #2d9c6e;
          --emerald-dark: #0f4530;
          --emerald-glow: rgba(26, 107, 74, 0.08);
          --gold: #c9972c;
          --cream: #fdf8f0;
          --ink: #1a1a1a;
          --muted: #6b6b6b;
          --border: #e0d9cc;
          --card-bg: #ffffff;
          --error: #c0392b;
          --success: #1a6b4a;
          --input-bg: #ffffff;
          --input-focus-shadow: rgba(26, 107, 74, 0.15);
        }

        .checkout-page.dark-theme {
          --cream: #111827;
          --ink: #f9fafb;
          --muted: #9ca3af;
          --border: #374151;
          --card-bg: #1f2937;
          --input-bg: #1f2937;
          --success: #34d399;
          --emerald: #34d399;
          --emerald-light: #6ee7b7;
          --emerald-dark: #064e3b;
          --emerald-glow: rgba(52, 211, 153, 0.1);
          --input-focus-shadow: rgba(52, 211, 153, 0.2);
        }

        * { box-sizing: border-box; }

        .checkout-page {
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
          padding-bottom: 80px;
        }

        /* Progress indicator styles */
        .checkout-progress-container {
          max-width: 1120px;
          margin: 32px auto 0;
          padding: 0 24px;
        }

        .progress-steps-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: background 0.3s, border-color 0.3s;
        }

        .progress-step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .step-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--cream);
          border: 2px solid var(--border);
          color: var(--muted);
          font-size: 0.86rem;
          font-weight: 700;
          display: grid;
          place-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--muted);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .progress-step-item.active .step-badge {
          border-color: var(--emerald);
          background: var(--emerald);
          color: white;
          box-shadow: 0 0 0 5px var(--emerald-glow);
        }

        .progress-step-item.active .step-label {
          color: var(--emerald);
          font-weight: 700;
        }

        .progress-step-item.completed .step-badge {
          background: var(--emerald-light);
          border-color: var(--emerald-light);
          color: white;
        }

        .progress-step-item.completed .step-label {
          color: var(--ink);
        }

        .step-line-connector {
          flex: 1;
          height: 2px;
          background: var(--border);
          margin: 0 20px;
          transition: background 0.4s ease;
        }

        .step-line-connector.completed {
          background: var(--emerald-light);
        }

        /* Form & Page Wrapper */
        .checkout-wrapper {
          max-width: 1120px;
          margin: 28px auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          align-items: start;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }

        .card-header {
          padding: 22px 28px;
          border-bottom: 1px solid var(--border);
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-body {
          padding: 28px;
        }

        /* Traveler Form controls */
        .counter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--cream);
          border-radius: 10px;
          border: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .counter-label {
          display: flex;
          flex-direction: column;
        }

        .counter-label span:first-child {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .counter-label span:last-child {
          font-size: 0.76rem;
          color: var(--muted);
        }

        .counter-controls {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .counter-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--card-bg);
          color: var(--ink);
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .counter-btn:hover:not(:disabled) {
          border-color: var(--emerald);
          color: var(--emerald);
          background: var(--emerald-glow);
        }

        .counter-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .counter-val {
          font-weight: 700;
          font-size: 1.05rem;
          min-width: 16px;
          text-align: center;
        }

        /* Forms Layout & Inputs */
        .form-section { margin-bottom: 24px; }
        
        .form-section-title {
          font-size: 0.95rem;
          font-weight: 800;
          margin-bottom: 14px;
          color: var(--ink);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-left: 3px solid var(--emerald);
          padding-left: 10px;
        }

        .form-row {
          display: grid;
          gap: 16px;
        }

        .cols-2 { grid-template-columns: 1fr 1fr; }
        .cols-3 { grid-template-columns: 2fr 1fr 1fr; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .form-group input,
        .form-group select {
          height: 48px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 0 16px;
          background: var(--input-bg);
          color: var(--ink);
          outline: none;
          font-size: 0.94rem;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: var(--emerald);
          box-shadow: 0 0 0 4px var(--input-focus-shadow);
        }

        .form-group .error-msg {
          display: none;
          color: var(--error);
          font-size: 0.78rem;
          font-weight: 600;
        }

        .form-group.has-error input {
          border-color: var(--error);
        }

        .form-group.has-error .error-msg {
          display: block;
        }

        /* Review booking section styling */
        .review-section-box {
          background: var(--emerald-glow);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
        }

        .review-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }

        .review-title-row h3 {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0;
        }

        .edit-btn {
          background: var(--card-bg);
          border: 1px solid var(--border);
          color: var(--emerald);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .edit-btn:hover {
          border-color: var(--emerald);
          background: var(--emerald-glow);
        }

        .review-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .review-item {
          display: flex;
          flex-direction: column;
        }

        .review-item .label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
        }

        .review-item .value {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--ink);
          margin-top: 2px;
        }

        /* Payment Tabs */
        .method-tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }

        .method-tab {
          border: 2px solid var(--border);
          background: var(--card-bg);
          color: var(--ink);
          border-radius: 12px;
          height: 64px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .method-tab.active {
          border-color: var(--emerald);
          color: var(--emerald);
          background: var(--emerald-glow);
          box-shadow: 0 4px 12px rgba(26, 107, 74, 0.06);
        }

        .panel {
          display: none;
          margin-bottom: 24px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .panel.visible {
          display: block;
          opacity: 1;
          transform: translateY(0);
        }

        .wallet-panel {
          padding: 20px;
          border: 1.5px solid var(--emerald-light);
          border-radius: 12px;
          background: var(--emerald-glow);
        }

        .wallet-panel p {
          font-size: 0.86rem;
          color: var(--muted);
          margin: 0 0 16px;
          line-height: 1.6;
          font-weight: 500;
        }

        .bank-info-box {
          background: var(--cream);
          border: 1.5px solid var(--gold);
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 18px;
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.01);
        }

        .bank-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(201, 151, 44, 0.15);
          font-size: 0.86rem;
        }

        .bank-row:last-child {
          border-bottom: none;
        }

        .bank-row span:first-child {
          color: var(--muted);
          font-weight: 600;
        }

        .bank-row span:last-child {
          font-weight: 700;
          color: var(--ink);
        }

        .iban-copy-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .iban-copy-btn {
          background: transparent;
          border: none;
          color: var(--emerald);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .iban-copy-btn:hover {
          background: var(--emerald-glow);
        }

        /* Screenshot Drag & Drop Uploader */
        .screenshot-uploader {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          background: var(--input-bg);
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }

        .screenshot-uploader:hover,
        .screenshot-uploader.dragover {
          border-color: var(--emerald);
          background: var(--emerald-glow);
        }

        .screenshot-uploader .upload-icon {
          color: var(--emerald);
          margin-bottom: 12px;
          width: 36px;
          height: 36px;
        }

        .screenshot-uploader p {
          font-size: 0.88rem;
          color: var(--ink);
          font-weight: 600;
          margin: 0 0 4px;
        }

        .screenshot-uploader span {
          font-size: 0.76rem;
          color: var(--muted);
        }

        .upload-progress-container {
          margin-top: 14px;
        }

        .upload-progress-bar {
          width: 100%;
          height: 6px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .upload-progress-fill {
          height: 100%;
          background: var(--emerald-light);
          transition: width 0.15s ease;
        }

        .screenshot-preview-container {
          position: relative;
          display: inline-block;
          margin-top: 14px;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid var(--border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .screenshot-preview {
          max-width: 180px;
          max-height: 140px;
          object-fit: contain;
          display: block;
        }

        .screenshot-remove-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0, 0, 0, 0.65);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .screenshot-remove-btn:hover {
          background: rgba(0, 0, 0, 0.85);
        }

        /* Order Summary Sidebar */
        .summary-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 18px;
          color: var(--ink);
          line-height: 1.25;
        }

        .summary-details-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-detail-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .summary-detail-item .icon {
          color: var(--emerald);
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .summary-detail-item .info {
          display: flex;
          flex-direction: column;
        }

        .summary-detail-item .label {
          font-size: 0.72rem;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
        }

        .summary-detail-item .val {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.4;
        }

        .summary-detail-item .room-type {
          display: block;
          font-size: 0.76rem;
          color: var(--muted);
          font-weight: 500;
          margin-top: 1px;
        }

        /* Pricing elements */
        .pricing-section {
          border-top: 1px dashed var(--border);
          padding-top: 18px;
          margin-top: 18px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.88rem;
          color: var(--muted);
          font-weight: 500;
        }

        .price-row.total {
          border-top: 2px solid var(--border);
          margin-top: 14px;
          padding-top: 18px;
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--ink);
        }

        .price-row.total .total-amount-display {
          color: var(--emerald);
          font-size: 1.35rem;
        }

        .price-row.discount {
          color: var(--error);
          font-weight: 700;
        }

        .promo-row {
          display: flex;
          gap: 10px;
          margin: 16px 0 10px;
        }

        .promo-input {
          flex: 1;
          height: 42px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 0 14px;
          background: var(--input-bg);
          color: var(--ink);
          outline: none;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .promo-input:focus {
          border-color: var(--emerald);
        }

        .promo-btn {
          height: 42px;
          border: none;
          background: var(--emerald-dark);
          color: #fff;
          border-radius: 8px;
          font-weight: 700;
          padding: 0 18px;
          cursor: pointer;
          font-size: 0.86rem;
          transition: background 0.2s;
        }

        .promo-btn:hover {
          background: var(--emerald);
        }

        .promo-msg {
          margin: 4px 0 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .promo-msg.success { color: var(--emerald); }
        .promo-msg.error { color: var(--error); }

        .summary-note {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 0.74rem;
          line-height: 1.4;
          text-align: center;
        }

        /* Trust Badges */
        .trust-badges-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 28px 0;
        }

        .trust-badge-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .trust-badge-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
          border-color: var(--emerald);
        }

        .trust-badge-card .icon-container {
          color: var(--emerald);
          background: var(--emerald-glow);
          padding: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trust-badge-card span {
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.25;
        }

        .trust-badge-card p {
          font-size: 0.68rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.3;
        }

        /* Buttons & Actions */
        .primary-action-btn {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--emerald), var(--emerald-light));
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(26, 107, 74, 0.2);
          transition: all 0.25s ease;
        }

        .primary-action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(26, 107, 74, 0.3);
          opacity: 0.95;
        }

        .primary-action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .prev-step-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--ink);
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .prev-step-btn:hover {
          background: var(--cream);
          border-color: var(--muted);
        }

        .step-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 28px;
        }

        /* Success & Confirmation Component */
        .confirmation-container {
          max-width: 680px;
          margin: 48px auto;
          padding: 0 24px;
        }

        .confirmation-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .success-checkmark-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--emerald-glow);
          color: var(--success);
          display: grid;
          place-items: center;
          margin: 0 auto 24px;
          box-shadow: 0 0 0 12px rgba(26, 107, 74, 0.04);
          animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, pulseCircle 2s infinite 0.4s;
        }

        @keyframes scaleUp {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes pulseCircle {
          0% { box-shadow: 0 0 0 0px rgba(26, 107, 74, 0.15); }
          70% { box-shadow: 0 0 0 16px rgba(26, 107, 74, 0); }
          100% { box-shadow: 0 0 0 0px rgba(26, 107, 74, 0); }
        }

        .confirmation-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }

        .confirmation-subtitle {
          font-size: 0.94rem;
          color: var(--muted);
          margin: 0 0 32px;
          line-height: 1.6;
        }

        .confirmation-invoice-box {
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          text-align: left;
          background: var(--cream);
          margin-bottom: 32px;
        }

        .invoice-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 10px;
        }

        .invoice-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.88rem;
        }

        .invoice-row.ref {
          background: var(--emerald-glow);
          color: var(--emerald);
          font-weight: 800;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.94rem;
          margin-bottom: 14px;
        }

        .invoice-row.ref span:last-child {
          letter-spacing: 0.05em;
        }

        .invoice-row.grand-total {
          border-top: 1.5px solid var(--border);
          margin-top: 12px;
          padding-top: 14px;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .invoice-row span:first-child {
          color: var(--muted);
          font-weight: 600;
        }

        .invoice-row span:last-child {
          color: var(--ink);
          font-weight: 700;
        }

        .checklist-group {
          text-align: left;
          margin-bottom: 36px;
        }

        .checklist-title {
          font-size: 0.92rem;
          font-weight: 800;
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .checklist-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .checklist-item .icon {
          color: var(--success);
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checklist-item p {
          font-size: 0.88rem;
          margin: 0;
          line-height: 1.4;
          font-weight: 500;
        }

        .checklist-item span {
          color: var(--muted);
          font-size: 0.78rem;
          display: block;
          margin-top: 1px;
        }

        .conf-actions-row {
          display: flex;
          gap: 16px;
        }

        .conf-btn-sec {
          flex: 1;
          height: 48px;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--ink);
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .conf-btn-sec:hover {
          background: var(--cream);
          border-color: var(--muted);
        }

        /* Mobile Accordion order summary container */
        .mobile-summary-accordion {
          display: none;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.02);
          overflow: hidden;
        }

        .accordion-toggle {
          width: 100%;
          padding: 16px 20px;
          background: transparent;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.94rem;
          color: var(--ink);
        }

        .accordion-toggle .flex {
          display: flex;
          align-items: center;
        }

        .accordion-collapse-panel {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 0px solid var(--border);
        }

        .accordion-collapse-panel.open {
          max-height: 1200px;
          border-top-width: 1px;
        }

        /* Sticky bottom action bar for mobile */
        .mobile-sticky-bottom-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          border-top: 1.5px solid var(--border);
          padding: 12px 24px;
          z-index: 90;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
          align-items: center;
          justify-content: space-between;
        }

        .sticky-price-info {
          display: flex;
          flex-direction: column;
        }

        .sticky-price-info .lbl {
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .sticky-price-info .val {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--emerald);
        }

        .sticky-cta-btn {
          height: 46px;
          padding: 0 24px;
          background: linear-gradient(135deg, var(--emerald), var(--emerald-light));
          color: white;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(26, 107, 74, 0.15);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Print styling overrides */
        @media print {
          nav,
          .checkout-progress-container,
          .step-footer-actions,
          .conf-actions-row,
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .checkout-page {
            padding-bottom: 0 !important;
            background: white !important;
          }
          .confirmation-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .confirmation-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .confirmation-invoice-box {
            border: 2px solid #000 !important;
            background: white !important;
            page-break-inside: avoid;
          }
          .invoice-row.ref {
            background: #eee !important;
            color: #000 !important;
            border: 1px solid #000 !important;
          }
        }

        /* Large touch targets & responsiveness */
        @media (max-width: 900px) {
          .checkout-wrapper {
            grid-template-columns: 1fr;
            margin: 20px auto;
          }
          
          .desktop-summary-sidebar {
            display: none;
          }

          .mobile-summary-accordion {
            display: block;
          }

          .mobile-sticky-bottom-bar {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .checkout-progress-container {
            margin-top: 20px;
          }

          .progress-steps-row {
            padding: 12px 16px;
          }

          .step-label {
            display: none;
          }

          .step-line-connector {
            margin: 0 10px;
          }

          .card-body {
            padding: 20px;
          }
        }

        @media (max-width: 600px) {
          .method-tabs {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          
          .method-tab {
            height: 56px;
            font-size: 0.8rem;
          }

          .cols-2,
          .cols-3 {
            grid-template-columns: 1fr;
          }
          
          .review-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .conf-actions-row {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      {currentStep < 4 && (
        <div className="checkout-progress-container">
          <div className="progress-steps-row">
            <div className="progress-step-item completed">
              <div className="step-badge">✓</div>
              <span className="step-label">Package Selection</span>
            </div>
            
            <div className={`step-line-connector ${currentStep >= 2 ? 'completed' : ''}`}></div>
            
            <div className={`progress-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-badge">{currentStep > 2 ? '✓' : '2'}</div>
              <span className="step-label">Traveler Details</span>
            </div>
            
            <div className={`step-line-connector ${currentStep >= 3 ? 'completed' : ''}`}></div>
            
            <div className={`progress-step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-badge">{currentStep > 3 ? '✓' : '3'}</div>
              <span className="step-label">Payment</span>
            </div>
            
            <div className="step-line-connector"></div>
            
            <div className="progress-step-item">
              <div className="step-badge">4</div>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
      )}

      {currentStep < 4 ? (
        <div className="checkout-wrapper">
          {/* Main Checkout Step Flow */}
          <div className="main-flow-section">
            
            {/* Mobile Accordion Summary */}
            <div className="mobile-summary-accordion">
              <button
                type="button"
                className="accordion-toggle"
                onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              >
                <span className="flex">
                  <MapPin className="w-4 h-4 text-emerald mr-2" />
                  View Trip Summary & Pricing
                </span>
                <span className="flex">
                  <strong style={{ color: 'var(--emerald)' }}>PKR {pricing.grandTotal.toLocaleString()}</strong>
                  {mobileSummaryOpen ? <ChevronUp className="w-4.5 h-4.5 ml-1" /> : <ChevronDown className="w-4.5 h-4.5 ml-1" />}
                </span>
              </button>
              <div className={`accordion-collapse-panel ${mobileSummaryOpen ? 'open' : ''}`}>
                <div style={{ padding: '20px 24px' }}>
                  {renderSummaryContent()}
                </div>
              </div>
            </div>

            {/* Step 2: Traveler Details Form */}
            {currentStep === 2 && (
              <div className="card">
                <div className="card-header">
                  <Users className="w-5 h-5 text-emerald" />
                  Traveler Details
                </div>
                <div className="card-body">
                  
                  <div className="form-section">
                    <div className="form-section-title">Primary Contact</div>
                    <div className="form-row cols-2">
                      <div className={`form-group ${errors.contactName ? 'has-error' : ''}`}>
                        <label>Full Name</label>
                        <input
                          value={contactName}
                          onChange={(e) => { setContactName(e.target.value); clearError('contactName'); }}
                          placeholder="e.g. Syed Sarmad Shah"
                        />
                        <span className="error-msg">Please enter primary contact name</span>
                      </div>
                      <div className={`form-group ${errors.contactEmail ? 'has-error' : ''}`}>
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => { setContactEmail(e.target.value); clearError('contactEmail'); }}
                          placeholder="sarmad.shah@example.com"
                        />
                        <span className="error-msg">Please enter a valid email address</span>
                      </div>
                    </div>
                    
                    <div className="form-row cols-2" style={{ marginTop: 16 }}>
                      <div className={`form-group ${errors.contactPhone ? 'has-error' : ''}`}>
                        <label>Mobile Number</label>
                        <input
                          value={contactPhone}
                          onChange={(e) => { setContactPhone(formatPhone(e.target.value)); clearError('contactPhone'); }}
                          placeholder="03XXXXXXXXX"
                          maxLength={11}
                        />
                        <span className="error-msg">Enter a valid 11-digit mobile (e.g., 03001234567)</span>
                      </div>
                      <div className={`form-group ${errors.pickupLocation ? 'has-error' : ''}`}>
                        <label>Pickup Location</label>
                        <input
                          value={pickupLocation}
                          onChange={(e) => { setPickupLocation(e.target.value); clearError('pickupLocation'); }}
                          placeholder="e.g. Lahore Airport LHE / Hotel"
                        />
                        <span className="error-msg">Please enter your pickup details</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-section-title">Number of Travelers</div>
                    <div className="counter-row">
                      <div className="counter-label">
                        <span>Adults</span>
                        <span>Age 12 or above</span>
                      </div>
                      <div className="counter-controls">
                        <button
                          type="button"
                          className="counter-btn"
                          disabled={adultCount <= 1}
                          onClick={() => setAdultCount(adultCount - 1)}
                        >
                          -
                        </button>
                        <span className="counter-val">{adultCount}</span>
                        <button
                          type="button"
                          className="counter-btn"
                          onClick={() => setAdultCount(adultCount + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="counter-row">
                      <div className="counter-label">
                        <span>Children</span>
                        <span>Age 2 to 11</span>
                      </div>
                      <div className="counter-controls">
                        <button
                          type="button"
                          className="counter-btn"
                          disabled={childCount <= 0}
                          onClick={() => setChildCount(childCount - 1)}
                        >
                          -
                        </button>
                        <span className="counter-val">{childCount}</span>
                        <button
                          type="button"
                          className="counter-btn"
                          onClick={() => setChildCount(childCount + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-section-title">Travel Scheduling & Options</div>
                    
                    <div className="form-row cols-2">
                      <div className={`form-group ${errors.departureDate ? 'has-error' : ''}`}>
                        <label>Departure Date</label>
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => { setDepartureDate(e.target.value); clearError('departureDate'); }}
                        />
                        <span className="error-msg">Departure date is required</span>
                      </div>
                      
                      <div className={`form-group ${errors.returnDate ? 'has-error' : ''}`}>
                        <label>Return Date</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => { setReturnDate(e.target.value); clearError('returnDate'); }}
                        />
                        <span className="error-msg">Return date must be after departure</span>
                      </div>
                    </div>

                    <div className="form-row cols-2" style={{ marginTop: 16 }}>
                      <div className="form-group">
                        <label>Transport Preference</label>
                        <select value={transportType} onChange={(e) => setTransportType(e.target.value)}>
                          <option value="Private SUV (Prado)">Private SUV (Toyota Prado)</option>
                          <option value="Private Coaster">Private Coaster (Toyota Coaster)</option>
                          <option value="Standard Saloon Car">Standard Saloon (Honda Civic/Corolla)</option>
                          <option value="Flight + Shared Transport">Flight + Shared Transport</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Accommodation Standard</label>
                        <select value={accommodationName} onChange={(e) => setAccommodationName(e.target.value)}>
                          <option value="Serena Hotel Hunza & Luxus Grand Lahore">Luxury Standard (Serena / Luxus Grand)</option>
                          <option value="Hunza Eagle's Nest & Lahore Fort View">Comfort Standard (Eagle's Nest / Fort View)</option>
                          <option value="Standard Tourism Guest Houses">Standard (Tourist Guest Houses)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button className="primary-action-btn" type="button" onClick={handleStep2Submit}>
                    Continue to Payment <ArrowRight className="w-5 h-5" />
                  </button>

                </div>
              </div>
            )}

            {/* Step 3: Payment Form & Review Booking */}
            {currentStep === 3 && (
              <div className="step-payment-section">
                
                {/* Review details panel */}
                <div className="review-section-box">
                  <div className="review-title-row">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info className="w-5 h-5 text-emerald" /> Review Booking Details
                    </h3>
                    <button type="button" className="edit-btn" onClick={() => setCurrentStep(2)}>
                      <Edit3 className="w-3.5 h-3.5" /> Edit details
                    </button>
                  </div>
                  
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="label">Selected Trip Package</span>
                      <span className="value">{packageName}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Primary Traveler</span>
                      <span className="value">{contactName} ({contactPhone})</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Travel Dates & Duration</span>
                      <span className="value">{new Date(departureDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} – {new Date(returnDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} ({durationDays} Days)</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Traveler Count</span>
                      <span className="value">{adultCount} Adults {childCount > 0 ? `, ${childCount} Children` : ''}</span>
                    </div>
                    <div className="review-item" style={{ gridColumn: 'span 2' }}>
                      <span className="label">Pickup Details</span>
                      <span className="value">{pickupLocation} ({transportType})</span>
                    </div>
                  </div>
                </div>

                {/* Main Payment Form Card */}
                <div className="card">
                  <div className="card-header">
                    <Lock className="w-4.5 h-4.5 text-emerald" /> Select Payment Method
                  </div>
                  <div className="card-body">
                    
                    <div className="method-tabs">
                      <button
                        type="button"
                        className={`method-tab ${currentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setCurrentMethod('card')}
                      >
                        <CreditCard className="w-5 h-5" />
                        Card
                      </button>
                      <button
                        type="button"
                        className={`method-tab ${currentMethod === 'easypaisa' ? 'active' : ''}`}
                        onClick={() => setCurrentMethod('easypaisa')}
                      >
                        <Smartphone className="w-5 h-5 text-emerald" />
                        Easypaisa
                      </button>
                      <button
                        type="button"
                        className={`method-tab ${currentMethod === 'jazzcash' ? 'active' : ''}`}
                        onClick={() => setCurrentMethod('jazzcash')}
                      >
                        <Smartphone className="w-5 h-5 text-red-500" />
                        JazzCash
                      </button>
                      <button
                        type="button"
                        className={`method-tab ${currentMethod === 'bank' ? 'active' : ''}`}
                        onClick={() => setCurrentMethod('bank')}
                      >
                        <HotelIcon className="w-5 h-5" />
                        Bank Transfer
                      </button>
                    </div>

                    {/* Credit Card Form Panel */}
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
                            <span className="error-msg">Please enter the cardholder's exact name</span>
                          </div>
                        </div>
                      </div>

                      <div className="form-section">
                        <div className="form-row" style={{ marginBottom: 16 }}>
                          <div className={`form-group ${errors.cardNumber ? 'has-error' : ''}`}>
                            <label>Card Number</label>
                            <div style={{ position: 'relative' }}>
                              <input
                                value={cardNumber}
                                onChange={(e) => {
                                  setCardNumber(formatCardNumber(e.target.value));
                                  clearError('cardNumber');
                                }}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                style={{ paddingRight: '48px', width: '100%' }}
                              />
                              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--emerald)' }}>
                                {cardBrand === 'visa' && 'VISA'}
                                {cardBrand === 'mastercard' && 'MC'}
                                {cardBrand === 'amex' && 'AMEX'}
                                {cardBrand === 'card' && <CreditCard className="w-5 h-5 text-muted" />}
                              </div>
                            </div>
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
                      </div>
                    </div>

                    {/* Easypaisa Form Panel */}
                    <div className={`panel wallet-panel ${currentMethod === 'easypaisa' ? 'visible' : ''}`}>
                      <p>Enter your registered Easypaisa mobile number. You will receive a checkout confirmation popup on your mobile device to authorize payment.</p>
                      
                      <div className="form-row cols-2">
                        <div className={`form-group ${errors.epPhone ? 'has-error' : ''}`}>
                          <label>Easypaisa Mobile Number</label>
                          <input
                            value={epPhone}
                            onChange={(e) => {
                              setEpPhone(formatPhone(e.target.value));
                              clearError('epPhone');
                            }}
                            placeholder="03XXXXXXXXX"
                            maxLength={11}
                          />
                          <span className="error-msg">Enter a valid 11-digit mobile (e.g., 03001234567)</span>
                        </div>
                        
                        <div className={`form-group ${errors.epPhoneConfirm ? 'has-error' : ''}`}>
                          <label>Confirm Mobile Number</label>
                          <input
                            value={epPhoneConfirm}
                            onChange={(e) => {
                              setEpPhoneConfirm(formatPhone(e.target.value));
                              clearError('epPhoneConfirm');
                            }}
                            placeholder="03XXXXXXXXX"
                            maxLength={11}
                          />
                          <span className="error-msg">Mobile numbers must match</span>
                        </div>
                      </div>
                      
                      <div className="form-section" style={{ marginTop: 20 }}>
                        <div className="form-section-title" style={{ fontSize: '0.8rem' }}>Payment Instructions</div>
                        <ol style={{ fontSize: '0.82rem', paddingLeft: '16px', lineHeight: '1.6', color: 'var(--muted)', margin: '4px 0 0' }}>
                          <li>Submit this checkout page by clicking "Complete Booking Securely".</li>
                          <li>Open the Easypaisa app on your mobile device.</li>
                          <li>Navigate to "My Approvals" inside the sidebar menu.</li>
                          <li>Confirm/Approve the pending transaction within 5 minutes.</li>
                        </ol>
                      </div>
                    </div>

                    {/* JazzCash Form Panel */}
                    <div className={`panel wallet-panel ${currentMethod === 'jazzcash' ? 'visible' : ''}`}>
                      <p>Enter your JazzCash wallet number and secure MPIN. A digital invoice prompt will request validation on your handset.</p>
                      
                      <div className="form-row cols-3">
                        <div className={`form-group ${errors.jcPhone ? 'has-error' : ''}`}>
                          <label>JazzCash Number</label>
                          <input
                            value={jcPhone}
                            onChange={(e) => {
                              setJcPhone(formatPhone(e.target.value));
                              clearError('jcPhone');
                            }}
                            placeholder="03XXXXXXXXX"
                            maxLength={11}
                          />
                          <span className="error-msg">Enter valid number</span>
                        </div>
                        
                        <div className={`form-group ${errors.jcPhoneConfirm ? 'has-error' : ''}`}>
                          <label>Confirm Number</label>
                          <input
                            value={jcPhoneConfirm}
                            onChange={(e) => {
                              setJcPhoneConfirm(formatPhone(e.target.value));
                              clearError('jcPhoneConfirm');
                            }}
                            placeholder="03XXXXXXXXX"
                            maxLength={11}
                          />
                          <span className="error-msg">Numbers must match</span>
                        </div>

                        <div className={`form-group ${errors.jcPin ? 'has-error' : ''}`}>
                          <label>Wallet MPIN</label>
                          <input
                            type="password"
                            value={jcPin}
                            onChange={(e) => {
                              setJcPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                              clearError('jcPin');
                            }}
                            placeholder="****"
                            maxLength={6}
                          />
                          <span className="error-msg">Enter MPIN</span>
                        </div>
                      </div>

                      <div className="form-section" style={{ marginTop: 20 }}>
                        <div className="form-section-title" style={{ fontSize: '0.8rem' }}>Payment Instructions</div>
                        <ol style={{ fontSize: '0.82rem', paddingLeft: '16px', lineHeight: '1.6', color: 'var(--muted)', margin: '4px 0 0' }}>
                          <li>Ensure your JazzCash account has sufficient balance and is active.</li>
                          <li>Keep your mobile phone unlocked. You will receive an instant USSD overlay popup.</li>
                          <li>Enter your 4-digit MPIN into the pop-up to authorize payment instantly.</li>
                        </ol>
                      </div>
                    </div>

                    {/* Bank Transfer Form Panel */}
                    <div className={`panel ${currentMethod === 'bank' ? 'visible' : ''}`}>
                      <div className="bank-info-box">
                        <div className="bank-row">
                          <span>Bank Name</span>
                          <span>HBL Bank Limited (Habib Bank)</span>
                        </div>
                        <div className="bank-row">
                          <span>Account Title</span>
                          <span>Ghoomo Pakistan Pvt Ltd</span>
                        </div>
                        <div className="bank-row">
                          <span>Account Number</span>
                          <span>0123-4567890-001</span>
                        </div>
                        <div className="bank-row">
                          <span>IBAN</span>
                          <div className="iban-copy-container">
                            <span>PK36HABB0000123456789001</span>
                            <button type="button" className="iban-copy-btn" onClick={copyIBAN} title="Copy IBAN">
                              {copyStatus ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="form-row cols-2" style={{ marginBottom: 20 }}>
                        <div className={`form-group ${errors.bankTxn ? 'has-error' : ''}`}>
                          <label>Transaction ID / Ref Number</label>
                          <input
                            value={bankTxn}
                            onChange={(e) => {
                              setBankTxn(e.target.value);
                              clearError('bankTxn');
                            }}
                            placeholder="Enter bank transaction slip ID"
                          />
                          <span className="error-msg">Please enter transaction ID</span>
                        </div>

                        {/* Drag and Drop screenshot file upload */}
                        <div className={`form-group ${errors.bankScreenshot ? 'has-error' : ''}`}>
                          <label>Payment Receipt Screenshot</label>
                          <div
                            className={`screenshot-uploader ${isDragOver ? 'dragover' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload-input').click()}
                          >
                            <input
                              id="file-upload-input"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                            
                            {!screenshotPreview && !isUploading && (
                              <>
                                <Upload className="upload-icon mx-auto" />
                                <p>Drag receipt photo here or click to browse</p>
                                <span>Supports JPG, PNG, PDF up to 5MB</span>
                              </>
                            )}

                            {isUploading && (
                              <div className="upload-progress-container">
                                <p style={{ marginBottom: '8px' }}>Uploading receipt...</p>
                                <div className="upload-progress-bar">
                                  <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                              </div>
                            )}

                            {screenshotPreview && !isUploading && (
                              <div className="screenshot-preview-container">
                                <img src={screenshotPreview} alt="Receipt Preview" className="screenshot-preview" />
                                <button type="button" className="screenshot-remove-btn" onClick={removeScreenshot} title="Remove image">
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="error-msg">Please upload a payment screenshot receipt</span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="trust-badges-container">
                      <div className="trust-badge-card">
                        <div className="icon-container">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span>Secure Booking</span>
                        <p>256-bit SSL encrypted gateway</p>
                      </div>
                      
                      <div className="trust-badge-card">
                        <div className="icon-container">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <span>Free Cancellation</span>
                        <p>Up to 7 days before tour departure</p>
                      </div>

                      <div className="trust-badge-card">
                        <div className="icon-container">
                          <PhoneCall className="w-5 h-5" />
                        </div>
                        <span>24/7 Support</span>
                        <p>Dedicated travel helpline assistance</p>
                      </div>
                    </div>

                    {/* Submit and checkout actions */}
                    <button
                      className="primary-action-btn"
                      type="button"
                      onClick={processPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner"></span> Securing your booking...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4.5 h-4.5" /> Complete Booking Securely
                        </>
                      )}
                    </button>

                    <div className="step-footer-actions">
                      <button
                        type="button"
                        className="prev-step-btn"
                        onClick={() => setCurrentStep(2)}
                        disabled={isProcessing}
                      >
                        <ArrowLeft className="w-4.5 h-4.5" /> Back to Traveler Details
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sticky Order Summary Sidebar */}
          <div className="desktop-summary-sidebar">
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <div className="card-header">Trip Booking Summary</div>
              <div className="card-body">
                {renderSummaryContent()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Step 4: Confirmation / Success View (Full Screen) */
        <div className="confirmation-container">
          <div className="confirmation-card">
            <div className="success-checkmark-circle">
              <Check className="w-10 h-10" />
            </div>
            
            <h2 className="confirmation-title">Booking Request Confirmed!</h2>
            <p className="confirmation-subtitle">
              Your booking has been received and is being processed. An email ticket confirmation has been dispatched.
            </p>

            <div className="confirmation-invoice-box print-invoice-card">
              <div className="invoice-title">Booking Reference Invoice</div>
              
              <div className="invoice-row ref">
                <span>Booking Reference</span>
                <span>{bookingRef}</span>
              </div>
              
              <div className="invoice-row">
                <span>Package Booked</span>
                <span>{packageName}</span>
              </div>

              <div className="invoice-row">
                <span>Destinations</span>
                <span>{destinations.join(' & ')}</span>
              </div>
              
              <div className="invoice-row">
                <span>Primary Traveler</span>
                <span>{contactName}</span>
              </div>
              
              <div className="invoice-row">
                <span>Contact Mobile</span>
                <span>{contactPhone}</span>
              </div>

              <div className="invoice-row">
                <span>Travel Duration</span>
                <span>{departureDate} to {returnDate} ({durationDays} Days)</span>
              </div>

              <div className="invoice-row">
                <span>Travelers count</span>
                <span>{adultCount} Adults {childCount > 0 ? `, ${childCount} Children` : ''}</span>
              </div>

              <div className="invoice-row">
                <span>Pickup Details</span>
                <span>{pickupLocation}</span>
              </div>

              <div className="invoice-row">
                <span>Transport selected</span>
                <span>{transportType}</span>
              </div>

              <div className="invoice-row">
                <span>Payment Method</span>
                <span style={{ textTransform: 'capitalize' }}>{currentMethod}</span>
              </div>

              <div className="invoice-row grand-total">
                <span>Total Amount Paid</span>
                <span>PKR {pricing.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="checklist-group no-print">
              <h4 className="checklist-title">What happens next?</h4>
              
              <div className="checklist-item">
                <CheckCircle className="icon" />
                <div>
                  <p>Confirmation Email Dispatched</p>
                  <span>We have sent your invoice and tour itinerary to <strong>{contactEmail}</strong>.</span>
                </div>
              </div>
              
              <div className="checklist-item">
                <CheckCircle className="icon" />
                <div>
                  <p>Assigned Live AR Guide Bot</p>
                  <span>Your personalized tour interactive guide assistant is active. Try the GuideBot panel in the corner!</span>
                </div>
              </div>

              <div className="checklist-item">
                <CheckCircle className="icon" />
                <div>
                  <p>Tour Agent Phone Check-in</p>
                  <span>An expedition planner will call you on <strong>{contactPhone}</strong> within 12 hours to coordinate pickup.</span>
                </div>
              </div>
            </div>

            <div className="conf-actions-row no-print">
              <button type="button" className="conf-btn-sec" onClick={() => window.print()}>
                Print Receipt
              </button>
              <button
                type="button"
                className="primary-action-btn"
                style={{ flex: 1.5, height: '48px', boxShadow: 'none' }}
                onClick={goHome}
              >
                Go back to Homepage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom CTA Bar */}
      {currentStep < 4 && (
        <div className="mobile-sticky-bottom-bar">
          <div className="sticky-price-info">
            <span className="lbl">Grand Total</span>
            <span className="val">PKR {pricing.grandTotal.toLocaleString()}</span>
          </div>
          {currentStep === 2 ? (
            <button type="button" className="sticky-cta-btn" onClick={handleStep2Submit}>
              Next: Pay <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" className="sticky-cta-btn" onClick={processPayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px' }}></span> Paid
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Confirm & Pay
                </>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default Checkout;
