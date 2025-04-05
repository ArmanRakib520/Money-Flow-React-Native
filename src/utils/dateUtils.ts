// Format a date to a readable string
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format a currency amount
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Get first and last day of the month for filtering
export const getMonthRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const start = new Date(year, month, 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Filter items by month
export const filterByMonth = <T extends { date: string }>(
  items: T[],
  date: Date = new Date()
): T[] => {
  const { start, end } = getMonthRange(date);
  
  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
};

// Get month name
export const getMonthName = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Sort items by date (newest first)
export const sortByDate = <T extends { date: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Group items by date (for timeline display)
export const groupByDate = <T extends { date: string }>(
  items: T[]
): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {};
  
  items.forEach(item => {
    const dateKey = new Date(item.date).toISOString().split('T')[0];
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(item);
  });
  
  return grouped;
}; 