import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPERATIONS, OPERATOR_STORAGE_KEY } from '../constants';
import Header from '../components/Header';
import WelcomeSection from '../components/WelcomeSection';
import RecordsCount from '../components/RecordsCount';
import OperationMiniStatus from '../components/OperationMiniStatus';
import { databaseService } from '../services/DatabaseService';

const HomeScreen = () => {
  const operatorName = localStorage.getItem(OPERATOR_STORAGE_KEY) || 'Оператор';
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    hasIssues: 0
  });
  
  const navigate = useNavigate();

  const calculateMetrics = useCallback((blocks) => {
    const result = {
      total: blocks.length,
      inProgress: 0,
      completed: 0,
      hasIssues: 0
    };

    blocks.forEach(block => {
      if (!block.operations || block.operations.length === 0) {
        result.inProgress++;
        return;
      }

      const lastOp = block.operations[block.operations.length - 1];
      const hasAllOperations = block.operations.length === OPERATIONS.length;
      
      if (!lastOp.success) {
        result.hasIssues++;
      } else if (hasAllOperations && !block.operations.some(op => !op.success)) {
        result.completed++;
      } else {
        result.inProgress++;
      }
    });

    return result;
  }, []);

  const loadData = useCallback(async () => {
    try {
      const blocks = await databaseService.getAllBlocks();
      
      // Сортируем блоки по дате, самые новые первыми
      const sortedBlocks = blocks.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      // Получаем 4 последних блока (новые сверху)
      const recentOnes = sortedBlocks.slice(0, 4);
      setRecentBlocks(recentOnes);

      // Вычисляем метрики для всех блоков
      const updatedMetrics = calculateMetrics(sortedBlocks);
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  }, [calculateMetrics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const blockItemStyle = {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    left: 0
  };

  const blockItemHoverStyle = {
    backgroundColor: '#e0e0e0',
    left: '4px'
  };

  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{ padding: '16px' }}>
      <Header title="Главная" />
      
      <WelcomeSection operatorName={operatorName} />
      
      <div style={{ marginBottom: '24px' }}>
        <RecordsCount {...metrics} />
      </div>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Последние блоки</h3>
        
        {recentBlocks.length > 0 ? (
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {recentBlocks.map(block => (
              <div
                key={block.id}
                onClick={() => navigate(`/block/${block.id}`)}
                onMouseEnter={() => setHoveredId(block.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...blockItemStyle,
                  ...(hoveredId === block.id ? blockItemHoverStyle : {})
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ margin: 0 }}>
                    Блок #{block.blockNumber}
                  </h4>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {new Date(block.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '8px',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <strong>Тип:</strong> {block.modelType}
                  </div>
                  <div>
                    <strong>Модем:</strong> {block.modemType}
                  </div>
                  <div>
                    <strong>MAC:</strong> {block.macAddress || 'Не указан'}
                  </div>
                </div>

                <OperationMiniStatus operations={block.operations || []} status={
                  block.operations && block.operations.length
                    ? block.operations.some(op => !op.success)
                      ? 'error'
                      : (block.operations.length === OPERATIONS.length
                        ? 'completed'
                        : 'in_progress')
                    : 'in_progress'
                } />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>
            Нет доступных блоков
          </p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;