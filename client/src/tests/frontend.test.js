import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import Dashboard from '../components/Dashboard/Dashboard';
import ExeatForm from '../components/Exeat/ExeatForm';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper function to wrap components with necessary providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Test Login Component
describe('Login Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    axios.post.mockReset();
  });

  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    axios.post.mockResolvedValueOnce({
      data: { 
        token: 'test-token',
        user: {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'student'
        }
      }
    });

    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'john@example.com',
        password: 'password123'
      });
    });
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });
  });
});

// Test Registration Component
describe('Register Component', () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  test('renders registration form', () => {
    renderWithProviders(<Register />);
    
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('handles student registration', async () => {
    axios.post.mockResolvedValueOnce({
      data: { 
        token: 'test-token',
        user: {
          _id: '1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          role: 'student'
        }
      }
    });

    renderWithProviders(<Register />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Jane' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: 'Doe' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'jane@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Select student role
    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.change(roleSelect, { target: { value: 'student' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });
  });
});

// Test Dashboard Component
describe('Dashboard Component', () => {
  beforeEach(() => {
    axios.get.mockReset();
    
    // Mock authenticated user
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', JSON.stringify({
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student'
    }));
  });

  test('renders student dashboard', async () => {
    axios.get.mockResolvedValueOnce({
      data: [] // Empty exeat requests
    });

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/no exeat requests found/i)).toBeInTheDocument();
    });
  });

  test('displays exeat requests if they exist', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: 'exeat1',
          reason: 'Family emergency',
          destination: 'Home',
          departureDate: '2023-05-10T00:00:00.000Z',
          returnDate: '2023-05-15T00:00:00.000Z',
          status: 'pending_parent'
        }
      ]
    });

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/family emergency/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/pending parent approval/i)).toBeInTheDocument();
    });
  });
});

// Test Exeat Form Component
describe('Exeat Form Component', () => {
  beforeEach(() => {
    axios.post.mockReset();
    
    // Mock authenticated user
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', JSON.stringify({
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student'
    }));
  });

  test('renders exeat request form', () => {
    renderWithProviders(<ExeatForm />);
    
    expect(screen.getByLabelText(/reason for exeat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/return date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emergency contact name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        _id: 'new-exeat-id',
        status: 'pending_parent'
      }
    });

    renderWithProviders(<ExeatForm />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/reason for exeat/i), {
      target: { value: 'Medical appointment' }
    });
    
    fireEvent.change(screen.getByLabelText(/destination/i), {
      target: { value: 'Hospital' }
    });
    
    fireEvent.change(screen.getByLabelText(/departure date/i), {
      target: { value: '2023-05-20' }
    });
    
    fireEvent.change(screen.getByLabelText(/return date/i), {
      target: { value: '2023-05-22' }
    });
    
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Parent Name' }
    });
    
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '1234567890' }
    });
    
    fireEvent.change(screen.getByLabelText(/relationship/i), {
      target: { value: 'Parent' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(axios.post.mock.calls[0][0]).toBe('/api/exeat');
    });
    
    await waitFor(() => {
      expect(axios.post.mock.calls[0][1]).toMatchObject({
        reason: 'Medical appointment',
        destination: 'Hospital',
        emergencyContact: {
          name: 'Parent Name',
          phone: '1234567890',
          relationship: 'Parent'
        }
      });
    });
  });
}); 