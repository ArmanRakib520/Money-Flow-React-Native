import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import { Income, Expense } from '../services/storageService';
import { formatDate, formatCurrency } from '../utils/dateUtils';

type Transaction = Income | Expense;

interface TransactionItemProps {
  item: Transaction;
  type: 'income' | 'expense';
  onPress?: (item: Transaction) => void;
  onDelete?: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  type,
  onPress,
  onDelete,
}) => {
  // Determine if the item is an income or expense
  const isIncome = type === 'income';
  
  // Get appropriate title for the transaction
  const getTitle = (): string => {
    if (isIncome) {
      return (item as Income).source;
    } else {
      return (item as Expense).title;
    }
  };
  
  // Get subtitle for the transaction (category for expenses, date for income)
  const getSubtitle = (): string => {
    if (isIncome) {
      return formatDate(item.date);
    } else {
      return `${(item as Expense).category} • ${formatDate(item.date)}`;
    }
  };
  
  // Get amount with proper styling (positive for income, negative for expenses)
  const getAmount = (): string => {
    return formatCurrency(item.amount);
  };
  
  // Handle press event
  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };
  
  // Handle delete event
  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
          <Text style={styles.iconText}>{isIncome ? '↑' : '↓'}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {getTitle()}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {getSubtitle()}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.amount,
            isIncome ? styles.incomeAmount : styles.expenseAmount,
          ]}
        >
          {isIncome ? '+' : '-'} {getAmount()}
        </Text>
        
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base * 1.5,
    paddingHorizontal: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base * 1.5,
  },
  incomeIcon: {
    backgroundColor: COLORS.success + '20', // 20% opacity
  },
  expenseIcon: {
    backgroundColor: COLORS.error + '20', // 20% opacity
  },
  iconText: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.body5,
    color: COLORS.gray,
  },
  rightContent: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  amount: {
    ...FONTS.h4,
    fontWeight: '600',
  },
  incomeAmount: {
    color: COLORS.success,
  },
  expenseAmount: {
    color: COLORS.error,
  },
  deleteButton: {
    marginLeft: SIZES.base,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: COLORS.darkGray,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TransactionItem; 