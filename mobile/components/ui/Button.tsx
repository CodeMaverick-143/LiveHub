

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

type Variant = 'primary' | 'glass' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const isDisabled = disabled || isLoading;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {leftIcon && !isLoading ? leftIcon : null}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'glass' || variant === 'ghost' ? Colors.textPrimary : '#fff'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  
  primary: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  glass: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.error,
    ...Shadows.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  
  size_sm: {
    paddingHorizontal: Spacing.sm + 4,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: Spacing.md,
    minHeight: 46,
  },
  size_lg: {
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },

  
  text: {
    fontWeight: Typography.semibold,
    includeFontPadding: false,
  },
  text_primary: { color: '#fff' },
  text_glass: { color: Colors.textPrimary },
  text_danger: { color: '#fff' },
  text_ghost: { color: Colors.primary },

  textSize_sm: { fontSize: Typography.sm },
  textSize_md: { fontSize: Typography.base },
  textSize_lg: { fontSize: Typography.md },
});
