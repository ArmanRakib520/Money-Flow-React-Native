import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  showRequiredIndicator?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  value,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  showRequiredIndicator = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showRequiredIndicator && <Text style={styles.requiredIndicator}> *</Text>}
        </View>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
          ]}
          placeholderTextColor={COLORS.gray}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.base * 2,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  label: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  requiredIndicator: {
    color: COLORS.error,
    ...FONTS.body4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    borderColor: COLORS.mediumGray,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.base * 1.5,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.black,
    ...FONTS.body4,
  },
  inputWithLeftIcon: {
    paddingLeft: SIZES.base,
  },
  inputWithRightIcon: {
    paddingRight: SIZES.base,
  },
  leftIconContainer: {
    marginRight: SIZES.base,
  },
  rightIconContainer: {
    marginLeft: SIZES.base,
  },
  errorText: {
    color: COLORS.error,
    ...FONTS.body5,
    marginTop: SIZES.base / 2,
  },
});

export default Input; 