import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Crown,
  Sparkles,
  CreditCard,
  Calendar,
  Download,
  Printer,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { PractitionerUser, UserSubscription, SubscriptionPlanId, SubscriptionBillingCycle, SubscriptionInvoice } from '../types';
import { SUBSCRIPTION_PLANS, SubscriptionPlanDefinition } from '../data/subscriptionPlans';
import { updateUserSubscription } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  currentUser: PractitionerUser;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: PractitionerUser) => void;
  initialTab?: 'plans' | 'current' | 'invoices';
}

export const SubscriptionModal: React.FC<Props> = ({
  currentUser,
  isOpen,
  onClose,
  onUserUpdated,
  initialTab = 'plans',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'plans' | 'current' | 'invoices'>(initialTab);
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('monthly');
  const [selectedPlanToSubscribe, setSelectedPlanToSubscribe] = useState<SubscriptionPlanDefinition | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sepa'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState(currentUser.fullName);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<SubscriptionInvoice | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<{
    isConfigured: boolean;
    publishableKey: string | null;
    mode: string;
    hasWebhookSecret: boolean;
  } | null>(null);

  // Fetch Stripe configuration status
  useEffect(() => {
    fetch('/api/stripe/config')
      .then((res) => res.json())
      .then((data) => setStripeConfig(data))
      .catch((err) => console.warn('Could not load Stripe config:', err));
  }, []);

  // Check for returning Stripe Checkout redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const stripeStatus = params.get('stripe_status');
    const sessionId = params.get('session_id');
    const plan = (params.get('plan') as SubscriptionPlanId) || 'pro';
    const cycle = (params.get('cycle') as SubscriptionBillingCycle) || 'monthly';

    if (stripeStatus === 'success' && sessionId) {
      setIsProcessing(true);
      fetch(`/api/stripe/verify-session/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) {
            const planDef = SUBSCRIPTION_PLANS.find((p) => p.id === plan) || SUBSCRIPTION_PLANS[1];
            const now = new Date();
            const nextDate = new Date(now);
            if (cycle === 'yearly') {
              nextDate.setFullYear(nextDate.getFullYear() + 1);
            } else {
              nextDate.setMonth(nextDate.getMonth() + 1);
            }
            const price = cycle === 'yearly' ? planDef.priceYearlyPerMonth * 12 : planDef.priceMonthly;

            const newInvoice: SubscriptionInvoice = {
              id: 'inv-stripe-' + Date.now(),
              invoiceNumber: `STRIPE-${sessionId.slice(-8).toUpperCase()}`,
              date: now.toISOString().split('T')[0],
              amount: price,
              taxAmount: Math.round(price * 0.2 * 100) / 100,
              planName: planDef.name,
              billingCycle: cycle,
              status: 'paid',
              pdfDownloadName: `facture-stripe-${sessionId.slice(-6)}.pdf`,
            };

            const updatedSub: UserSubscription = {
              planId: planDef.id,
              planName: planDef.name,
              priceMonthly: planDef.priceMonthly,
              billingCycle: cycle,
              status: 'active',
              startedAt: now.toISOString().split('T')[0],
              renewsAt: nextDate.toISOString().split('T')[0],
              paymentMethodBrand: 'visa',
              paymentMethodLast4: 'Stripe',
              autoRenew: true,
              invoices: [newInvoice, ...(currentUser.subscription?.invoices || [])],
            };

            const updatedUser = updateUserSubscription(currentUser.id, updatedSub);
            onUserUpdated(updatedUser);
            setSuccessMessage(`Félicitations ! Votre abonnement Stripe (${planDef.name}) a été validé avec succès.`);
            setActiveTab('current');
            // Clean URL query params without reloading
            window.history.replaceState({}, '', window.location.pathname);
          }
        })
        .catch((e) => console.error('Verification failed', e))
        .finally(() => setIsProcessing(false));
    } else if (stripeStatus === 'cancelled') {
      setErrorMessage('Le paiement Stripe a été annulé.');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  }, []);

  if (!isOpen) return null;

  const currentSub = currentUser.subscription;
  const currentPlanId = currentSub?.planId || 'pro';

  const handleOpenCheckout = (plan: SubscriptionPlanDefinition) => {
    setSelectedPlanToSubscribe(plan);
    setShowCheckout(true);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlanToSubscribe) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanToSubscribe.id,
          billingCycle,
          clientEmail: currentUser.email,
          clientName: currentUser.fullName,
          instituteName: currentUser.instituteName,
          userId: currentUser.id,
        }),
      });

      const data = await res.json();

      if (data.isConfigured && data.url) {
        // Redirect to official Stripe Hosted Checkout
        window.location.href = data.url;
      } else {
        // Stripe not configured in AI Studio Secrets yet, use simulation with warning
        handleConfirmSubscription();
      }
    } catch (err: any) {
      console.error('Stripe redirect error:', err);
      setErrorMessage(err.message || 'Erreur lors de la redirection Stripe');
      setIsProcessing(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: (currentSub as any)?.stripeCustomerId || '',
          returnUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(
          data.error ||
            'Le portail client Stripe sera actif dès qu’un abonnement réel aura été initié.'
        );
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Erreur lors de l’accès au portail Stripe.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSubscription = () => {
    if (!selectedPlanToSubscribe) return;
    setIsProcessing(true);

    setTimeout(() => {
      const now = new Date();
      const nextDate = new Date(now);
      if (billingCycle === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const price = billingCycle === 'yearly'
        ? selectedPlanToSubscribe.priceYearlyPerMonth * 12
        : selectedPlanToSubscribe.priceMonthly;

      const newInvoice: SubscriptionInvoice = {
        id: 'inv-' + Date.now(),
        invoiceNumber: `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        date: now.toISOString().split('T')[0],
        amount: price,
        taxAmount: Math.round(price * 0.2 * 100) / 100,
        planName: selectedPlanToSubscribe.name,
        billingCycle,
        status: 'paid',
        pdfDownloadName: `facture-dermesthetic-${now.toISOString().split('T')[0]}.pdf`,
      };

      const updatedSubscription: UserSubscription = {
        planId: selectedPlanToSubscribe.id,
        planName: selectedPlanToSubscribe.name,
        priceMonthly: selectedPlanToSubscribe.priceMonthly,
        billingCycle,
        status: 'active',
        startedAt: now.toISOString().split('T')[0],
        renewsAt: nextDate.toISOString().split('T')[0],
        paymentMethodBrand: paymentMethod === 'card' ? 'visa' : 'sepa',
        paymentMethodLast4: paymentMethod === 'card' ? cardNumber.slice(-4) || '4242' : '9012',
        autoRenew: true,
        invoices: [newInvoice, ...(currentSub?.invoices || [])],
      };

      const updatedUser = updateUserSubscription(currentUser.id, updatedSubscription);
      onUserUpdated(updatedUser);
      setIsProcessing(false);
      setShowCheckout(false);
      setSelectedPlanToSubscribe(null);
      setSuccessMessage(t.subscription.successSubscribed);
      setActiveTab('current');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 900);
  };

  const handleCancelAutoRenew = () => {
    if (!currentSub) return;
    const updatedSub: UserSubscription = {
      ...currentSub,
      autoRenew: false,
      status: 'cancelled',
    };
    const updatedUser = updateUserSubscription(currentUser.id, updatedSub);
    onUserUpdated(updatedUser);
    setConfirmCancelModal(false);
    setSuccessMessage('Le renouvellement automatique a été annulé. Vous conservez votre accès jusqu’à la fin du mois.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleResumeAutoRenew = () => {
    if (!currentSub) return;
    const updatedSub: UserSubscription = {
      ...currentSub,
      autoRenew: true,
      status: 'active',
    };
    const updatedUser = updateUserSubscription(currentUser.id, updatedSub);
    onUserUpdated(updatedUser);
    setSuccessMessage('Votre abonnement mensuel est de nouveau actif.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handlePrintSingleInvoice = (inv: SubscriptionInvoice) => {
    setViewingInvoice(inv);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-stone-950 via-rose-950 to-stone-900 p-3.5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-300 shadow-inner shrink-0">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-serif font-bold text-base sm:text-xl text-white truncate">
                  {t.subscription.modalTitle}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 shrink-0">
                  {currentSub ? `${currentSub.planName} · ${currentSub.priceMonthly}€/m` : 'Pro 29€'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-rose-200/80 font-medium mt-0.5 truncate">
                {t.subscription.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success alert banner */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-2.5 sm:p-3 px-4 sm:px-6 flex items-center gap-2 text-xs text-emerald-900 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 sm:px-6 pt-2 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.subscription.tabPlans}
          </button>

          <button
            onClick={() => setActiveTab('current')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'current'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.subscription.tabCurrent}
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>{t.subscription.tabInvoices}</span>
            {currentSub?.invoices && currentSub.invoices.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700">
                {currentSub.invoices.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Subscription Plans Cards */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Billing Cycle Segmented Selector */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-100 p-2 rounded-2xl border border-stone-200">
                <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl shadow-2xs border border-stone-200/80">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-rose-950 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t.subscription.monthlyToggle}
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      billingCycle === 'yearly'
                        ? 'bg-rose-950 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>{t.subscription.yearlyToggle}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
                      -20%
                    </span>
                  </button>
                </div>

                <div className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-800 shrink-0" />
                  <span>{t.subscription.noCommitment}</span>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = currentPlanId === plan.id;
                  const price = billingCycle === 'yearly' ? plan.priceYearlyPerMonth : plan.priceMonthly;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all ${
                        plan.isPopular
                          ? 'bg-gradient-to-b from-rose-50/70 via-white to-stone-50 border-2 border-rose-900 shadow-md ring-1 ring-rose-900/10'
                          : 'bg-white border border-stone-200 shadow-xs hover:border-stone-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-3">
                        <span className="font-serif font-bold text-base text-stone-900">
                          {plan.name}
                        </span>
                        {plan.badge && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              plan.isPopular
                                ? 'bg-rose-950 text-rose-200'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500 min-h-[32px] leading-relaxed mb-4">
                        {plan.tagline}
                      </p>

                      {/* Pricing Tag */}
                      <div className="py-3 border-y border-stone-100 mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
                            {price} €
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            {t.subscription.monthlyTag}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-0.5">
                          {billingCycle === 'yearly' && plan.priceMonthly > 0
                            ? `Facturé ${price * 12} € / an (${plan.priceMonthly}€/m en mensuel)`
                            : plan.priceMonthly > 0
                            ? 'Facturation mensuelle sans engagement'
                            : 'Gratuit sans carte bancaire'}
                        </span>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2.5 text-xs flex-1 mb-6">
                        {plan.features.map((feat, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-2 ${
                              feat.included ? 'text-stone-800' : 'text-stone-400 opacity-60'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {feat.included ? (
                                <Check
                                  className={`w-3.5 h-3.5 ${
                                    feat.highlight ? 'text-rose-800 font-bold' : 'text-emerald-700'
                                  }`}
                                />
                              ) : (
                                <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] text-stone-300">
                                  —
                                </span>
                              )}
                            </span>
                            <span className={feat.highlight ? 'font-semibold text-rose-950' : ''}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Call to action button */}
                      <div>
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-500 text-xs font-bold border border-stone-200 cursor-default flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>{t.subscription.currentPlanBtn}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCheckout(plan)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                              plan.isPopular
                                ? 'bg-rose-950 hover:bg-rose-900 text-white'
                                : 'bg-stone-900 hover:bg-stone-800 text-white'
                            }`}
                          >
                            <span>{t.subscription.selectPlanBtn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VAT and Legal Notice */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center text-[11px] text-stone-500">
                {t.subscription.vatNotice}
              </div>
            </div>
          )}

          {/* TAB 2: Current Subscription Management */}
          {activeTab === 'current' && (
            <div className="space-y-6">
              {/* Active Plan Summary Card */}
              <div className="p-6 bg-gradient-to-br from-stone-50 via-rose-50/30 to-stone-100/70 rounded-3xl border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                      Formule souscrite pour {currentUser.instituteName}
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-stone-900">
                      {currentSub?.planName || 'Forfait Pro Esthéticienne'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {currentSub?.autoRenew
                        ? t.subscription.autoRenewActive
                        : 'Renouvellement automatique désactivé (fin de droits le ' + (currentSub?.renewsAt || 'prochainement') + ')'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-serif font-bold text-stone-900">
                      {currentSub?.priceMonthly || 29} € <span className="text-xs font-sans text-stone-500 font-normal">/ mois</span>
                    </div>
                    <span className="text-[11px] text-stone-500 block">
                      {currentSub?.billingCycle === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle sans engagement'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                      {t.subscription.nextRenewal}
                    </span>
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-800" />
                      {currentSub?.renewsAt || '25 du mois'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                      {t.subscription.managePaymentMethod}
                    </span>
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-stone-600" />
                      Visa •••• {currentSub?.paymentMethodLast4 || '4242'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                      Statut d'accès
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Illimité & Certifié
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Changer de formule / Mettre à niveau
                    </button>
                    {stripeConfig?.isConfigured && (
                      <button
                        onClick={handleOpenCustomerPortal}
                        disabled={isProcessing}
                        className="px-3.5 py-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                        <span>Portail Facturation Stripe</span>
                      </button>
                    )}
                  </div>

                  {currentSub?.autoRenew ? (
                    <button
                      onClick={() => setConfirmCancelModal(true)}
                      className="text-stone-500 hover:text-rose-700 text-xs font-medium underline transition-colors cursor-pointer"
                    >
                      {t.subscription.cancelSubscriptionBtn}
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeAutoRenew}
                      className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.subscription.resumeSubscriptionBtn}
                    </button>
                  )}
                </div>
              </div>

              {/* Confirmation de résiliation popup */}
              {confirmCancelModal && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3 animate-fadeIn text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{t.subscription.confirmCancelTitle}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {t.subscription.confirmCancelDesc}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCancelAutoRenew}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Confirmer l'arrêt du renouvellement
                    </button>
                    <button
                      onClick={() => setConfirmCancelModal(false)}
                      className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Invoices History */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {t.subscription.invoicesTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t.subscription.invoicesDesc}
                  </p>
                </div>
                <div className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 shrink-0">
                  Établissement : {currentUser.instituteName}
                </div>
              </div>

              {currentSub?.invoices && currentSub.invoices.length > 0 ? (
                <div className="space-y-2.5">
                  {currentSub.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 font-mono text-sm">
                            {inv.invoiceNumber}
                          </span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Payée
                          </span>
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          Émise le {inv.date} · Forfait {inv.planName} ({inv.billingCycle === 'yearly' ? 'Annuel' : 'Mensuel'})
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="font-bold text-stone-900 text-sm block">
                            {inv.amount.toFixed(2)} € TTC
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            dont TVA 20% : {inv.taxAmount.toFixed(2)} €
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePrintSingleInvoice(inv)}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Afficher la facture officielle pour impression"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  Aucune facture enregistrée pour le moment.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Checkout Modal Sheet */}
        {showCheckout && selectedPlanToSubscribe && (
          <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-rose-800" />
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    {t.subscription.checkoutTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Plan Recap */}
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900 text-sm">
                    {selectedPlanToSubscribe.name}
                  </span>
                  <span className="font-bold text-rose-950 text-base">
                    {billingCycle === 'yearly'
                      ? `${selectedPlanToSubscribe.priceYearlyPerMonth * 12} € / an`
                      : `${selectedPlanToSubscribe.priceMonthly} € / mois`}
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  {billingCycle === 'yearly'
                    ? `Engagement annuel soit ${selectedPlanToSubscribe.priceYearlyPerMonth} € / mois (-20%)`
                    : 'Abonnement mensuel sans engagement, résiliable à tout moment en 1-clic.'}
                </p>
                <div className="text-[10px] text-stone-500 pt-1 border-t border-rose-200/60 flex justify-between">
                  <span>Dont TVA (20%) déductible institut :</span>
                  <span>
                    {(
                      (billingCycle === 'yearly'
                        ? selectedPlanToSubscribe.priceYearlyPerMonth * 12
                        : selectedPlanToSubscribe.priceMonthly) * 0.2
                    ).toFixed(2)}{' '}
                    €
                  </span>
                </div>
              </div>

              {/* Stripe Connection Status Banner */}
              {stripeConfig?.isConfigured ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>Passerelle Stripe {stripeConfig.mode === 'test' ? 'Test Mode' : 'Live'} Connectée</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 font-mono text-emerald-800 px-2 py-0.5 rounded font-bold">
                    SSL 256-bit
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Passerelle Stripe : Clé secrète prête à être ajoutée</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Pour encaisser automatiquement par carte bancaire avec Stripe, renseignez votre <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-stone-800 text-[10px]">STRIPE_SECRET_KEY</code> dans l'onglet <strong>Secrets</strong> de Google AI Studio.
                  </p>
                </div>
              )}

              {/* PRIMARY STRIPE CHECKOUT BUTTON */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleStripeCheckout}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-700 via-indigo-700 to-rose-900 hover:from-violet-800 hover:to-rose-950 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Redirection sécurisée en cours...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-violet-200 shrink-0" />
                      <span className="text-sm">Payer avec Stripe Checkout</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                        CB • SEPA • Apple Pay
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-violet-200 ml-auto shrink-0" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Paiement crypté géré par Stripe. Facture déductible avec TVA.</span>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Ou validation manuelle / cabine
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              {/* Fallback & Simulation Form */}
              <div className="space-y-3 text-xs bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 block text-[11px]">Règlement immédiat en cabine :</span>
                  <span className="text-[10px] text-stone-500">TPE institut / Prélèvement</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-rose-900 bg-rose-50 font-bold text-stone-900 ring-1 ring-rose-900'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-rose-800 shrink-0" />
                    <span className="text-xs">Carte TPE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sepa')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'sepa'
                        ? 'border-rose-900 bg-rose-50 font-bold text-stone-900 ring-1 ring-rose-900'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span className="text-xs">Prélèvement SEPA</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">
                        Titulaire
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">
                          Carte (Derniers 4 chiffres)
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">
                          Expiration
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-center"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">
                        IBAN de l'établissement
                      </label>
                      <input
                        type="text"
                        defaultValue="FR76 3000 2005 5000 0123 4567 890"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmSubscription}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Valide l'abonnement localement avec émission de facture déductible"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Validation immédiate cabine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Official Printable Invoice Modal Preview */}
        {viewingInvoice && (
          <div className="fixed inset-0 z-70 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col p-6 space-y-6 max-h-[92vh] overflow-y-auto print:p-0 print:m-0 print:shadow-none">
              {/* Invoice Actions */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 no-print">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-800" />
                  <span className="font-serif font-bold text-base text-stone-900">
                    Facture {viewingInvoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer</span>
                  </button>
                  <button
                    onClick={() => setViewingInvoice(null)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Document */}
              <div className="space-y-6 text-xs text-stone-800 border p-6 rounded-2xl border-stone-200 bg-white">
                <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-stone-900">
                      DermEsthetic <span className="text-rose-800 font-sans text-sm font-semibold">PRO</span>
                    </h1>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Solution Logicielle SaaS pour Instituts & Centres de Soins
                    </p>
                    <p className="text-[10px] text-stone-400">
                      SIRET : 893 421 982 00019 · TVA Intra : FR 34 893421982
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-stone-100 rounded-lg border border-stone-200 inline-block">
                      {viewingInvoice.invoiceNumber}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Date : {viewingInvoice.date}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Client / Établissement Facturé :
                    </span>
                    <strong className="block text-stone-900 font-bold">{currentUser.instituteName}</strong>
                    <span className="block text-stone-600">{currentUser.fullName}</span>
                    <span className="block text-stone-500">{currentUser.address || 'Adresse institut'}</span>
                    <span className="block text-stone-500">{currentUser.city || 'France'}</span>
                    <span className="block text-stone-500">{currentUser.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Mode de règlement :
                    </span>
                    <span className="font-semibold text-stone-800 block">
                      Carte bancaire (•••• {currentSub?.paymentMethodLast4 || '4242'})
                    </span>
                    <span className="text-emerald-700 font-bold block mt-1">
                      ✓ Statut : Acquittée / Réglée
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left border-collapse border border-stone-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-stone-50 text-[11px] uppercase font-bold text-stone-600 border-b border-stone-200">
                      <th className="p-3">Désignation de la prestation</th>
                      <th className="p-3 text-center">Période</th>
                      <th className="p-3 text-right">Montant HT</th>
                      <th className="p-3 text-right">TVA (20%)</th>
                      <th className="p-3 text-right">Montant TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-100">
                      <td className="p-3 font-semibold text-stone-900">
                        Abonnement Logiciel {viewingInvoice.planName}
                        <span className="text-[10px] text-stone-500 block font-normal">
                          Accès complet aux modules scanner INCI, bilans cutanés IA et gestion d'agenda cabine.
                        </span>
                      </td>
                      <td className="p-3 text-center text-stone-600">
                        {viewingInvoice.billingCycle === 'yearly' ? '12 mois' : '1 mois'}
                      </td>
                      <td className="p-3 text-right">
                        {(viewingInvoice.amount - viewingInvoice.taxAmount).toFixed(2)} €
                      </td>
                      <td className="p-3 text-right">
                        {viewingInvoice.taxAmount.toFixed(2)} €
                      </td>
                      <td className="p-3 text-right font-bold text-stone-900">
                        {viewingInvoice.amount.toFixed(2)} €
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Total Recap */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-xs text-stone-700">
                    <div className="flex justify-between">
                      <span>Total Hors Taxes :</span>
                      <span>{(viewingInvoice.amount - viewingInvoice.taxAmount).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA 20.0% :</span>
                      <span>{viewingInvoice.taxAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-stone-300 font-bold text-sm text-stone-900">
                      <span>Total Net TTC :</span>
                      <span>{viewingInvoice.amount.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 text-center pt-4 border-t border-stone-200">
                  Facture acquittée électroniquement. Dispensée de signature en application de l’article 289 du Code Général des Impôts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
