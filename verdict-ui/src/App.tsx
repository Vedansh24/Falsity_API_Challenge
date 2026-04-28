import { useState } from 'react';

function App() {
  const [claimId, setClaimId] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVerdict = async () => {
    console.log('Button clicked');
    console.log('claimId:', claimId, 'token:', token ? 'provided' : 'missing');
    
    if (!claimId.trim() || !token.trim()) {
      const errorMsg = 'Please provide both JWT Token and Claim ID';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = `http://localhost:3000/api/v1/claims/${claimId}/verdict`;
      console.log('Fetching from:', url);
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (!res.ok) {
        setError(`API Error: ${data.error || res.statusText}`);
        return;
      }

      setResult(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h2>Verdict Engine UI</h2>

      <input
        placeholder="Enter JWT Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '300px' }}
      />

      <input
        placeholder="Enter Claim ID"
        value={claimId}
        onChange={(e) => setClaimId(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '300px' }}
      />

      <button onClick={getVerdict} disabled={loading} style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Loading...' : 'Get Verdict'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', background: '#991b1b', padding: '20px', color: '#fca5a5' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', background: '#1e293b', padding: '20px', color: 'white' }}>
          <h3>Result:</h3>
          <pre style={{ background: '#0f172a', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;