# Lume: Emotional Finance App

Lume (formerly MoodMoney) is a mobile-first fintech application that leverages emotional intelligence to provide personalized financial insights through advanced psychological-financial correlations.

## Features

- 📱 React Native mobile application
- 🧠 AI-powered emotion analysis
- 📊 Financial tracking and insights
- 🔄 Health data integration with Apple Watch
- 🔒 Secure Supabase authentication
- 📉 Psychological-financial correlation analytics
- 🧘 Emotional wellness tracking

## Running the App with Expo

### Prerequisites

Before you start, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lume-app.git
   cd lume-app
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

### Running the App

1. Start the Expo development server:
   ```bash
   npx expo start
   ```

2. Scan the QR code with your device:
   - iOS: Use the Camera app to scan the QR code
   - Android: Use the Expo Go app to scan the QR code

3. The app will open in the Expo Go app on your device

### Building for Production

To create a standalone binary for iOS or Android:

1. Build for iOS:
   ```bash
   expo build:ios
   ```

2. Build for Android:
   ```bash
   expo build:android
   ```

## Project Structure

```
/
├── App.js              # Entry point
├── app.json            # Expo configuration
├── assets/             # App assets (images, fonts, etc.)
├── src/
│   ├── api/            # API service modules
│   ├── components/     # Reusable components
│   ├── context/        # Context providers
│   ├── lib/            # Utility libraries
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens
│   └── utils/          # Utility functions
├── babel.config.js     # Babel configuration
└── package.json        # Dependencies
```

## Authentication

The app uses Supabase for authentication. Users can:
- Sign up with email and password
- Sign in with existing credentials
- Reset password
- Sign out

## Development

- The app is built using React Native with Expo
- Styling is done with React Native StyleSheet
- Navigation uses React Navigation
- State management uses React Context API
- API calls use async/await pattern

## License

This project is licensed under the MIT License - see the LICENSE file for details.