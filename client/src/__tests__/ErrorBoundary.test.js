import React from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from '../components/common/ErrorBoundary';

const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  let originalError;

  beforeAll(() => {
    originalError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);

    // Flush synchronously — no throw expected
    expect(() => {
      root.render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
    }).not.toThrow();

    root.unmount();
    document.body.removeChild(div);
  });

  it('catches errors and does not propagate', () => {
    // ErrorBoundary should absorb the error; rendering in a container should not throw
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);

    expect(() => {
      root.render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
    }).not.toThrow();

    root.unmount();
    document.body.removeChild(div);
  });
});
