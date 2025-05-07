# Lume - Emotional Finance Mobile App

Lume is a mobile-first fintech application that helps users understand how their emotional and health states influence financial decisions. The app captures user emotional states through text, voice, and facial expressions to establish correlations with spending patterns.

## Features

- **User Authentication**: Secure login and registration functionality
- **Emotional Tracking**: Record emotions manually or through facial expression analysis
- **Health Metrics**: Track and visualize sleep, recovery, heart rate, and other health data
- **Financial Insights**: Discover correlations between emotional health and spending patterns
- **Personalized Recommendations**: Receive customized financial advice based on your emotional patterns

## Mobile App (React Native + Expo)

This project has been converted to a React Native mobile application using Expo. The application follows a WHOOP-inspired minimalist design with dark mode and circular visualizations.

### Key Technologies

- React Native for cross-platform mobile development
- Expo for easy mobile development workflow
- Facial expression detection through Expo Camera and Face Detector
- Navigation with React Navigation
- Secure authentication flow
- Themed UI components

## Running the App

### Prerequisites

- Node.js (LTS version)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (iOS/Android) or an iOS/Android simulator

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Scan the QR code with the Expo Go app on your mobile device or press 'i' or 'a' in the terminal to open in iOS or Android simulator

## Project Structure

- `/assets` - Images, icons and other static assets
- `/src` - Source code
  - `/components` - Reusable UI components
  - `/context` - React Context providers (Auth, Theme)
  - `/hooks` - Custom React hooks
  - `/screens` - Screen components
  - `/utils` - Helper functions and utilities
  - `/api` - API service functions

## Features to Add

- Connect to Apple HealthKit/Google Fit for health data
- Implement financial account connections
- Enhance emotion detection accuracy
- Add more personalized insights
- Build offline support

## License

This project is licensed under the MIT License.