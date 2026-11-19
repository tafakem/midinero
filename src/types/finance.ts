export type MovementType = 'income' | 'expense';

export interface Movement {
  id: string;
  type: MovementType;
  concept: string;
  amount: number;
  date: string;
  dateLabel: string;
  createdAt: number;
}

export function getDaysAgoInputDate(daysAgo: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayInputDate(): string {
  return getDaysAgoInputDate(0);
}

export function getYesterdayInputDate(): string {
  return getDaysAgoInputDate(1);
}

export function getCurrentMonthYearLabel(): string {
  const formatted = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(' de ', ' ');
}

export function formatMovementDateLabel(isoDate: string): string {
  if (!isoDate) return 'Hoy';
  const todayStr = getTodayInputDate();
  if (isoDate === todayStr) {
    const time = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Hoy · ${time}`;
  }

  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;

  const selected = new Date(year, month - 1, day);
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  if (
    selected.getFullYear() === yesterday.getFullYear() &&
    selected.getMonth() === yesterday.getMonth() &&
    selected.getDate() === yesterday.getDate()
  ) {
    return 'Ayer';
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'short',
    year: selected.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(selected);
}

export function sortMovementsMostRecentFirst(movements: Movement[]): Movement[] {
  return [...movements].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return b.createdAt - a.createdAt;
  });
}

const nowMs = Date.now();

export const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: 'mov-1',
    type: 'income',
    concept: 'Salario mensual',
    amount: 3200,
    date: getTodayInputDate(),
    dateLabel: 'Hoy · 09:30',
    createdAt: nowMs,
  },
  {
    id: 'mov-2',
    type: 'expense',
    concept: 'Supermercado',
    amount: 420,
    date: getYesterdayInputDate(),
    dateLabel: 'Ayer · 18:15',
    createdAt: nowMs - 86_400_000,
  },
  {
    id: 'mov-3',
    type: 'expense',
    concept: 'Servicios del hogar',
    amount: 330,
    date: getDaysAgoInputDate(2),
    dateLabel: `${formatMovementDateLabel(getDaysAgoInputDate(2))} · 11:00`,
    createdAt: nowMs - 172_800_000,
  },
];

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  isNegativeBalance: boolean;
}

export function calculateFinancialSummary(movements: Movement[]): FinancialSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const movement of movements) {
    const cents = Math.round(Number(movement.amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) continue;

    if (movement.type === 'income') {
      incomeCents += cents;
      incomeCount += 1;
    } else if (movement.type === 'expense') {
      expenseCents += cents;
      expenseCount += 1;
    }
  }

  const balanceCents = incomeCents - expenseCents;

  return {
    totalIncome: incomeCents / 100,
    totalExpense: expenseCents / 100,
    balance: balanceCents / 100,
    incomeCount,
    expenseCount,
    isNegativeBalance: balanceCents < 0,
  };
}

export function formatCurrency(amount: number, hidden = false): string {
  if (hidden) {
    return 'S/ ••••••';
  }
  const normalized = Object.is(amount, -0) ? 0 : Math.round(amount * 100) / 100;
  const formatted = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(normalized));

  return normalized < 0 ? `-${formatted}` : formatted;
}
