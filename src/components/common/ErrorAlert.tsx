import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="error-banner" role="alert">
      <AlertTriangle size={20} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <strong>Analysis Notice: </strong>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            color: 'inherit',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
};
