import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import { useAppContext } from '../context/AppContext';
import { 
  generateSavingsSuggestions, 
  getRecurringExpenses,
  calculateTotalExpenses,
  calculateExpensesByCategory,
} from '../utils/financeUtils';
import { formatCurrency } from '../utils/dateUtils';
import Card from '../components/Card';

const SuggestionsScreen = () => {
  const { income, expenses } = useAppContext();
  
  // Generate savings suggestions
  const savingsSuggestions = generateSavingsSuggestions(expenses, income);
  
  // Get recurring expenses
  const recurringExpenses = getRecurringExpenses(expenses);
  const recurringTotal = calculateTotalExpenses(recurringExpenses);
  
  // Get categories with the highest expenses
  const expensesByCategory = calculateExpensesByCategory(expenses);
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 3);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Smart Savings</Text>
          <Text style={styles.subtitle}>
            Personalized tips to help you save more
          </Text>
        </View>
        
        <View style={styles.content}>
          {/* Personalized Suggestions Card */}
          <Card elevation="medium" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>💡</Text>
              </View>
              <Text style={styles.cardTitle}>Savings Suggestions</Text>
            </View>
            
            <View style={styles.suggestionsList}>
              {savingsSuggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          </Card>
          
          {/* Recurring Expenses Card */}
          <Card elevation="medium" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🔄</Text>
              </View>
              <Text style={styles.cardTitle}>Recurring Expenses</Text>
            </View>
            
            <Text style={styles.cardDescription}>
              These expenses occur regularly and account for{' '}
              <Text style={styles.highlightText}>{formatCurrency(recurringTotal)}</Text> of your spending.
            </Text>
            
            {recurringExpenses.length > 0 ? (
              <View style={styles.recurringList}>
                {recurringExpenses.map(expense => (
                  <View key={expense.id} style={styles.recurringItem}>
                    <View style={styles.recurringItemLeft}>
                      <Text style={styles.recurringItemTitle}>{expense.title}</Text>
                      <Text style={styles.recurringItemCategory}>{expense.category}</Text>
                    </View>
                    <Text style={styles.recurringItemAmount}>
                      {formatCurrency(expense.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyMessage}>
                No recurring expenses detected yet. We need at least two months of data to identify patterns.
              </Text>
            )}
          </Card>
          
          {/* Top Spending Categories Card */}
          <Card elevation="medium" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>📊</Text>
              </View>
              <Text style={styles.cardTitle}>Top Spending Categories</Text>
            </View>
            
            <Text style={styles.cardDescription}>
              Focus on these categories to make the biggest impact on your savings.
            </Text>
            
            {topCategories.length > 0 ? (
              <View style={styles.categoriesList}>
                {topCategories.map(([category, amount], index) => (
                  <View key={category} style={styles.categoryItem}>
                    <View style={styles.categoryRank}>
                      <Text style={styles.categoryRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category}</Text>
                      <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyMessage}>
                Add some expenses to see your top spending categories.
              </Text>
            )}
          </Card>
          
          {/* General Savings Tips Card */}
          <Card elevation="medium" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>💰</Text>
              </View>
              <Text style={styles.cardTitle}>General Savings Tips</Text>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipTitle}>50/30/20 Rule</Text>
                <Text style={styles.tipDescription}>
                  Try to allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipTitle}>Track Everything</Text>
                <Text style={styles.tipDescription}>
                  Make a habit of recording all expenses, no matter how small. Small purchases add up quickly.
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipTitle}>Review Subscriptions</Text>
                <Text style={styles.tipDescription}>
                  Regularly review your subscriptions and cancel those you don't actively use.
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipTitle}>Emergency Fund</Text>
                <Text style={styles.tipDescription}>
                  Aim to build an emergency fund that covers 3-6 months of essential expenses.
                </Text>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white + 'DD',
  },
  content: {
    padding: SIZES.base,
    paddingTop: SIZES.padding,
  },
  card: {
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SIZES.base * 2,
  },
  highlightText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Suggestions styles
  suggestionsList: {
    marginTop: SIZES.base,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: SIZES.base * 2,
    paddingRight: SIZES.base,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SIZES.base,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  // Recurring expenses styles
  recurringList: {
    marginTop: SIZES.base,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  recurringItemLeft: {
    flex: 1,
  },
  recurringItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  recurringItemCategory: {
    fontSize: 12,
    color: COLORS.gray,
  },
  recurringItemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginLeft: SIZES.base,
  },
  // Categories styles
  categoriesList: {
    marginTop: SIZES.base,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base * 1.5,
  },
  categoryRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  categoryRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.base / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  // Tips styles
  tipsList: {
    marginTop: SIZES.base,
  },
  tipItem: {
    marginBottom: SIZES.base * 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SIZES.base / 2,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  // Empty state
  emptyMessage: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: SIZES.padding,
  },
});

export default SuggestionsScreen; 