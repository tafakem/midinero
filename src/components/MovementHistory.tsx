import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { formatCurrency, type Movement, type MovementType } from '../types/finance';

export type ActivityFilter = 'all' | MovementType;

interface MovementHistoryProps {
  movements: Movement[];
  filter: ActivityFilter;
  hideAmounts: boolean;
  onFilterChange: (filter: ActivityFilter) => void;
  onDeleteMovement: (movement: Movement) => void;
}

export function MovementHistory({
  movements,
  filter,
  hideAmounts,
  onFilterChange,
  onDeleteMovement,
}: MovementHistoryProps) {
  return (
    <section
      aria-labelledby="activity-heading"
      className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="activity-heading"
            className="text-sm font-semibold text-[#111917] whitespace-nowrap shrink-0"
          >
            Historial de movimientos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {movements.length}{' '}
            {movements.length === 1 ? 'registro mostrado' : 'registros mostrados'}
          </p>
        </div>

        {/* Interactive segmented filter control */}
        <div
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl"
          role="group"
          aria-label="Filtrar historial de movimientos"
        >
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#111917] shadow-xs'
                : 'text-slate-600 hover:text-[#111917]'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('income')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'income'
                ? 'bg-white text-green-700 shadow-xs'
                : 'text-slate-600 hover:text-[#111917]'
            }`}
          >
            Ingresos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('expense')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'expense'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-[#111917]'
            }`}
          >
            Gastos
          </button>
        </div>
      </div>

      {movements.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            {filter === 'income'
              ? 'Sin ingresos registrados'
              : filter === 'expense'
                ? 'Sin gastos registrados'
                : 'Sin movimientos registrados'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Usa los botones de ingreso o gasto para registrar un movimiento.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {movements.map((mov) => {
            const isIncome = mov.type === 'income';
            return (
              <li
                key={mov.id}
                className="px-4 sm:px-5 py-3.5 min-h-[64px] flex items-center justify-between gap-2 sm:gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                    aria-hidden="true"
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#111917] truncate">
                      {mov.concept}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      <span
                        className={
                          isIncome
                            ? 'text-green-700 font-semibold'
                            : 'text-red-700 font-semibold'
                        }
                      >
                        {isIncome ? 'Ingreso' : 'Gasto'}
                      </span>{' '}
                      <span aria-hidden="true">·</span> {mov.dateLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span
                    className={`text-sm font-semibold tabular-nums whitespace-nowrap ${
                      isIncome ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(mov.amount, hideAmounts)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteMovement(mov)}
                    aria-label={`Eliminar movimiento ${mov.concept}`}
                    title="Eliminar movimiento"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
