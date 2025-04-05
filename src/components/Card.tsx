import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../utils/theme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'small' | 'medium' | 'large' | 'none';
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'small',
  onPress,
  ...props
}) => {
  // Get shadow style based on elevation
  const getShadowStyle = () => {
    switch (elevation) {
      case 'small':
        return SHADOWS.small;
      case 'medium':
        return SHADOWS.medium;
      case 'large':
        return SHADOWS.large;
      case 'none':
        return {};
      default:
        return SHADOWS.small;
    }
  };

  // If card is pressable, render a TouchableOpacity, otherwise render a View
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, getShadowStyle(), style]}
        activeOpacity={0.7}
        onPress={onPress}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, getShadowStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    overflow: 'hidden',
    marginVertical: SIZES.base,
  },
});

export default Card; 