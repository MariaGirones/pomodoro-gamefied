import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app title', () => {
  render(<App />);
  expect(screen.getByText(/NeuroStudy Quest/i)).toBeInTheDocument();
});

test('renders the welcome modal on first load', () => {
  render(<App />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});

test('renders start, pause and restart buttons', () => {
  render(<App />);
  expect(screen.getByText(/Start/i)).toBeInTheDocument();
  expect(screen.getByText(/Pause/i)).toBeInTheDocument();
  expect(screen.getByText(/Restart/i)).toBeInTheDocument();
});
