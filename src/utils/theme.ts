import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary colors
  primary: '#4361EE',
  primaryDark: '#3A56D4',
  primaryLight: '#7895FF',
  
  // Secondary colors
  secondary: '#F72585',
  secondaryDark: '#D31C75',
  secondaryLight: '#FF5FA8',
  
  // Accent colors
  accent: '#4CC9F0',
  success: '#4CAF50',
  warning: '#F9A825',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutrals
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  mediumGray: '#E0E4E8',
  gray: '#A0AEC0',
  darkGray: '#4A5568',
  black: '#2D3748',
  
  // Transparent colors
  transparent: 'transparent',
  transparentBlack: 'rgba(0, 0, 0, 0.3)',
  transparentGray: 'rgba(150, 150, 150, 0.3)',
  
  // Chart colors
  chart1: '#4361EE',
  chart2: '#3A0CA3',
  chart3: '#F72585',
  chart4: '#4CC9F0',
  chart5: '#7209B7',
  chart6: '#560BAD',
  chart7: '#480CA8',
  chart8: '#F3722C',
  chart9: '#F8961E',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  
  // Font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  h5: 12,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,
  
  // App dimensions
  width,
  height,
};

export const FONTS = {
  largeTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.largeTitle,
    lineHeight: 55,
    fontWeight: 'bold',
  },
  h1: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.h1,
    lineHeight: 36,
    fontWeight: 'bold',
  },
  h2: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.h2,
    lineHeight: 30,
    fontWeight: 'bold',
  },
  h3: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.h3,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  h4: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.h4,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  h5: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.h5,
    lineHeight: 18,
    fontWeight: 'bold',
  },
  body1: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.body1,
    lineHeight: 36,
  },
  body2: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.body2,
    lineHeight: 30,
  },
  body3: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.body3,
    lineHeight: 22,
  },
  body4: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.body4,
    lineHeight: 20,
  },
  body5: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: SIZES.body5,
    lineHeight: 18,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 6,
  },
};

const appTheme = { COLORS, SIZES, FONTS, SHADOWS };

export default appTheme; 