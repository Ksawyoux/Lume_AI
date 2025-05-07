// Helper functions and theme configuration

// Format currency amounts (e.g., $1,234.56)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date (e.g., Jan 15, 2025)
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format time (e.g., 2:30 PM)
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get color based on transaction category
export const getCategoryColor = (category) => {
  const colors = {
    food: '#FF5A5F',
    transportation: '#2A9D8F',
    entertainment: '#E9C46A',
    shopping: '#F4A261',
    bills: '#E76F51',
    health: '#00B0FF',
    fitness: '#00BFA5',
    education: '#9C27B0',
    default: '#6C757D',
  };
  
  return colors[category.toLowerCase()] || colors.default;
};

// Get color based on emotion
export const getEmotionColor = (emotion) => {
  const colors = {
    happy: '#00BFA5',
    content: '#4CAF50',
    neutral: '#9E9E9E',
    worried: '#FFB74D',
    stressed: '#FF5252',
    default: '#9E9E9E',
  };
  
  return colors[emotion.toLowerCase()] || colors.default;
};

// Get emoji based on emotion
export const getEmotionEmoji = (emotion) => {
  const emojis = {
    happy: '😊',
    content: '😌',
    neutral: '😐',
    worried: '😟',
    stressed: '😰',
    default: '😐',
  };
  
  return emojis[emotion.toLowerCase()] || emojis.default;
};

// Theme configuration
export const theme = {
  colors: {
    primary: '#00f19f', // WHOOP-inspired teal
    secondary: '#535dff',
    error: '#ff4d4f',
    warning: '#faad14',
    success: '#52c41a',
    background: {
      dark: '#111111', // Nearly black background
      light: '#222222', // Slightly lighter for cards
      card: '#1a1a1a', // For card backgrounds
    },
    text: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
      muted: '#777777',
    },
    border: '#333333',
    divider: '#333333',
    recovery: {
      high: '#00f19f', // High recovery - teal
      medium: '#f3c620', // Medium recovery - yellow
      low: '#ff6561', // Low recovery - red
    },
    strain: {
      low: '#3e98ff', // Low strain - blue
      medium: '#f3c620', // Medium strain - yellow
      high: '#ff6561', // High strain - red
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};