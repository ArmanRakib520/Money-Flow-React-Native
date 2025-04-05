import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { COLORS, FONTS, SIZES } from '../utils/theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/Input';
import Button from '../components/Button';

// Define the route and navigation prop types
type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;
type AddTransactionNavigationProp = StackNavigationProp<RootStackParamList>;

const AddTransactionScreen = () => {
  const navigation = useNavigation<AddTransactionNavigationProp>();
  const route = useRoute<AddTransactionRouteProp>();
  const { addNewIncome, addNewExpense, categories, addNewCategory } = useAppContext();
  
  // Get transaction type from route params or default to expense
  const transactionType = route.params?.type || 'expense';
  const isIncome = transactionType === 'income';
  
  // Form state
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        if (isIncome) {
          await addNewIncome({
            amount: Number(amount),
            source,
            date: date.toISOString(),
            notes,
          });
        } else {
          await addNewExpense({
            amount: Number(amount),
            title,
            category,
            date: date.toISOString(),
            tags,
            notes,
          });
        }
        
        // Show success message and navigate back
        Alert.alert(
          'Success',
          `${isIncome ? 'Income' : 'Expense'} added successfully!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to save. Please try again.');
      }
    }
  };
  
  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
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
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.scrollView}>
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
            <View style={styles.categoryContainer}>
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
          <View style={styles.dateContainer}>
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
            <View style={styles.tagsContainer}>
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
                <View style={styles.tagsListContainer}>
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
          
          {/* Submit Button */}
          <Button
            title={`Save ${isIncome ? 'Income' : 'Expense'}`}
            variant={isIncome ? 'primary' : 'secondary'}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
      
      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
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
                  <Text style={styles.categoryItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListHeaderComponent={
                <View style={styles.addCategoryContainer}>
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChangeText={setNewCategory}
                    containerStyle={styles.addCategoryInput}
                  />
                  <Button
                    title="Add"
                    size="small"
                    onPress={handleAddCategory}
                    disabled={!newCategory.trim()}
                    style={styles.addCategoryButton}
                  />
                </View>
              }
            />
            
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowCategoryModal(false)}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: SIZES.padding,
  },
  categoryContainer: {
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
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  dateContainer: {
    marginBottom: SIZES.base * 2,
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
  tagsContainer: {
    marginBottom: SIZES.base * 2,
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
  tagsListContainer: {
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
  submitButton: {
    marginTop: SIZES.base * 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.transparentBlack,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SIZES.base * 2,
    textAlign: 'center',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base * 2,
  },
  addCategoryInput: {
    flex: 1,
    marginRight: SIZES.base,
    marginBottom: 0,
  },
  addCategoryButton: {
    minWidth: 70,
  },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryItemText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  cancelButton: {
    marginTop: SIZES.base * 2,
  },
});

export default AddTransactionScreen; 