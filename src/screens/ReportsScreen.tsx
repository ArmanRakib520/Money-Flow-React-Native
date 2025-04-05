import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import TransactionItem from '../components/TransactionItem';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sortByDate } from '../utils/dateUtils';

import { COLORS, FONTS, SIZES } from '../utils/theme';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/dateUtils';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance,
  calculateExpensesByCategory,
  formatExpensesForPieChart, 
} from '../utils/financeUtils';
import { filterByMonth, getMonthName } from '../utils/dateUtils';

import Card from '../components/Card';

const { width } = Dimensions.get('window');

// Define the prop type for navigation
type ReportsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ReportsScreen = () => {
  const { income, expenses, categories } = useAppContext();
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  
  // Track the current month for filtering
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [monthName, setMonthName] = useState<string>(getMonthName(new Date()));
  
  // Get previous months for trend data
  const getPreviousMonths = (date: Date, count: number): Date[] => {
    const months: Date[] = [];
    for (let i = 0; i < count; i++) {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() - i);
      months.push(newDate);
    }
    return months.reverse();
  };
  
  // Get monthly data for the last 6 months
  const lastSixMonths = getPreviousMonths(currentMonth, 6);
  const monthlyData = lastSixMonths.map(month => {
    const monthlyIncome = filterByMonth(income, month);
    const monthlyExpenses = filterByMonth(expenses, month);
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      income: calculateTotalIncome(monthlyIncome),
      expenses: calculateTotalExpenses(monthlyExpenses),
      balance: calculateBalance(monthlyIncome, monthlyExpenses),
    };
  });
  
  // Format data for charts
  const lineChartData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        data: monthlyData.map(data => data.income),
        color: () => COLORS.success,
        strokeWidth: 2,
      },
      {
        data: monthlyData.map(data => data.expenses),
        color: () => COLORS.error,
        strokeWidth: 2,
      },
    ],
    legend: ['Income', 'Expenses'],
  };
  
  // Calculate current month data
  const currentMonthIncome = filterByMonth(income, currentMonth);
  const currentMonthExpenses = filterByMonth(expenses, currentMonth);
  const totalIncome = calculateTotalIncome(currentMonthIncome);
  const totalExpenses = calculateTotalExpenses(currentMonthExpenses);
  const balance = calculateBalance(currentMonthIncome, currentMonthExpenses);
  
  // Calculate expense breakdown by category
  const expensesByCategory = calculateExpensesByCategory(currentMonthExpenses);
  const pieChartData = formatExpensesForPieChart(currentMonthExpenses);
  
  // Get monthly transactions
  const currentMonthTransactions = [
    ...currentMonthIncome.map(item => ({ ...item, type: 'income' })),
    ...currentMonthExpenses.map(item => ({ ...item, type: 'expense' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Handle transaction item press
  const handleTransactionPress = (item: any) => {
    navigation.navigate('TransactionDetail', { 
      id: item.id, 
      type: item.type 
    });
  };
  
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
  
  // Get top expense categories
  const getTopExpenses = () => {
    return Object.entries(expensesByCategory)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 3);
  };
  
  // Calculate percentage of income spent
  const getSpendingPercentage = () => {
    if (totalIncome === 0) return 0;
    return Math.round((totalExpenses / totalIncome) * 100);
  };
  
  const spendingPercentage = getSpendingPercentage();
  const topExpenses = getTopExpenses();
  
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
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Monthly Overview Card */}
          <Card elevation="medium" style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Overview</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={[styles.statValue, styles.incomeValue]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={[styles.statValue, styles.expenseValue]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Balance</Text>
                <Text style={[styles.statValue, balance >= 0 ? styles.incomeValue : styles.expenseValue]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.spendingContainer}>
              <Text style={styles.spendingText}>
                You've spent <Text style={styles.spendingPercentage}>{spendingPercentage}%</Text> of your income
              </Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.min(spendingPercentage, 100)}%` },
                    spendingPercentage > 100 ? styles.overBudget : null,
                  ]} 
                />
              </View>
            </View>
          </Card>
          
          {/* Expense Breakdown Card */}
          {currentMonthExpenses.length > 0 ? (
            <Card elevation="medium" style={styles.card}>
              <Text style={styles.cardTitle}>Expense Breakdown</Text>
              
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieChartData}
                  width={width - 64}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                />
              </View>
              
              <View style={styles.divider} />
              
              <Text style={styles.topExpensesTitle}>Top Expenses</Text>
              
              {topExpenses.map(([category, amount], index) => (
                <View key={category} style={styles.topExpenseItem}>
                  <View style={styles.topExpenseLeft}>
                    <View 
                      style={[
                        styles.categoryDot, 
                        { backgroundColor: pieChartData[index]?.color || COLORS.gray }
                      ]} 
                    />
                    <Text style={styles.topExpenseCategory}>{category}</Text>
                  </View>
                  <Text style={styles.topExpenseAmount}>{formatCurrency(amount)}</Text>
                </View>
              ))}
            </Card>
          ) : (
            <Card elevation="medium" style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyText}>No expenses for {monthName}</Text>
              <Text style={styles.emptySubText}>
                Add some expenses to see your spending breakdown
              </Text>
            </Card>
          )}
          
          {/* Income vs Expenses Trend Card */}
          <Card elevation="medium" style={styles.card}>
            <Text style={styles.cardTitle}>6-Month Trend</Text>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={lineChartData}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: COLORS.white,
                  backgroundGradientFrom: COLORS.white,
                  backgroundGradientTo: COLORS.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '1',
                  },
                }}
                bezier
                style={styles.lineChart}
              />
            </View>
          </Card>
          
          {/* Transactions List Card */}
          <Card elevation="medium" style={styles.card}>
            <Text style={styles.cardTitle}>Transactions</Text>
            
            {currentMonthTransactions.length > 0 ? (
              <View style={styles.transactionListContainer}>
                {currentMonthTransactions.map((item) => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    type={item.type as 'income' | 'expense'}
                    onPress={() => handleTransactionPress(item)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No transactions for {monthName}</Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
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
    fontSize: 22,
    color: COLORS.primary,
    paddingHorizontal: SIZES.base * 2,
  },
  monthTitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    minWidth: 150,
    textAlign: 'center',
    fontWeight: '600',
  },
  disabledArrow: {
    opacity: 0.3,
  },
  disabledArrowText: {
    color: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
  },
  card: {
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.base * 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base * 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeValue: {
    color: COLORS.success,
  },
  expenseValue: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.base * 2,
  },
  spendingContainer: {
    alignItems: 'center',
  },
  spendingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  spendingPercentage: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  overBudget: {
    backgroundColor: COLORS.error,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  topExpensesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  topExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  topExpenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SIZES.base,
  },
  topExpenseCategory: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  topExpenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  lineChart: {
    marginVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  transactionListContainer: {
    marginTop: SIZES.base,
  },
});

export default ReportsScreen; 