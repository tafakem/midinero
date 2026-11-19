import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RotateCcw,
  Wallet,
  X,
} from 'lucide-react';
import { MovementHistory, type ActivityFilter } from './components/MovementHistory';
import { MovementSheet } from './components/MovementSheet';
import {
  calculateFinancialSummary,
  formatCurrency,
  formatMovementDateLabel,
  getCurrentMonthYearLabel,
  INITIAL_MOVEMENTS,
  sortMovementsMostRecentFirst,
  type Movement,
  type MovementType,
} from './types/finance';

interface FeedbackBanner {
  id: number;
  variant: 'income' | 'expense' | 'deleted';
  title: string;
  detail: string;
  undoMovement?: Movement;
}

export default function App() {
  const [movements, setMovements] = useState<Movement[]>(() =>
    sortMovementsMostRecentFirst(INITIAL_MOVEMENTS),
  );
  const [hideAmounts, setHideAmounts] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<MovementType>('income');
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const {
    totalIncome,
    totalExpense,
    balance,
    incomeCount,
    expenseCount,
    isNegativeBalance,
  } = useMemo(() => calculateFinancialSummary(movements), [movements]);

  const sortedMovements = useMemo(
    () => sortMovementsMostRecentFirst(movements),
    [movements],
  );

  const filteredMovements = useMemo(() => {
    if (activityFilter === 'all') return sortedMovements;
    return sortedMovements.filter((m) => m.type === activityFilter);
  }, [sortedMovements, activityFilter]);

  const { incomeRatio, expenseRatio } = useMemo(() => {
    const totalFlow = totalIncome + totalExpense;
    if (totalFlow <= 0) {
      return { incomeRatio: 0, expenseRatio: 0 };
    }
    const incPct = Math.round((totalIncome / totalFlow) * 100);
    return {
      incomeRatio: incPct,
      expenseRatio: 100 - incPct,
    };
  }, [totalIncome, totalExpense]);

  const openMovementSheet = (type: MovementType) => {
    setSheetType(type);
    setSheetOpen(true);
  };

  const handleAddMovement = ({
    type,
    concept,
    amount,
    date,
  }: {
    type: MovementType;
    concept: string;
    amount: number;
    date: string;
  }) => {
    const formattedDate = formatMovementDateLabel(date);
    const now = Date.now();
    const newMovement: Movement = {
      id: `mov-${now}`,
      type,
      concept,
      amount,
      date,
      dateLabel: formattedDate,
      createdAt: now,
    };

    setMovements((prev) => sortMovementsMostRecentFirst([newMovement, ...prev]));

    if (type === 'income') {
      setFeedback({
        id: now,
        variant: 'income',
        title: 'Ingreso registrado correctamente',
        detail: `${concept} · +${formatCurrency(amount)}`,
      });
    } else {
      setFeedback({
        id: now,
        variant: 'expense',
        title: 'Gasto registrado correctamente',
        detail: `${concept} · -${formatCurrency(amount)}`,
      });
    }
  };

  const handleDeleteMovement = (target: Movement) => {
    setMovements((prev) => prev.filter((item) => item.id !== target.id));
    setFeedback({
      id: Date.now(),
      variant: 'deleted',
      title: 'Movimiento eliminado',
      detail: `${target.concept} · ${target.type === 'income' ? '+' : '-'}${formatCurrency(target.amount)}`,
      undoMovement: target,
    });
  };

  const handleUndoDelete = (movement: Movement) => {
    setMovements((prev) => {
      if (prev.some((item) => item.id === movement.id)) return prev;
      return sortMovementsMostRecentFirst([movement, ...prev]);
    });
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#111917] flex flex-col">
      {/* Compact Sticky Top App Bar (<= 56px, well within 15% mobile sticky cap) */}
      <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg bg-[#0F4C3A] text-white flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111917] whitespace-nowrap shrink-0">
              Mi Dinero
            </span>
          </div>

          <button
            type="button"
            onClick={() => setHideAmounts((prev) => !prev)}
            aria-label={hideAmounts ? 'Mostrar montos' : 'Ocultar montos'}
            className="min-h-[44px] px-3 flex items-center gap-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#111917] hover:bg-slate-100/80 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 cursor-pointer"
          >
            {hideAmounts ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Mostrar</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Ocultar</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-5 rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 ${
              feedback.variant === 'income'
                ? 'bg-green-50 border-green-200 text-green-950'
                : feedback.variant === 'expense'
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : 'bg-white border-slate-200 text-[#111917]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2
                className={`w-5 h-5 shrink-0 ${
                  feedback.variant === 'income'
                    ? 'text-green-700'
                    : feedback.variant === 'expense'
                      ? 'text-red-700'
                      : 'text-slate-700'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{feedback.title}</p>
                <p
                  className={`text-xs mt-0.5 truncate tabular-nums ${
                    feedback.variant === 'income'
                      ? 'text-green-800'
                      : feedback.variant === 'expense'
                        ? 'text-red-800'
                        : 'text-slate-600'
                  }`}
                >
                  {feedback.detail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {feedback.undoMovement && (
                <button
                  type="button"
                  onClick={() => handleUndoDelete(feedback.undoMovement!)}
                  className="min-h-[40px] px-3 flex items-center gap-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Deshacer</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setFeedback(null)}
                aria-label="Cerrar mensaje"
                className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors shrink-0 cursor-pointer ${
                  feedback.variant === 'income'
                    ? 'text-green-800 hover:bg-green-100/80'
                    : feedback.variant === 'expense'
                      ? 'text-red-800 hover:bg-red-100/80'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Primary Column: Balance Card, Primary Actions, Three Indicators */}
          <div className="lg:col-span-7 space-y-5">
            {/* Available Balance Hero Card */}
            <section
              aria-labelledby="balance-heading"
              className="rounded-3xl bg-[#0B2920] text-white p-6 sm:p-7 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <h1
                  id="balance-heading"
                  className="text-sm font-medium text-emerald-100/80 tracking-wide"
                >
                  Saldo disponible
                </h1>
                <span className="text-xs text-emerald-100/70 whitespace-nowrap shrink-0">
                  {getCurrentMonthYearLabel()}
                </span>
              </div>

              <div className="mt-3 sm:mt-4">
                <p
                  className={`text-4xl sm:text-[42px] font-bold tracking-tight tabular-nums leading-none ${
                    isNegativeBalance ? 'text-red-300' : 'text-white'
                  }`}
                >
                  {formatCurrency(balance, hideAmounts)}
                </p>
                <p className="mt-2.5 text-xs text-emerald-100/75 flex items-center gap-1.5">
                  {isNegativeBalance ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-red-300 shrink-0" aria-hidden="true" />
                      <span className="text-red-200 font-medium">
                        Saldo negativo · Los gastos superan los ingresos
                      </span>
                    </>
                  ) : (
                    <span>Cuenta personal · Soles peruanos (PEN)</span>
                  )}
                </p>
              </div>

              {/* Action Buttons: Registrar ingreso & Registrar gasto */}
              <div className="mt-6 grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => openMovementSheet('income')}
                  className="min-h-[48px] px-3.5 sm:px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#062119] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>Registrar ingreso</span>
                </button>

                <button
                  type="button"
                  onClick={() => openMovementSheet('expense')}
                  className="min-h-[48px] px-3.5 sm:px-4 py-3 rounded-xl bg-white/12 hover:bg-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                >
                  <Minus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>Registrar gasto</span>
                </button>
              </div>
            </section>

            {/* Three Indicators: Ingresos, Gastos, Saldo */}
            <section aria-labelledby="indicators-heading">
              <div className="flex items-baseline justify-between mb-3 px-0.5">
                <h2
                  id="indicators-heading"
                  className="text-sm font-semibold text-slate-700"
                >
                  Indicadores del período
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">
                  {movements.length} {movements.length === 1 ? 'movimiento' : 'movimientos'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Indicator 1: Ingresos */}
                <article className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 flex sm:flex-col items-center sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700 block leading-tight">
                        Ingresos
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {incomeCount} {incomeCount === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-700 tabular-nums sm:mt-2">
                    +{formatCurrency(totalIncome, hideAmounts)}
                  </p>
                </article>

                {/* Indicator 2: Gastos */}
                <article className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 flex sm:flex-col items-center sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700 block leading-tight">
                        Gastos
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {expenseCount} {expenseCount === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-red-700 tabular-nums sm:mt-2">
                    -{formatCurrency(totalExpense, hideAmounts)}
                  </p>
                </article>

                {/* Indicator 3: Saldo */}
                <article className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 flex sm:flex-col items-center sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isNegativeBalance
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                      aria-hidden="true"
                    >
                      {isNegativeBalance ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Wallet className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700 block leading-tight">
                        Saldo
                      </span>
                      <span
                        className={`text-[11px] ${
                          isNegativeBalance ? 'text-red-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {isNegativeBalance ? 'Saldo negativo' : 'Ingresos − Gastos'}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-lg sm:text-xl font-bold tabular-nums sm:mt-2 ${
                      isNegativeBalance ? 'text-red-700' : 'text-[#111917]'
                    }`}
                  >
                    {formatCurrency(balance, hideAmounts)}
                  </p>
                </article>
              </div>

              {/* Clean proportional bar comparing Ingresos vs Gastos */}
              {totalIncome + totalExpense > 0 && (
                <div className="mt-3 rounded-2xl bg-white border border-slate-200/80 px-4 py-3.5">
                  <div className="flex items-center justify-between text-xs mb-2 gap-4">
                    <span className="font-medium text-green-700 tabular-nums">
                      Ingresos · {incomeRatio}%
                    </span>
                    <span className="font-medium text-red-700 tabular-nums">
                      Gastos · {expenseRatio}%
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex"
                    role="img"
                    aria-label={`Proporción: ${incomeRatio}% ingresos y ${expenseRatio}% gastos`}
                  >
                    {incomeRatio > 0 && (
                      <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${incomeRatio}%` }}
                      />
                    )}
                    {expenseRatio > 0 && (
                      <div
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${expenseRatio}%` }}
                      />
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Secondary Column: Full Movement History Module */}
          <MovementHistory
            movements={filteredMovements}
            filter={activityFilter}
            hideAmounts={hideAmounts}
            onFilterChange={setActivityFilter}
            onDeleteMovement={handleDeleteMovement}
          />
        </div>
      </main>

      {/* Interactive Sheet to register income or expense */}
      <MovementSheet
        isOpen={sheetOpen}
        type={sheetType}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleAddMovement}
      />
    </div>
  );
}
