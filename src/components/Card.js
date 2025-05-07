import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../utils/helpers';

const Card = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  footer,
  footerStyle,
  elevated = false,
  bordered = true,
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[
        styles.container,
        bordered && styles.bordered,
        elevated && styles.elevated,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </CardContainer>
  );
};

export const CardSection = ({ children, title, style, titleStyle }) => {
  return (
    <View style={[styles.section, style]}>
      {title && <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>}
      {children}
    </View>
  );
};

export const CardRow = ({ children, style, justifyContent = 'space-between' }) => {
  return (
    <View style={[styles.row, { justifyContent }, style]}>
      {children}
    </View>
  );
};

export const CardDivider = ({ style }) => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
});

export default Card;