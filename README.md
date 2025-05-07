# Lume: Emotional Intelligence for Finance

Lume is a fintech application that leverages emotional intelligence and health data to provide personalized financial insights through advanced psychological-financial correlations.

## Project Structure

The project is organized into two main parts:

1. **Web Application** - The current implementation is a web app built with:
   - React + TypeScript
   - Express backend
   - In-memory database (can be migrated to PostgreSQL)
   - Anthropic Claude API for AI-powered emotion analysis

2. **Mobile Application** - A React Native implementation with Expo:
   - See the [mobile README](./mobile/README.md) for detailed setup instructions
   - Uses same design principles with native components
   - Optimized for iOS and Android

## Features

- **Emotion Tracking**: Capture and analyze emotional states through text, voice, and facial expressions
- **Financial Correlation**: Establish patterns between emotions and spending behavior
- **Health Integration**: Connect Apple Watch and other health data for deeper insights
- **Personalized Insights**: AI-powered recommendations based on emotional and financial patterns
- **WHOOP-Inspired Design**: Minimalist dark mode interfaces with circular visualizations

## Getting Started with the Web App

### Prerequisites

- Node.js (v16 or newer)
- npm (v8 or newer)
- Anthropic API key for emotion analysis

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### Running the Web App

```bash
npm run dev
```

This will start the development server for both backend and frontend.

## API Endpoints

### Emotion Analysis

- `POST /api/emotion-analysis/analyze` - Analyze text for emotional content
- `POST /api/emotion-analysis/patterns` - Analyze emotional patterns over time
- `POST /api/emotion-analysis/insights/finance` - Generate financial insights based on emotions

### User Data

- `GET /api/users/:id` - Get user information
- `GET /api/users/:id/emotions` - Get user's emotion history
- `GET /api/users/:id/transactions` - Get user's transaction history
- `GET /api/users/:id/health/:type` - Get user's health data by type

## Design Philosophy

Lume follows a design philosophy inspired by WHOOP's minimalist and focused approach:

- **Dark Mode First**: Dark interfaces that reduce eye strain and emphasize data
- **Circular Visualizations**: Clean, intuitive circular progress indicators
- **Color Semantics**: Teal primary color (#00f19f) represents positive states
- **Focused Information**: Clear presentation of key metrics without overwhelming users
- **Mobile-First**: Optimized for mobile devices while maintaining functionality on desktop

## Future Development

- **Full PostgreSQL Integration**: Move from in-memory to persistent database
- **Enhanced AI Models**: Deeper analysis of emotional patterns and financial behaviors
- **Voice Analysis**: Add voice emotion detection for more accurate readings
- **Social Insights**: Community-based financial wellness insights
- **Expanded Health Integration**: More comprehensive health and wellness data correlation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.