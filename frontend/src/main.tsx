import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', color: '#FF6B7A', background: '#08090B', minHeight: '100vh' }}>
          <div style={{ fontSize: 12, color: '#8B95A7', marginBottom: 8 }}>RUNTIME ERROR</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>{(this.state.error as Error).message}</div>
          <pre style={{ fontSize: 11, color: '#57606a', whiteSpace: 'pre-wrap' }}>{(this.state.error as Error).stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
