import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initializeStorage, 
  getAllIncome, 
  getAllExpenses, 
  getCategories,
  addIncome,
  addExpense,
  deleteIncome,
  deleteExpense,
  addCategory,
  Income,
  Expense,
  STORAGE_KEYS
} from '../services/storageService';

// Define the context type
interface AppContextType {
  income: Income[];
  expenses: Expense[];
  categories: string[];
  isLoading: boolean;
  addNewIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  addNewExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  addNewCategory: (category: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  income: [],
  expenses: [],
  categories: [],
  isLoading: true,
  addNewIncome: async () => {},
  addNewExpense: async () => {},
  removeIncome: async () => {},
  removeExpense: async () => {},
  updateIncome: async () => {},
  updateExpense: async () => {},
  addNewCategory: async () => {},
  refreshData: async () => {},
});

// Create a provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await initializeStorage();
      await refreshData();
      setIsLoading(false);
    };

    initialize();
  }, []);

  // Refresh all data from storage
  const refreshData = async () => {
    const [incomeData, expensesData, categoriesData] = await Promise.all([
      getAllIncome(),
      getAllExpenses(),
      getCategories(),
    ]);

    setIncome(incomeData);
    setExpenses(expensesData);
    setCategories(categoriesData);
  };

  // Add new income
  const addNewIncome = async (incomeData: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...incomeData,
      id: Date.now().toString(),
    };

    await addIncome(newIncome);
    setIncome(prev => [...prev, newIncome]);
  };

  // Add new expense
  const addNewExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };

    await addExpense(newExpense);
    setExpenses(prev => [...prev, newExpense]);
  };

  // Update existing income
  const updateIncome = async (updatedIncome: Income) => {
    const updatedIncomeList = income.map(item => 
      item.id === updatedIncome.id ? updatedIncome : item
    );
    
    // First update in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(updatedIncomeList));
    
    // Then update state
    setIncome(updatedIncomeList);
  };
  
  // Update existing expense
  const updateExpense = async (updatedExpense: Expense) => {
    const updatedExpenseList = expenses.map(item => 
      item.id === updatedExpense.id ? updatedExpense : item
    );
    
    // First update in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updatedExpenseList));
    
    // Then update state
    setExpenses(updatedExpenseList);
  };

  // Remove income
  const removeIncome = async (id: string) => {
    await deleteIncome(id);
    setIncome(prev => prev.filter(item => item.id !== id));
  };

  // Remove expense
  const removeExpense = async (id: string) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // Add new category
  const addNewCategory = async (category: string) => {
    await addCategory(category);
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        income,
        expenses,
        categories,
        isLoading,
        addNewIncome,
        addNewExpense,
        removeIncome,
        removeExpense,
        updateIncome,
        updateExpense,
        addNewCategory,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext);

export default AppContext; 