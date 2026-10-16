import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute — Admin-only route guard.
 *
 * While auth state is being determined (loading), renders a full-screen
 * spinner so no child components mount and no API calls fire prematurely.
 *
 * Once resolved:
 *  - isAdmin === true  → renders children normally
 *  - isAdmin === false → redirects to "/" with replace (no history entry)
 */
export function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.screen} aria-label="Loading…">
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const styles = {
  screen: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fdf6ec',
    zIndex: 9999,
  },
  spinner: {
    width: 44,
    height: 44,
    border: '4px solid #f0ddb8',
    borderTopColor: '#a06e18',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Inject the keyframe once so the spinner animates without needing a CSS file
if (typeof document !== 'undefined') {
  const styleId = '__protected-route-spin__';
  if (!document.getElementById(styleId)) {
    const tag = document.createElement('style');
    tag.id = styleId;
    tag.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(tag);
  }
}
