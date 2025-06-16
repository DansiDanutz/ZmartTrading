import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
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
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'documentation':
        return <Documentation />;
      default:
        return <div className="p-8 text-xl">This page is under development.</div>;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar setCurrentPage={setCurrentPage} />
        <main style={{ flex: 1 }}>
          {renderCurrentPage()}
        </main>
      </div>
    </ErrorBoundary>
  );
} 