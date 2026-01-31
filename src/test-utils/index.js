/**
 * Test Utilities for Design Thinking Portal
 * 
 * Common test helpers and mocks - NOT a test file itself
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
};

// Mock project data
export const mockProject = {
  id: 'test-project-id',
  title: 'Campus Navigation App',
  description: 'Help students navigate campus more easily',
  target_users: 'University students',
  template_id: 'campus',
  created_at: new Date().toISOString(),
};

// Mock deliverables
export const mockDeliverables = {
  Empathise: {
    interview_notes: {
      id: 'del-1',
      content: { notes: 'User mentioned getting lost often' },
    },
  },
};

// Router wrapper for testing
export const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Custom render with router
export const renderWithRouter = (ui, options) => {
  return render(ui, { wrapper: RouterWrapper, ...options });
};

// Wait utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
