import { Income, Expense } from '../services/storageService';
import { filterByMonth } from './dateUtils';

// Calculate total income
export const calculateTotalIncome = (income: Income[]): number => {
  return income.reduce((total, item) => total + item.amount, 0);
};

// Calculate total expenses
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, item) => total + item.amount, 0);
};

// Calculate balance (income - expenses)
export const calculateBalance = (income: Income[], expenses: Expense[]): number => {
  return calculateTotalIncome(income) - calculateTotalExpenses(expenses);
};

// Calculate expense by category
export const calculateExpensesByCategory = (
  expenses: Expense[]
): Record<string, number> => {
  return expenses.reduce((categories, expense) => {
    const { category, amount } = expense;
    
    if (!categories[category]) {
      categories[category] = 0;
    }
    
    categories[category] += amount;
    return categories;
  }, {} as Record<string, number>);
};

// Format data for pie chart
export const formatExpensesForPieChart = (expenses: Expense[]) => {
  const expensesByCategory = calculateExpensesByCategory(expenses);
  
  return Object.entries(expensesByCategory).map(([name, amount]) => ({
    name,
    amount,
    color: generateColorFromString(name),
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));
};

// Generate color based on string
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

// Calculate monthly change percentage
export const calculateMonthlyChangePercentage = (
  currentMonth: number,
  previousMonth: number
): number => {
  if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
  return ((currentMonth - previousMonth) / previousMonth) * 100;
};

// Get recurring expenses
export const getRecurringExpenses = (expenses: Expense[]): Expense[] => {
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  
  const currentMonthExpenses = filterByMonth(expenses, currentDate);
  const lastMonthExpenses = filterByMonth(expenses, lastMonth);
  
  // Find expenses that appear in both months with similar amounts and categories
  return currentMonthExpenses.filter(current => {
    return lastMonthExpenses.some(
      last => 
        last.category === current.category &&
        Math.abs(last.amount - current.amount) < last.amount * 0.1 // Within 10% of the amount
    );
  });
};

// Generate savings suggestions based on expense patterns
export const generateSavingsSuggestions = (
  expenses: Expense[],
  income: Income[]
): string[] => {
  const suggestions: string[] = [];
  const totalIncome = calculateTotalIncome(income);
  const totalExpenses = calculateTotalExpenses(expenses);
  const expensesByCategory = calculateExpensesByCategory(expenses);
  const categories = Object.keys(expensesByCategory);
  
  // Overall financial health check
  if (totalExpenses > totalIncome) {
    suggestions.push('Your expenses exceed your income. Consider reviewing your budget to find areas to cut back.');
  }
  
  // Basic check for categories that might be too high
  const sortedCategories = categories.sort(
    (a, b) => expensesByCategory[b] - expensesByCategory[a]
  );
  
  // Check if top category takes more than 30% of total
  if (sortedCategories.length > 0) {
    const topCategory = sortedCategories[0];
    const topCategoryAmount = expensesByCategory[topCategory];
    const topCategoryPercentage = (topCategoryAmount / totalExpenses) * 100;
    
    if (topCategoryPercentage > 30) {
      suggestions.push(`Your ${topCategory} expenses make up ${topCategoryPercentage.toFixed(1)}% of your total expenses. Look for ways to reduce this category.`);
    }
  }
  
  // Check for specific categories with common saving opportunities
  const foodExpenses = expensesByCategory['Food'] || 0;
  if (foodExpenses > totalIncome * 0.15) {
    suggestions.push('Your food expenses are relatively high. Consider meal planning or cooking at home more often.');
  }
  
  const entertainmentExpenses = expensesByCategory['Entertainment'] || 0;
  if (entertainmentExpenses > totalIncome * 0.10) {
    suggestions.push('Your entertainment expenses exceed 10% of your income. Look for free or lower-cost entertainment options.');
  }
  
  // Suggest saving a percentage if not already doing so
  const savingsExpenses = expensesByCategory['Savings'] || 0;
  if (savingsExpenses < totalIncome * 0.1) {
    suggestions.push('Consider setting aside at least 10% of your income for savings or emergency fund.');
  }
  
  // If we don't have enough insights, add general advice
  if (suggestions.length < 2) {
    suggestions.push('Track your expenses for at least 2-3 months to get more personalized savings suggestions.');
    suggestions.push('Consider using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.');
  }
  
  return suggestions;
}; 