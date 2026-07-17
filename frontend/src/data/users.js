export const ADMIN_CREDENTIALS = {
  email: 'admin@siritextiles.com',
  password: 'admin123',
  role: 'admin',
  name: 'Admin User',
};

export const mockCustomers = [
  { id: 1, name: 'Priya Sharma', email: 'priya@example.com', orders: 5, spent: 28999, joined: '2023-06-15', status: 'Active' },
  { id: 2, name: 'Anjali Verma', email: 'anjali@example.com', orders: 3, spent: 14999, joined: '2023-08-20', status: 'Active' },
  { id: 3, name: 'Neha Reddy', email: 'neha@example.com', orders: 7, spent: 45999, joined: '2023-04-10', status: 'Active' },
  { id: 4, name: 'Kavitha Nair', email: 'kavitha@example.com', orders: 2, spent: 9999, joined: '2023-11-05', status: 'Inactive' },
  { id: 5, name: 'Meera Iyer', email: 'meera@example.com', orders: 4, spent: 32999, joined: '2023-07-25', status: 'Active' },
  { id: 6, name: 'Sunita Gupta', email: 'sunita@example.com', orders: 1, spent: 3799, joined: '2024-01-10', status: 'Active' },
];

export const AUTH_KEY = 'siri_auth_user';

export const saveUser = (user) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const getUser = () => {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem(AUTH_KEY);
};
