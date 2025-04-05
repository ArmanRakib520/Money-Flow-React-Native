import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
export const STORAGE_KEYS = {
  INCOME: 'moneyflow_income',
  EXPENSES: 'moneyflow_expenses',
  CATEGORIES: 'moneyflow_categories',
  SETTINGS: 'moneyflow_settings',
};

// Default expense categories
export const DEFAULT_CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Entertainment',
  'Utilities', 'Healthcare', 'Shopping', 'Personal', 
  'Education', 'Travel', 'Savings', 'Debt', 'Other'
];

// Income type
export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string; // ISO string
  notes?: string;
}

// Expense type
export interface Expense {
  id: string;
  amount: number;
  category: string;
  title: string;
  date: string; // ISO string
  tags: string[];
  notes?: string;
}

// Initialize default categories if not exists
export const initializeStorage = async (): Promise<void> => {
  try {
    const categories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (categories === null) {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Get all income entries
export const getAllIncome = async (): Promise<Income[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.INCOME);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error fetching income data:', error);
    return [];
  }
};

// Add a new income entry
export const addIncome = async (income: Income): Promise<void> => {
  try {
    const currentIncome = await getAllIncome();
    const updatedIncome = [...currentIncome, income];
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(updatedIncome));
  } catch (error) {
    console.error('Error adding income:', error);
  }
};

// Get all expense entries
export const getAllExpenses = async (): Promise<Expense[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error fetching expense data:', error);
    return [];
  }
};

// Add a new expense entry
export const addExpense = async (expense: Expense): Promise<void> => {
  try {
    const currentExpenses = await getAllExpenses();
    const updatedExpenses = [...currentExpenses, expense];
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updatedExpenses));
  } catch (error) {
    console.error('Error adding expense:', error);
  }
};

// Get all categories
export const getCategories = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return jsonValue ? JSON.parse(jsonValue) : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

// Add a new custom category
export const addCategory = async (category: string): Promise<void> => {
  try {
    const currentCategories = await getCategories();
    if (!currentCategories.includes(category)) {
      const updatedCategories = [...currentCategories, category];
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
    }
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

// Delete income entry
export const deleteIncome = async (id: string): Promise<void> => {
  try {
    const currentIncome = await getAllIncome();
    const updatedIncome = currentIncome.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(updatedIncome));
  } catch (error) {
    console.error('Error deleting income:', error);
  }
};

// Delete expense entry
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const currentExpenses = await getAllExpenses();
    const updatedExpenses = currentExpenses.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updatedExpenses));
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}; 