import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { COLORS, FONTS, SIZES } from '../utils/theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Income, Expense } from '../services/storageService';
import { formatDate, formatCurrency } from '../utils/dateUtils';

import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

// Define the route and navigation prop types
type TransactionDetailRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type TransactionDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const TransactionDetailScreen = () => {
  const navigation = useNavigation<TransactionDetailNavigationProp>();
  const route = useRoute<TransactionDetailRouteProp>();
  const { 
    income, 
    expenses, 
    categories,
    removeIncome, 
    removeExpense, 
    updateIncome,
    updateExpense,
    addNewCategory
  } = useAppContext();

  // Get transaction ID and type from route params
  const { id, type } = route.params;
  const isIncome = type === 'income';

  // Find the transaction
  const transaction = isIncome 
    ? income.find(item => item.id === id) 
    : expenses.find(item => item.id === id);

  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [title, setTitle] = useState(isIncome ? '' : (transaction as Expense)?.title || '');
  const [source, setSource] = useState(isIncome ? (transaction as Income)?.source || '' : '');
  const [category, setCategory] = useState(isIncome ? '' : (transaction as Expense)?.category || '');
  const [date, setDate] = useState(transaction ? new Date(transaction.date) : new Date());
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [tags, setTags] = useState<string[]>(isIncome ? [] : (transaction as Expense)?.tags || []);
  const [newTag, setNewTag] = useState('');
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset values
      if (transaction) {
        setAmount(transaction.amount.toString());
        if (isIncome) {
          setSource((transaction as Income).source);
        } else {
          setTitle((transaction as Expense).title);
          setCategory((transaction as Expense).category);
          setTags((transaction as Expense).tags);
        }
        setDate(new Date(transaction.date));
        setNotes(transaction.notes || '');
      }
    }
    setIsEditing(!isEditing);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (isIncome) {
      if (!source.trim()) {
        newErrors.source = 'Please enter an income source';
      }
    } else {
      if (!title.trim()) {
        newErrors.title = 'Please enter a title for this expense';
      }
      
      if (!category) {
        newErrors.category = 'Please select a category';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!validateForm() || !transaction) return;

    try {
      if (isIncome) {
        await updateIncome({
          id: transaction.id,
          amount: Number(amount),
          source,
          date: date.toISOString(),
          notes,
        });
      } else {
        await updateExpense({
          id: transaction.id,
          amount: Number(amount),
          title,
          category,
          date: date.toISOString(),
          tags,
          notes,
        });
      }
      setIsEditing(false);
      Alert.alert('Success', 'Transaction updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update. Please try again.');
    }
  };

  // Handle delete transaction
  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${isIncome ? 'income' : 'expense'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              if (isIncome) {
                await removeIncome(id);
              } else {
                await removeExpense(id);
              }
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete. Please try again.');
            }
          }
        },
      ]
    );
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addNewCategory(newCategory.trim());
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  // Category selection modal
  const CategorySelectionModal = () => {
    return (
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setCategory(item);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === item && styles.selectedCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                    {category === item && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.categoryList}
              />
              
              <View style={styles.addCategoryContainer}>
                <Input
                  placeholder="Add New Category"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  containerStyle={styles.addCategoryInput}
                />
                <Button
                  title="Add"
                  size="small"
                  onPress={handleAddCategory}
                  disabled={!newCategory.trim()}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit' : 'View'} {isIncome ? 'Income' : 'Expense'}
          </Text>
        </View>

        <Card elevation="medium" style={styles.card}>
          {isEditing ? (
            <View style={styles.formContainer}>
              {/* Amount Input */}
              <Input
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.amount}
                showRequiredIndicator
              />
              
              {/* Title/Source Input (conditional based on transaction type) */}
              {isIncome ? (
                <Input
                  label="Source"
                  value={source}
                  onChangeText={setSource}
                  placeholder="e.g., Salary, Freelance"
                  error={errors.source}
                  showRequiredIndicator
                />
              ) : (
                <Input
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Grocery Shopping"
                  error={errors.title}
                  showRequiredIndicator
                />
              )}
              
              {/* Category Selector (for expenses only) */}
              {!isIncome && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Category <Text style={styles.requiredIndicator}>*</Text></Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.categorySelector,
                      errors.category ? styles.inputError : null,
                    ]}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    <Text
                      style={[
                        styles.categorySelectorText,
                        category ? styles.categorySelected : null,
                      ]}
                    >
                      {category || 'Select a category'}
                    </Text>
                  </TouchableOpacity>
                  
                  {errors.category && (
                    <Text style={styles.errorText}>{errors.category}</Text>
                  )}
                </View>
              )}
              
              {/* Date Picker */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date</Text>
                
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateSelectorText}>
                    {formatDateForDisplay(date)}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Tags Input (for expenses only) */}
              {!isIncome && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tags</Text>
                  
                  <View style={styles.tagInputContainer}>
                    <Input
                      value={newTag}
                      onChangeText={setNewTag}
                      placeholder="Add a tag"
                      containerStyle={styles.tagInput}
                      onSubmitEditing={handleAddTag}
                    />
                    
                    <Button
                      title="Add"
                      size="small"
                      onPress={handleAddTag}
                      disabled={!newTag.trim()}
                    />
                  </View>
                  
                  {tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {tags.map(tag => (
                        <View key={tag} style={styles.tagItem}>
                          <Text style={styles.tagText}>{tag}</Text>
                          <TouchableOpacity
                            onPress={() => handleRemoveTag(tag)}
                            style={styles.tagRemoveButton}
                          >
                            <Text style={styles.tagRemoveText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
              
              {/* Notes Input */}
              <Input
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes here..."
                multiline
                numberOfLines={4}
                style={styles.notesInput}
              />
            </View>
          ) : (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={[styles.detailValue, styles.amountValue]}>
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>

              {isIncome ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Source:</Text>
                  <Text style={styles.detailValue}>{(transaction as Income).source}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Title:</Text>
                    <Text style={styles.detailValue}>{(transaction as Expense).title}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{(transaction as Expense).category}</Text>
                  </View>
                </>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
              </View>

              {!isIncome && (transaction as Expense).tags.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tags:</Text>
                  <View style={styles.tagsContainer}>
                    {(transaction as Expense).tags.map(tag => (
                      <View key={tag} style={styles.tagItem}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {transaction.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{transaction.notes}</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.buttonsContainer}>
            {isEditing ? (
              <>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={toggleEditMode}
                  style={styles.button}
                  textStyle={styles.cancelButtonText}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSaveChanges}
                  style={styles.button}
                />
              </>
            ) : (
              <>
                <Button
                  title="Edit"
                  onPress={toggleEditMode}
                  style={styles.button}
                  textStyle={styles.editButtonText}
                />
                <Button
                  title="Delete"
                  variant="outline"
                  onPress={handleDelete}
                  style={styles.button}
                  textStyle={styles.deleteButtonText}
                />
              </>
            )}
          </View>
        </Card>
      </ScrollView>
      <CategorySelectionModal />
    </KeyboardAvoidingView>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  card: {
    margin: SIZES.padding,
  },
  formContainer: {
    marginBottom: SIZES.padding,
  },
  detailsContainer: {
    marginBottom: SIZES.padding,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SIZES.base * 2,
    alignItems: 'center',
  },
  detailLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: SIZES.base,
  },
  cancelButtonText: {
    color: COLORS.gray,
  },
  editButtonText: {
    color: COLORS.white,
  },
  deleteButtonText: {
    color: COLORS.error,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    margin: SIZES.padding,
  },
  inputContainer: {
    marginBottom: SIZES.base * 2,
  },
  label: {
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
    fontSize: 14,
    fontWeight: '500',
  },
  requiredIndicator: {
    color: COLORS.error,
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base * 1.5,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  categorySelectorText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  categorySelected: {
    color: COLORS.black,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base * 1.5,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  dateSelectorText: {
    color: COLORS.black,
    fontSize: 14,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: SIZES.base,
    marginBottom: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.base,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: SIZES.radius / 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: SIZES.base,
    marginBottom: SIZES.base,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 12,
    marginRight: 5,
  },
  tagRemoveButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 15,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  notesContainer: {
    marginTop: SIZES.base,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: SIZES.base,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingTop: SIZES.padding,
    maxHeight: '80%',
  },
  modalContent: {
    padding: SIZES.padding,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryItemText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  addCategoryInput: {
    flex: 1,
    marginRight: SIZES.base,
    marginBottom: 0,
  },
});

export default TransactionDetailScreen; 