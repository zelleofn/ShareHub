import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthProvider';
import axios from './api';
import '@testing-library/jest-dom';
import type { Mocked } from 'jest-mock';

const mockedAxios = axios as Mocked<typeof axios>;

jest.mock('../services/api');

const renderLogin = () =>
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );

describe('Login Component', () => {
  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('submits login form', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { token: 'abc', user: { email: 'test@test.com' } },
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), '123456');

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(axios.post).toHaveBeenCalledWith('/auth/login', expect.any(Object));
  });
});
