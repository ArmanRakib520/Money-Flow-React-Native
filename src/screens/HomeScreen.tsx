import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SIZES } from '../utils/theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatCurrency } from '../utils/dateUtils';
import { filterByMonth, getMonthName } from '../utils/dateUtils';
import { calculateTotalIncome, calculateTotalExpenses, calculateBalance } from '../utils/financeUtils';

import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import Button from '../components/Button';
import Card from '../components/Card';

// Define the prop type for navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { income, expenses, isLoading, refreshData } = useAppContext();
  
  // Track the current month for filtering
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [monthName, setMonthName] = useState<string>(getMonthName(new Date()));
  
  // Filter data for the current month
  const monthlyIncome = filterByMonth(income, currentMonth);
  const monthlyExpenses = filterByMonth(expenses, currentMonth);
  
  // Calculate totals
  const totalIncome = calculateTotalIncome(monthlyIncome);
  const totalExpenses = calculateTotalExpenses(monthlyExpenses);
  const balance = calculateBalance(monthlyIncome, monthlyExpenses);
  
  // Combine income and expenses to display in chronological order
  const transactions = [...monthlyIncome.map(item => ({ ...item, type: 'income' })), 
                        ...monthlyExpenses.map(item => ({ ...item, type: 'expense' }))]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10); // Show only the 10 most recent transactions
  
  // Navigation handlers
  const handleAddIncome = () => {
    navigation.navigate('AddTransaction', { type: 'income' });
  };
  
  const handleAddExpense = () => {
    navigation.navigate('AddTransaction', { type: 'expense' });
  };
  
  // Effect to refresh data when the screen comes into focus
  useEffect(() => {
    refreshData();
  }, []);
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    setMonthName(getMonthName(newDate));
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    
    // Don't allow going to future months
    if (newDate <= new Date()) {
      setCurrentMonth(newDate);
      setMonthName(getMonthName(newDate));
    }
  };
  
  // Check if the current month is the present month
  const isCurrentMonth = () => {
    const now = new Date();
    return (
      currentMonth.getMonth() === now.getMonth() &&
      currentMonth.getFullYear() === now.getFullYear()
    );
  };
  
  // Handle transaction item press
  const handleTransactionPress = (item: any) => {
    navigation.navigate('TransactionDetail', { 
      id: item.id, 
      type: item.type 
    });
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your financial data...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.monthArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <TouchableOpacity 
          onPress={goToNextMonth} 
          disabled={isCurrentMonth()}
          style={isCurrentMonth() ? styles.disabledArrow : undefined}
        >
          <Text style={[styles.monthArrow, isCurrentMonth() ? styles.disabledArrowText : undefined]}>→</Text>
        </TouchableOpacity>
      </View>
      
      {/* Summary Card */}
      <SummaryCard
        title="Monthly Summary"
        income={totalIncome}
        expenses={totalExpenses}
        balance={balance}
        period={monthName}
      />
      
      {/* Add Transaction Buttons */}
      <View style={styles.buttonsContainer}>
        <Button 
          title="Add Income" 
          onPress={handleAddIncome} 
          style={styles.incomeButton}
        />
        <Button 
          title="Add Expense" 
          onPress={handleAddExpense} 
          variant="secondary"
          style={styles.expenseButton}
        />
      </View>
      
      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionItem
                item={item}
                type={item.type as 'income' | 'expense'}
                onPress={() => handleTransactionPress(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        ) : (
          <Card elevation="none" style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>
              No transactions for {monthName}.
            </Text>
            <Text style={styles.emptyStateSubText}>
              Start by adding your income and expenses.
            </Text>
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.base * 2,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  monthArrow: {
    ...FONTS.h2,
    color: COLORS.primary,
    paddingHorizontal: SIZES.base * 2,
  },
  monthTitle: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    minWidth: 150,
    textAlign: 'center',
  },
  disabledArrow: {
    opacity: 0.3,
  },
  disabledArrowText: {
    color: COLORS.gray,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginVertical: SIZES.base * 2,
  },
  incomeButton: {
    flex: 1,
    marginRight: SIZES.base,
  },
  expenseButton: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingTop: SIZES.padding,
    paddingHorizontal: SIZES.base,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    marginBottom: SIZES.base * 2,
    paddingHorizontal: SIZES.base,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  emptyStateText: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  emptyStateSubText: {
    ...FONTS.body4,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default HomeScreen; 