import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { AuthProvider } from '../context/AuthProvider';

describe('Authentication Flow', () => {
  it('logs in and redirects to dashboard', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'password');

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/storage settings/i)).toBeInTheDocument();
  });
});
