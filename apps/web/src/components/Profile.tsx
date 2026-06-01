import React, { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { ArrowLeft, LogOut, CheckCircle2, Zap, CreditCard, Smartphone, User as UserIcon, Download, FileJson } from 'lucide-react';
import { logOut, db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  date: number;
  status: string;
}

interface ProfileProps {
  user: FirebaseUser | null;
  onBack: () => void;
}

export function Profile({ user, onBack }: ProfileProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpires, setPremiumExpires] = useState<number | null>(null);
  const [tokens, setTokens] = useState(50);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');

  const filteredPaymentHistory = paymentHistory.filter(payment => {
    const query = paymentSearchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const matchesId = payment.id && payment.id.toLowerCase().includes(query);
    const matchesAmount = payment.amount.toString().includes(query) || 
                          `${payment.amount} ${payment.currency}`.toLowerCase().includes(query);
    const matchesMethod = payment.method && payment.method.toLowerCase().includes(query);
    
    return matchesId || matchesAmount || matchesMethod;
  });

  // Fetch or setup basic mock user record for subscription status
  useEffect(() => {
    if (user) {
      const fetchSubscriptionAndPayments = async () => {
        setIsLoadingPayments(true);
        try {
          // Fetch user subscription data
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
             const data = userDoc.data();
             setIsPremium(data.isPremium || false);
             setPremiumExpires(data.premiumExpires || null);
             setTokens(data.tokens ?? 50);
          } else {
             await setDoc(doc(db, 'users', user.uid), { isPremium: false, tokens: 50 }, { merge: true });
          }

          // Fetch payment history
          const paymentsRef = collection(db, 'users', user.uid, 'payments');
          const paymentsQuery = query(paymentsRef, orderBy('date', 'desc'));
          const paymentDocs = await getDocs(paymentsQuery);
          const paymentsData: Payment[] = [];
          paymentDocs.forEach(doc => {
            paymentsData.push({ id: doc.id, ...doc.data() } as Payment);
          });
          setPaymentHistory(paymentsData);

        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingPayments(false);
        }
      };
      fetchSubscriptionAndPayments();
    }
  }, [user]);

  const handleSimulatePayment = async () => {
    if (!user) return;
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    // Simulate network delay for USSD push
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demonstration: simulate an error if the phone number doesn't look valid
    // (e.g. prompt failed to trigger or declined)
    if (paymentMethod !== 'bank' && !phoneNumber.trim()) {
      setPaymentError("The USSD prompt failed to trigger or authorization was declined. Please ensure your number is valid and your phone is active.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
      await setDoc(doc(db, 'users', user.uid), { isPremium: true, premiumExpires: expiry }, { merge: true });

      const newPaymentData = {
        amount: 2500,
        currency: 'TSH',
        method: paymentMethod,
        date: Date.now(),
        status: 'Success'
      };

      const paymentRef = doc(collection(db, 'users', user.uid, 'payments'));
      await setDoc(paymentRef, newPaymentData);

      setPaymentHistory(prev => [{ id: paymentRef.id, ...newPaymentData } as Payment, ...prev]);
      setIsPremium(true);
      setPremiumExpires(expiry);
      setShowPayment(false);
      alert("Payment successful! You are now Premium.");
    } catch (e: any) {
      console.error("Payment failed", e);
      setPaymentError(e.message || "An unexpected error occurred during payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadReceipt = (payment: Payment) => {
    const receiptElement = document.createElement('div');
    receiptElement.innerHTML = `
      <div style="font-family: sans-serif; padding: 40px; color: #111;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; color: #059669;">Payment Receipt</h1>
        <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Receipt ID</p>
          <p style="margin: 4px 0 0 0; font-weight: bold;">${payment.id}</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">Date</span>
          <span style="font-weight: bold;">${new Date(payment.date).toLocaleDateString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">Payment Method</span>
          <span style="font-weight: bold; text-transform: capitalize;">${payment.method}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">Status</span>
          <span style="font-weight: bold; color: #059669;">${payment.status}</span>
        </div>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
          <span style="font-size: 18px; font-weight: bold;">Total Amount</span>
          <span style="font-size: 24px; font-weight: bold; color: #059669;">${payment.amount.toLocaleString()} ${payment.currency}</span>
        </div>
      </div>
    `;

    const opt = {
      margin:       1,
      filename:     `receipt_${payment.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(receiptElement).save();
  };

  const handleExportJSON = (payment: Payment) => {
    const jsonString = JSON.stringify(payment, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${payment.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const daysLeft = premiumExpires ? Math.max(0, Math.ceil((premiumExpires - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h2 className="text-xl font-bold">Please sign in to view profile</h2>
        <button onClick={onBack} className="text-blue-600 hover:underline">Back</button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col items-center py-12 px-4 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <UserIcon size={64} />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.displayName || 'App User'}</h1>
              <p className="text-gray-500 mb-6">{user.email}</p>

              <button 
                onClick={() => {
                  logOut();
                  onBack();
                }}
                className="flex items-center justify-center md:justify-start gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full text-sm self-center md:self-start border border-red-100"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap size={24} className="text-blue-600" /> Account Status
            </h2>
            
            {isPremium ? (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 relative overflow-hidden flex-1 flex flex-col justify-center">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-indigo-900 mb-2 uppercase tracking-wide">Premium Access</h3>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6">
                     <CheckCircle2 size={24} className="text-emerald-500" /> Unlimited AI Edits Enabled
                  </div>
                  <div className="bg-white/80 border border-indigo-100 rounded-lg p-4 inline-block">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Time Left</p>
                    <p className="text-2xl font-black text-indigo-900">{daysLeft} <span className="text-base font-bold text-gray-500">Days</span></p>
                  </div>
                </div>
                <Zap size={140} className="absolute -right-10 -bottom-10 text-blue-200 opacity-40 mix-blend-multiply" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex-1 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Free Plan</h3>
                <p className="text-gray-600 text-sm mb-4">You receive weekly free tokens for AI Editing features.</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full" style={{ width: `${(tokens / 50) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-8 px-1">
                  <span>{tokens} Tokens left</span>
                  <span>50 Max</span>
                </div>
                
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm uppercase tracking-wider"
                >
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
          
          {/* Subscription Tier Info Card */}
          <div className="bg-gradient-to-b from-slate-900 to-[#0a0a0c] rounded-2xl shadow-xl border border-slate-800 p-8 text-white relative flex flex-col h-full">
             <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-bl-xl rounded-tr-xl">Popular</div>
             <h2 className="text-2xl font-bold mb-3 text-white">Pro Monthly</h2>
             <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500">2,500</span>
                <span className="text-slate-400 font-bold ml-2">TSH</span>
                <span className="text-slate-500 font-medium text-sm">/ mo</span>
             </div>
             <div className="space-y-4 text-slate-300 font-medium text-sm flex-1 mb-6">
               <div className="flex items-start gap-3">
                 <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                 <span><strong className="text-white">Unlimited</strong> document & sheet creation</span>
               </div>
               <div className="flex items-start gap-3">
                 <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                 <span><strong className="text-white">Unlimited</strong> AI refines & modifications</span>
               </div>
               <div className="flex items-start gap-3">
                 <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                 <span><strong className="text-white">Unlimited</strong> AI Summarization</span>
               </div>
               <div className="flex items-start gap-3">
                 <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                 <span>Priority Access & Support</span>
               </div>
             </div>
             {!isPremium && (
               <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-wider mt-auto"
                >
                  Subscribe Now
               </button>
             )}
          </div>
        </div>

        {/* Payment History Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard size={24} className="text-emerald-600" /> Payment History
            </h2>
            {paymentHistory.length > 0 && (
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  id="payment-search"
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  placeholder="Search by payment ID or amount..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm font-medium transition-all"
                />
                <svg
                  className="absolute left-3.5 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="p-0">
            {isLoadingPayments ? (
              <div className="p-8 text-center text-gray-500">Loading history...</div>
            ) : paymentHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <CreditCard size={32} />
                </div>
                <p className="font-medium text-gray-600">No payment history yet</p>
                <p className="text-sm">Your past subscriptions will appear here.</p>
              </div>
            ) : filteredPaymentHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="font-medium text-gray-600">No matching payments found</p>
                <p className="text-sm mt-1">Try adjusting your search query or typing a different term.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPaymentHistory.map((payment) => (
                  <div key={payment.id} className="payment-history-item">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-0.5">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                          <span className="capitalize">{payment.method === 'bank' ? 'Bank Transfer' : payment.method}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>ID: {payment.id}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto ml-14 sm:ml-0">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                        {payment.status}
                      </span>
                      <button 
                        id={`download-receipt-btn-${payment.id}`}
                        onClick={() => handleDownloadReceipt(payment)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 font-bold text-xs rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                        title="Download Receipt"
                      >
                        <Download size={14} className="shrink-0" />
                        <span>Download</span>
                      </button>
                      <button 
                        id={`export-json-btn-${payment.id}`}
                        onClick={() => handleExportJSON(payment)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 font-bold text-xs rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                        title="Export details to JSON"
                      >
                        <FileJson size={14} className="shrink-0" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal/Section */}
        {showPayment && !isPremium && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl relative border-4 border-white/20 bg-clip-padding flex flex-col md:flex-row overflow-hidden my-auto">
              <button 
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100/80 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors backdrop-blur-sm"
              >
                ✕
              </button>
              
              {/* Premium Features Details */}
              <div className="bg-gradient-to-b from-slate-900 to-[#0a0a0c] p-8 md:p-10 text-white md:w-1/2 flex flex-col relative">
                 <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-br-xl">Premium Package</div>
                 <h2 className="text-3xl font-bold mb-2 text-white mt-4">Pro Monthly</h2>
                 <p className="text-slate-400 text-sm mb-6">Upgrade to unlock all AI editing and creation tools without limits.</p>
                 
                 <div className="space-y-5 text-slate-200 font-medium text-sm flex-1 mb-8">
                   <div className="flex items-start gap-4">
                     <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                     <span><strong className="text-white block text-base mb-0.5">Unlimited Creation</strong>Create unlimited documents, spreadsheets, and presentations.</span>
                   </div>
                   <div className="flex items-start gap-4">
                     <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                     <span><strong className="text-white block text-base mb-0.5">Unlimited AI Refines</strong>Access AI text generation and modification anytime.</span>
                   </div>
                   <div className="flex items-start gap-4">
                     <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                     <span><strong className="text-white block text-base mb-0.5">AI Summarization</strong>Instantly summarize long documents with zero token limits.</span>
                   </div>
                   <div className="flex items-start gap-4">
                     <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                     <span><strong className="text-white block text-base mb-0.5">Priority Support</strong>Get access to new features and prioritized support queues.</span>
                   </div>
                 </div>

                 <div className="mt-2 pt-6 border-t border-slate-800">
                    <h4 className="text-lg font-bold mb-4 text-white">Frequently Asked Questions</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-slate-200">How does the billing cycle work?</p>
                        <p className="text-xs text-slate-400 mt-1">You are billed 2,500 TSH every 30 days. Access remains active for the full period.</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">Can I cancel my subscription?</p>
                        <p className="text-xs text-slate-400 mt-1">Yes, you can cancel anytime from your profile. You'll retain access until the end of your billing cycle.</p>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Payment Section */}
              <div className="p-8 md:p-10 md:w-1/2 flex flex-col bg-white">
                <h3 className="text-2xl font-extrabold mb-1 text-gray-900">Checkout</h3>
                <div className="mb-6 flex items-baseline gap-1">
                   <span className="text-4xl font-black text-gray-900">2,500</span>
                   <span className="text-gray-600 font-bold ml-1">TSH</span>
                   <span className="text-gray-400 font-medium text-sm">/ month</span>
                </div>
                
                <p className="text-gray-500 mb-4 text-xs font-bold uppercase tracking-wider">Select Payment Method</p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                   {[
                     { id: 'mixx', name: 'Mixx by yas', icon: <Smartphone size={18} /> },
                     { id: 'mpesa', name: 'M-Pesa', icon: <Smartphone size={18} /> },
                     { id: 'airtel', name: 'Airtel Money', icon: <Smartphone size={18} /> },
                     { id: 'halopesa', name: 'HaloPesa', icon: <Smartphone size={18} /> },
                     { id: 'bank', name: 'Bank Card', icon: <CreditCard size={18} /> }
                   ].map(pm => (
                     <button
                       key={pm.id}
                       onClick={() => setPaymentMethod(pm.id)}
                       className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === pm.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                     >
                       {pm.icon}
                       <span className="mt-2 text-[11px] font-bold text-center">{pm.name}</span>
                     </button>
                   ))}
                </div>

                {paymentMethod && (
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Enter {paymentMethod === 'bank' ? 'Account Details' : 'Mobile Number'}
                    </label>
                    <input 
                      type="text" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={paymentMethod === 'bank' ? "Account Number" : "+255 XX XXX XXXX"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm font-medium text-sm mb-3"
                    />
                    {paymentMethod !== 'bank' && (
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-[11px] leading-relaxed border border-emerald-100">
                        <strong className="block mb-1 text-xs">How authorization works:</strong>
                        <ul className="list-decimal pl-4 space-y-1">
                          <li>Enter your mobile money number.</li>
                          <li>Click "Pay 2,500 TSH".</li>
                          <li>A USSD pin-prompt will appear on your phone.</li>
                          <li>Enter your PIN to safely confirm the payment.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {paymentError && (
                  <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 shadow-sm">
                     <p className="text-sm font-bold mb-1">Payment Failed</p>
                     <p className="text-xs leading-relaxed mb-3">{paymentError}</p>
                  </div>
                )}

                <button 
                  onClick={handleSimulatePayment}
                  disabled={!paymentMethod || isProcessingPayment}
                  className="w-full py-4 mt-auto bg-emerald-600 text-white text-lg font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : paymentError ? (
                    'Retry Payment'
                  ) : (
                    'Pay 2,500 TSH'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
