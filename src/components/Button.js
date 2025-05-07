import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../utils/helpers';

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
  ...props
}) => {
  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? 'rgba(0, 241, 159, 0.5)' : theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.background.input,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: 1,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? 'rgba(255, 77, 79, 0.5)' : theme.colors.error,
          borderColor: theme.colors.error,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: disabled ? 'rgba(0, 241, 159, 0.5)' : theme.colors.primary,
          borderColor: theme.colors.primary,
        };
    }
  };

  // Determine text styles based on variant
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          color: '#121212',
        };
      case 'secondary':
        return {
          color: theme.colors.text.primary,
        };
      case 'outline':
        return {
          color: theme.colors.primary,
        };
      case 'danger':
        return {
          color: '#121212',
        };
      case 'ghost':
        return {
          color: theme.colors.primary,
        };
      default:
        return {
          color: '#121212',
        };
    }
  };

  // Determine size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: theme.borderRadius.md,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: theme.borderRadius.md,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: theme.borderRadius.md,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  // Get font size based on button size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyles(),
        getSizeStyles(),
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'danger' ? '#121212' : theme.colors.primary} 
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              getTextStyles(),
              { fontSize: getFontSize() },
              icon && { marginLeft: 8 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;