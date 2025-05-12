import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders register heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /register/i });

  expect(heading).toBeInTheDocument();
});
