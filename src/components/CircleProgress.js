import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/helpers';

const CircleProgress = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = theme.colors.primary,
  backgroundColor = theme.colors.background.input,
  title,
  value,
  subtitle,
  style,
  titleStyle,
  valueStyle,
  subtitleStyle,
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate inner circle size
  const innerSize = size - strokeWidth * 2;
  
  // Determine state color based on percentage
  const getStateColor = () => {
    if (percentage >= 80) return theme.colors.primary;
    if (percentage >= 60) return theme.colors.warning;
    return theme.colors.error;
  };
  
  const circleColor = color === 'auto' ? getStateColor() : color;
  
  // Position the indicator dot on the circle
  const angle = (clampedPercentage / 100) * 360;
  const angleRad = (angle - 90) * (Math.PI / 180);
  const dotRadius = size / 2;
  const dotX = dotRadius + dotRadius * Math.cos(angleRad);
  const dotY = dotRadius + dotRadius * Math.sin(angleRad);
  
  return (
    <View style={[styles.container, style]}>
      <View style={{ width: size, height: size }}>
        {/* Progress track */}
        <View
          style={[
            styles.circleBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        
        {/* Progress fill */}
        <View
          style={[
            styles.circleFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: circleColor,
              transform: [
                { rotate: `-90deg` },
                { rotateZ: `${clampedPercentage * 3.6}deg` },
              ],
            },
          ]}
        />
        
        {/* Indicator dot at the end of the fill */}
        {clampedPercentage > 0 && clampedPercentage < 100 && (
          <View
            style={[
              styles.indicatorDot,
              {
                width: strokeWidth * 1.2,
                height: strokeWidth * 1.2,
                borderRadius: (strokeWidth * 1.2) / 2,
                backgroundColor: circleColor,
                left: dotX - (strokeWidth * 1.2) / 2,
                top: dotY - (strokeWidth * 1.2) / 2,
              },
            ]}
          />
        )}
        
        {/* Inner content */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              top: strokeWidth,
              left: strokeWidth,
            },
          ]}
        >
          {title && (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          )}
          
          <Text style={[styles.value, valueStyle]}>
            {value !== undefined ? value : `${Math.round(clampedPercentage)}`}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    borderStyle: 'solid',
    position: 'absolute',
  },
  circleFill: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    position: 'absolute',
  },
  indicatorDot: {
    position: 'absolute',
    zIndex: 2,
  },
  innerCircle: {
    backgroundColor: theme.colors.background.dark,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    color: theme.colors.text.muted,
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
});

export default CircleProgress;