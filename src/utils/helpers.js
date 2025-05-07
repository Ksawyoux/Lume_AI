// Format currency helper
export const formatCurrency = (amount) => {
  return `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Format date helper
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Format time helper
export const formatTime = (date) => {
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return new Date(date).toLocaleTimeString('en-US', options);
};

// Truncate text helper
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get category color helper
export const getCategoryColor = (category) => {
  const categoryColors = {
    food: '#00f19f',
    transport: '#7551FF',
    shopping: '#FF6B6B',
    entertainment: '#FFB443',
    health: '#1890ff',
    bills: '#ff4d4f',
    travel: '#faad14',
    other: '#bfbfbf',
  };
  
  return categoryColors[category.toLowerCase()] || '#bfbfbf';
};

// Get emotion color helper
export const getEmotionColor = (emotion) => {
  const emotionColors = {
    happy: '#52c41a',
    content: '#1890ff',
    neutral: '#bfbfbf',
    worried: '#faad14',
    stressed: '#ff4d4f',
  };
  
  return emotionColors[emotion.toLowerCase()] || '#bfbfbf';
};

// Get emotion emoji helper
export const getEmotionEmoji = (emotion) => {
  const emojis = {
    happy: '😊',
    content: '😌',
    neutral: '😐',
    worried: '😟',
    stressed: '😫',
  };
  
  return emojis[emotion.toLowerCase()] || '😐';
};

// Theme colors
export const theme = {
  colors: {
    primary: '#00f19f',
    secondary: '#7551FF',
    background: {
      dark: '#121212',
      card: '#1e1e1e',
      input: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
      muted: '#888888',
    },
    emotions: {
      happy: '#52c41a',
      content: '#1890ff',
      neutral: '#bfbfbf',
      worried: '#faad14',
      stressed: '#ff4d4f',
    },
    border: '#333333',
    success: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
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
    lg: 12,
    xl: 16,
    circle: 9999,
  },
};