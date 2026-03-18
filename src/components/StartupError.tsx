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
          margin: '0 auto 24px',
          fontSize: '32px'
        }}>
          ⚠️
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
          Startup Issue
        </h1>
        
        <p style={{ color: '#b3b3b3', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
          {isMissingEnv 
            ? "Missing configuration (VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY). Please check your Vercel environment variables."
            : (message || error?.message || "An unexpected error occurred during application startup.")
          }
        </p>

        {error && (
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Error Details:</p>
            <pre style={{ 
              backgroundColor: '#000000', 
              padding: '12px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              color: '#888', 
              overflowX: 'auto',
              border: '1px solid #222',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <code>{error.stack || error.message}</code>
            </pre>
          </div>
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
              fontSize: '15px'
            }}
          >
            Retry Loading
          </button>
          
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#555', 
              fontSize: '12px', 
              textDecoration: 'none',
              marginTop: '8px'
            }}
          >
            Go to Vercel Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
