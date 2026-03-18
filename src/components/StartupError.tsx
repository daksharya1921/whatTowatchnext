import { AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

interface StartupErrorProps {
  message?: string;
  error?: Error;
}

export default function StartupError({ message, error }: StartupErrorProps) {
  const isMissingEnv = message?.includes('VITE_SUPABASE') || error?.message?.includes('supabaseUrl is required');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      color: '#ffffff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '450px', 
        width: '100%',
        backgroundColor: '#141414',
        border: '1px solid #333333',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          backgroundColor: 'rgba(229, 9, 20, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <AlertCircle style={{ color: '#e50914', width: '32px', height: '32px' }} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
          Initialization Error
        </h1>
        
        <p style={{ color: '#b3b3b3', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
          {isMissingEnv 
            ? "It looks like some required configuration is missing. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY)."
            : (message || error?.message || "Something went wrong while starting the application.")
          }
        </p>

        {error && (
          <pre style={{ 
            backgroundColor: '#000000', 
            padding: '12px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            color: '#888', 
            textAlign: 'left',
            overflowX: 'auto',
            marginBottom: '24px',
            border: '1px solid #222'
          }}>
            <code>{error.stack || error.message}</code>
          </pre>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              backgroundColor: '#e50914', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#888', 
              fontSize: '13px', 
              textDecoration: 'none',
              marginTop: '8px'
            }}
          >
            Open Vercel Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
