import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { getTodayInputDate, type MovementType } from '../types/finance';

interface MovementSheetProps {
  isOpen: boolean;
  type: MovementType;
  onClose: () => void;
  onSubmit: (data: {
    type: MovementType;
    concept: string;
    amount: number;
    date: string;
  }) => void;
}

export function MovementSheet({ isOpen, type, onClose, onSubmit }: MovementSheetProps) {
  const [conceptInput, setConceptInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(getTodayInputDate());
  const [amountError, setAmountError] = useState('');
  const conceptRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setConceptInput('');
      setAmountInput('');
      setDateInput(getTodayInputDate());
      setAmountError('');
      const timer = setTimeout(() => {
        conceptRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isIncome = type === 'income';
  const title = isIncome ? 'Registrar ingreso' : 'Registrar gasto';
  const defaultConcept = isIncome ? 'Ingreso general' : 'Gasto general';
  const submitLabel = isIncome ? 'Guardar ingreso' : 'Guardar gasto';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amountInput.replace(',', '.'));
    if (!amountInput.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('El monto debe ser mayor que cero.');
      return;
    }

    onSubmit({
      type,
      concept: conceptInput.trim() || defaultConcept,
      amount: Math.round(numericAmount * 100) / 100,
      date: dateInput || getTodayInputDate(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-[#0B1F1A]/45 backdrop-blur-[2px] p-0 sm:p-4 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200/80 shadow-xl p-6 pb-8 sm:pb-6 transition-transform duration-200 max-h-[92vh] overflow-y-auto">
        {/* Mobile bottom-sheet grab affordance */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" aria-hidden="true" />

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
              aria-hidden="true"
            >
              {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="movement-sheet-title" className="text-lg font-semibold text-[#111917] leading-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isIncome
                  ? 'Suma dinero a tu saldo disponible'
                  : 'Descuenta dinero de tu saldo disponible'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Concepto */}
          <div>
            <label htmlFor="movement-concept" className="block text-sm font-medium text-slate-700 mb-1.5">
              {isIncome ? 'Concepto del ingreso' : 'Concepto del gasto'}
            </label>
            <input
              ref={conceptRef}
              id="movement-concept"
              type="text"
              maxLength={60}
              placeholder={
                isIncome
                  ? 'Ej. Salario, bono, venta o freelance'
                  : 'Ej. Transporte, supermercado, almuerzo'
              }
              value={conceptInput}
              onChange={(e) => setConceptInput(e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#111917] placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15 transition-colors"
            />
          </div>

          {/* Monto recibido / Monto */}
          <div>
            <label htmlFor="movement-amount" className="block text-sm font-medium text-slate-700 mb-1.5">
              {isIncome ? 'Monto recibido' : 'Monto'}
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-500 pointer-events-none"
                aria-hidden="true"
              >
                S/
              </span>
              <input
                id="movement-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountInput}
                aria-invalid={Boolean(amountError)}
                aria-describedby={amountError ? 'movement-amount-error' : undefined}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (amountError) setAmountError('');
                }}
                className={`w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl border text-xl font-semibold text-[#111917] tabular-nums placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                  amountError
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 bg-slate-50/70 focus:border-emerald-600 focus:ring-emerald-600/15'
                }`}
              />
            </div>
            {amountError && (
              <p
                id="movement-amount-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-700"
                role="alert"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{amountError}</span>
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="movement-date" className="block text-sm font-medium text-slate-700 mb-1.5">
              Fecha
            </label>
            <input
              id="movement-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#111917] tabular-nums focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer ${
                isIncome
                  ? 'bg-[#0F4C3A] hover:bg-[#0B3B2D] focus-visible:outline-emerald-700'
                  : 'bg-[#1E293B] hover:bg-[#0F172A] focus-visible:outline-slate-800'
              }`}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
