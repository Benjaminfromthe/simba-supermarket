import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; isChunkError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: '', isChunkError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Detect stale PWA cache / chunk loading errors
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('Unable to preload CSS') ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading chunk');

    return { hasError: true, error: error.message, isChunkError };
  }

  componentDidCatch(error: Error) {
    // Auto-reload once for chunk errors — clears stale service worker cache
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('ChunkLoadError');

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('simba-chunk-reload');
      const now = Date.now();
      // Only auto-reload once per 30 seconds to avoid infinite loop
      if (!lastReload || now - parseInt(lastReload) > 30000) {
        sessionStorage.setItem('simba-chunk-reload', String(now));
        // Clear all caches then reload
        if ('caches' in window) {
          caches.keys().then(keys => {
            Promise.all(keys.map(k => caches.delete(k))).then(() => {
              window.location.reload();
            });
          });
        } else {
          window.location.reload();
        }
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        // Show a friendly update message instead of the error
        return (
          <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
            <h1 style={{ color: '#F47A3E', marginBottom: 8 }}>New version available!</h1>
            <p style={{ color: '#666', marginBottom: 24, maxWidth: 400 }}>
              Simba has been updated. Click below to load the latest version.
            </p>
            <button
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then(keys => {
                    Promise.all(keys.map(k => caches.delete(k))).then(() => window.location.reload());
                  });
                } else {
                  window.location.reload();
                }
              }}
              style={{ background: '#F47A3E', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}
            >
              Update & Reload
            </button>
          </div>
        );
      }

      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
          <h1 style={{ color: '#F47A3E' }}>Simba — Something went wrong</h1>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {this.state.error}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, background: '#F47A3E', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
