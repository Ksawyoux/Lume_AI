# Lume Mobile App

**Lume** is a mobile-first fintech application that leverages emotional intelligence to provide personalized financial insights through advanced psychological-financial correlations.

## Features

- **Emotion Tracking**: Capture and analyze your emotional states through text, voice, and facial expressions
- **Financial Correlation**: See how your emotions influence your spending decisions
- **Health Integration**: Connects with Apple Watch and other health data to provide deeper insights
- **Personalized Insights**: AI-powered recommendations based on your unique emotional and financial patterns

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) (v8 or newer) or [Yarn](https://yarnpkg.com/) (v1.22 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app installed on your physical device (iOS or Android)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/lume-app.git
cd lume-app/mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add the following:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Running the App

### Start the Expo development server:

```bash
npx expo start
```

This will start the Metro Bundler and display a QR code in your terminal.

### Running on a physical device:

1. Open the Expo Go app on your iOS or Android device
2. Scan the QR code from the terminal:
   - iOS: Use the device's camera
   - Android: Scan from within the Expo Go app

### Running on a simulator/emulator:

- iOS Simulator: Press `i` in the terminal
- Android Emulator: Press `a` in the terminal (make sure your emulator is running)

## Development

### Project Structure

```
mobile/
├── app.json            # Expo configuration
├── App.tsx             # Main application entry point
├── assets/             # Static assets like images and fonts
├── app/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API and business logic services
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript type definitions
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

### Key Technologies

- React Native (with Expo)
- TypeScript
- Anthropic Claude API for emotion analysis
- React Navigation for screen navigation
- Expo Camera for facial analysis
- React Native Reanimated for animations
- React Native SVG for charts and visualizations

## Accessing Health Data

To access health data, you'll need to:

1. Request HealthKit permissions (iOS) or Google Fit permissions (Android)
2. Configure the permissions in the Expo app configuration
3. Use the Expo Health API to query health data

Example:
```typescript
import * as ExpoHealth from 'expo-health';

async function getHealthData() {
  // Request permissions
  const permissions = [
    ExpoHealth.PermissionKind.Steps,
    ExpoHealth.PermissionKind.HeartRate,
    ExpoHealth.PermissionKind.SleepAnalysis,
  ];
  
  await ExpoHealth.requestPermissionsAsync(permissions);
  
  // Get step count
  const steps = await ExpoHealth.getStepCountAsync(
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date()
  );
  
  return steps;
}
```

## Troubleshooting

### Common Issues:

1. **Dependency Conflicts**: If you encounter dependency conflicts, try:
   ```bash
   npm install --legacy-peer-deps
   # or
   yarn install --ignore-engines
   ```

2. **Expo SDK Version Mismatch**: Ensure your Expo Go app is updated to the latest version

3. **Metro Bundler Issues**: Try clearing the cache:
   ```bash
   npx expo start --clear
   ```

4. **API Key Issues**: Verify your Anthropic API key is correctly set in the `.env` file

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- WHOOP design system for UI inspiration
- Anthropic Claude for AI emotion analysis
- React Native community for components and libraries