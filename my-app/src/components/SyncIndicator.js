import { useEffect, useState } from 'react';

export default function SyncIndicator({ syncService }) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    setStatus('syncing');
    try {
      await syncService.synchronize();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  useEffect(() => {
    const interval = setInterval(handleSync, 30000); // каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    idle: 'gray',
    syncing: 'blue',
    success: 'green',
    error: 'red'
  };

  return (
    <div style={{ color: statusColor[status], fontWeight: 'bold' }}>
      Синхронизация: {status}
    </div>
  );
}
