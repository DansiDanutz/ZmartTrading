import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div role="alert" style={{ padding: '20px', color: 'red' }}>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <Dashboard />
      </Router>
    </ErrorBoundary>
  );
} 