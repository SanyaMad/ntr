import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import Header from '../components/Header';
import { databaseService } from '../services/DatabaseService';

const HistoryScreen = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [data, blocksData] = await Promise.all([
        databaseService.getOperationsStats(dateRange.start, dateRange.end),
        databaseService.getAllBlocks()
      ]);
      setStats(data);
      setBlocks(blocksData);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      alert('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const prepareOperationsData = () => {
    if (!stats?.operations) return [];
    return Object.entries(stats.operations).map(([name, data]) => ({
      name,
      успешно: data.successful,
      неудачно: data.failed,
      всего: data.total
    }));
  };

  const filteredBlocks = blocks.filter(block =>
    block.blockNumber.toString().includes(searchQuery)
  );

  return (
    <div style={{ padding: '16px' }}>
      <Header title="Статистика" onBack={() => navigate('/')} />
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label>Начальная дата:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label>Конечная дата:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        {loading ? (
          <div>Загрузка статистики...</div>
        ) : stats ? (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h3>Общая статистика</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="stat-card">
                  <h4>Всего блоков</h4>
                  <div className="stat-value">{stats.totalBlocks ?? blocks.length}</div>
                </div>
                <div className="stat-card">
                  <h4>Успешных операций</h4>
                  <div className="stat-value">{stats.successful ?? blocks.reduce((acc, b) => acc + (b.operations?.filter(op => op.success).length || 0), 0)}</div>
                </div>
                <div className="stat-card">
                  <h4>Неудачных операций</h4>
                  <div className="stat-value">{stats.failed ?? blocks.reduce((acc, b) => acc + (b.operations?.filter(op => op.success === false).length || 0), 0)}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3>Статистика по операциям</h3>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer>
                  <BarChart data={prepareOperationsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="успешно" fill="#4CAF50" stackId="a" />
                    <Bar dataKey="неудачно" fill="#f44336" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div>Нет данных для отображения</div>
        )}
      </div>

      {/* Список всех добавленных блоков */}
      <div style={{ marginTop: '32px' }}>
        <h3>Все добавленные блоки</h3>
        <input
          type="text"
          placeholder="Поиск по номеру блока"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginBottom: '16px',
            padding: '8px',
            width: '100%',
            maxWidth: '300px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <div style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}>
          {filteredBlocks.map(block => (
            <div
              key={block.id}
              onClick={() => navigate(`/block/${block.id}`)}
              style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h4>Блок #{block.blockNumber}</h4>
              <p>Дата: {new Date(block.date).toLocaleDateString()}</p>
              <p>Оператор: {block.operator || 'Неизвестно'}</p>
              <p>Модель: {block.modelType}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;
