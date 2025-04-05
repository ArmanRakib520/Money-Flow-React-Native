import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  // Get button style based on variant
  const getButtonVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  // Get button style based on size
  const getButtonSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // Get text style based on variant
  const getTextVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  // Get text style based on size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonVariantStyle(),
        getButtonSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextVariantStyle(),
            getTextSizeStyle(),
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  // Size styles
  smallButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 2,
  },
  mediumButton: {
    paddingVertical: SIZES.base * 1.5,
    paddingHorizontal: SIZES.base * 3,
  },
  largeButton: {
    paddingVertical: SIZES.base * 2,
    paddingHorizontal: SIZES.base * 4,
  },
  
  // Disabled style
  disabledButton: {
    backgroundColor: COLORS.mediumGray,
    borderColor: COLORS.mediumGray,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  
  // Text variant styles
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  
  // Text size styles
  smallText: {
    ...FONTS.body5,
  },
  mediumText: {
    ...FONTS.body4,
  },
  largeText: {
    ...FONTS.body3,
  },
  
  // Disabled text
  disabledText: {
    color: COLORS.gray,
  },
});

export default Button; 