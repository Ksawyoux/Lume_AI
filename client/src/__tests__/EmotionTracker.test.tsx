
import { render, screen, fireEvent } from '@testing-library/react';
import EmotionTracker from '../components/EmotionTracker';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('EmotionTracker', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('renders emotion tracking options', () => {
    render(<EmotionTracker />, { wrapper });
    expect(screen.getByText(/How are you feeling/i)).toBeInTheDocument();
  });
});
