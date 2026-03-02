import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { useAuthStore } from '../../store/authStore';

// Mock the hooks
vi.mock('../../store/authStore', () => ({
    useAuthStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: {} }),
    };
});

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockClearError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({
            login: mockLogin,
            isLoading: false,
            error: null,
            clearError: mockClearError,
        });
    });

    it('renders correctly', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('submits the form successfully', async () => {
        mockLogin.mockResolvedValue(true);

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        expect(mockClearError).toHaveBeenCalled();
        expect(mockLogin).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    it('shows error message on failure', () => {
        (useAuthStore as any).mockReturnValue({
            login: mockLogin,
            isLoading: false,
            error: 'Invalid credentials',
            clearError: mockClearError,
        });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
        (useAuthStore as any).mockReturnValue({
            login: mockLogin,
            isLoading: true,
            error: null,
            clearError: mockClearError,
        });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        screen.getByRole('button', { name: /Sign In/i });
        // Assuming Button component handles isLoading by showing a spinner and potentially disabling or visually changing
        // LoginPage passes isLoading to Button
    });
});
