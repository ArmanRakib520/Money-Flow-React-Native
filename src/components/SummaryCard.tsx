import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import Card from './Card';
import { formatCurrency } from '../utils/dateUtils';

interface SummaryCardProps {
  title: string;
  income: number;
  expenses: number;
  balance: number;
  period?: string;
  changePercentage?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  income,
  expenses,
  balance,
  period,
  changePercentage,
}) => {
  // Format the change percentage for display
  const formatChangePercentage = (): string => {
    if (changePercentage === undefined) return '';
    
    const sign = changePercentage >= 0 ? '+' : '';
    return `${sign}${changePercentage.toFixed(1)}%`;
  };
  
  // Determine color for change percentage
  const getChangeColor = (): string => {
    if (changePercentage === undefined) return COLORS.gray;
    return changePercentage >= 0 ? COLORS.success : COLORS.error;
  };
  
  return (
    <Card elevation="medium" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {period && <Text style={styles.period}>{period}</Text>}
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          
          {changePercentage !== undefined && (
            <View
              style={[
                styles.changeContainer,
                { backgroundColor: getChangeColor() + '20' }, // 20% opacity
              ]}
            >
              <Text style={[styles.changeText, { color: getChangeColor() }]}>
                {formatChangePercentage()}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statAmount, styles.incomeAmount]}>
            {formatCurrency(income)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statAmount, styles.expenseAmount]}>
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SIZES.base,
    marginVertical: SIZES.base * 2,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base * 2,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.darkGray,
  },
  period: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  balanceContainer: {
    marginBottom: SIZES.base * 3,
  },
  balanceLabel: {
    ...FONTS.body5,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    ...FONTS.h1,
    color: COLORS.black,
    fontWeight: 'bold',
    marginRight: SIZES.base,
  },
  changeContainer: {
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.radius / 2,
  },
  changeText: {
    ...FONTS.body5,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: SIZES.base * 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...FONTS.body5,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  statAmount: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: COLORS.success,
  },
  expenseAmount: {
    color: COLORS.error,
  },
});

export default SummaryCard; 