import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databaseService } from '../services/DatabaseService';
import OperationStatusBar from '../components/OperationStatusBar';
import Header from '../components/Header';
import { OPERATIONS, OPERATOR_STORAGE_KEY } from '../constants';

const BlockScreen = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newOperation, setNewOperation] = useState({
    name: OPERATIONS[0],
    success: true
  });
  const [addOpError, setAddOpError] = useState('');

  const loadBlockData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getBlockById(blockId);
      setBlock(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    loadBlockData();
  }, [loadBlockData]);

  // Защита от null block (пока идет загрузка или блок не найден)
  if (isLoading) {
    return (
      <div className="block-screen">
        <Header title="Блок" onBack={() => navigate('/')} />
        <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
          Загрузка данных блока...
        </div>
      </div>
    );
  }
  if (!block) {
    return (
      <div className="block-screen">
        <Header title="Блок" onBack={() => navigate('/')} />
        <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
          Блок не найден
        </div>
      </div>
    );
  }

  const successfulOps = block.operations?.filter(op => op.success).length || 0;
  const failedOps = block.operations?.filter(op => op.success === false).length || 0;

  // Добавление операции с сохранением имени пользователя в сам объект операции
  const handleAddOperation = async (e) => {
    e.preventDefault();
    setAddOpError('');
    try {
      const currentOperator = localStorage.getItem(OPERATOR_STORAGE_KEY) || 'Неизвестный оператор';
      const updatedOperations = [
        ...(Array.isArray(block.operations) ? block.operations : []),
        {
          name: newOperation.name,
          success: newOperation.success,
          timestamp: new Date().toISOString(),
          executor: currentOperator // имя пользователя сохраняется в операции
        }
      ];
      // ВАЖНО: сохраняем операции именно в поле operations, чтобы они попадали в базу
      await databaseService.updateBlock(block.id, {
        ...block,
        operations: updatedOperations
      });
      // После обновления блока, перезагрузим его из базы, чтобы гарантировать консистентность
      const updatedBlock = await databaseService.getBlockById(block.id);
      setBlock(updatedBlock);
      setNewOperation({ name: OPERATIONS[0], success: true });
    } catch (err) {
      setAddOpError('Ошибка при добавлении операции: ' + (err.message || ''));
    }
  };

  const calculateOperationCount = (block) => {
    return block.operations?.length || 0;
  };

  return (
    <>
      {/* Кнопка "На главную" фиксирована в углу страницы, вне .block-screen */}
      <button
        onClick={() => navigate('/')}
        className="back-to-home-btn-global"
        aria-label="На главную"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span>На главную</span>
      </button>

      <div className="block-screen">
        <Header 
          title={`Блок №${block.blockNumber || block.id}`}
          onBack={() => navigate('/')}
          showBackToHome={false}
        />

        {/* --- Блок общей статистики по операциям --- */}
        <div style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.07)',
          padding: 24,
          marginBottom: 24,
          display: 'flex',
          gap: 32,
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          <div style={{ minWidth: 120 }}>
            <div style={{ color: '#888', fontSize: 14 }}>Количество операций</div>
            <div style={{ fontWeight: 600, fontSize: 24 }}>
              {block ? calculateOperationCount(block) : 0}
            </div>
          </div>
          <div style={{ minWidth: 120 }}>
            <div style={{ color: '#888', fontSize: 14 }}>Успешных операций</div>
            <div style={{ fontWeight: 600, fontSize: 24, color: '#16a34a' }}>{successfulOps}</div>
          </div>
          <div style={{ minWidth: 120 }}>
            <div style={{ color: '#888', fontSize: 14 }}>Неудачных операций</div>
            <div style={{ fontWeight: 600, fontSize: 24, color: '#dc2626' }}>{failedOps}</div>
          </div>
        </div>
        {/* --- Конец блока статистики --- */}

        <div className="block-info">
          <div className="info-row">
            <div className="info-item">
              <label>Дата:</label>
              <span>{new Date(block.date).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Оператор:</label>
              <span>{block.operator}</span>
            </div>
            <div className="info-item">
              <label>Модель:</label>
              <span>{block.modelType}</span>
            </div>
            <div className="info-item">
              <label>Серийный номер:</label>
              <span>{block.serialNumber || block.macAddress || 'Не указан'}</span>
            </div>
          </div>

          {block.comments && (
            <div className="comments-section">
              <h3>Комментарии</h3>
              <p>{block.comments}</p>
            </div>
          )}
        </div>

        <div className="operations-section">
          <h3>Операции</h3>
          <OperationStatusBar operations={block.operations} total={block.totalOperations} />
          {/* --- ДОБАВЛЕНИЕ ОПЕРАЦИИ --- */}
          <form onSubmit={handleAddOperation} style={{ margin: '16px 0', background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label>
                Операция:
                <select
                  value={newOperation.name}
                  onChange={e => setNewOperation(op => ({ ...op, name: e.target.value }))}
                  style={{ marginLeft: 8 }}
                >
                  {OPERATIONS.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </label>
              <label>
                Статус:
                <select
                  value={newOperation.success ? 'success' : 'fail'}
                  onChange={e => setNewOperation(op => ({ ...op, success: e.target.value === 'success' }))}
                  style={{ marginLeft: 8 }}
                >
                  <option value="success">Успешно</option>
                  <option value="fail">Ошибка</option>
                </select>
              </label>
              <button type="submit" style={{ marginLeft: 8, background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
                Добавить операцию
              </button>
            </div>
            {addOpError && <div style={{ color: '#c62828', marginTop: 8 }}>{addOpError}</div>}
          </form>
          {/* --- КОНЕЦ ДОБАВЛЕНИЯ ОПЕРАЦИИ --- */}
          <div className="operations-list">
            {Array.isArray(block.operations) &&
              [...block.operations].reverse().map((operation, index) => (
                <div 
                  key={index} 
                  className={`operation-item ${operation.success ? 'success' : 'error'}`}
                >
                  <div className="operation-header">
                    <span className="operation-name">{operation.name}</span>
                    <span className="operation-status">
                      {operation.success ? 'Успешно' : 'Ошибка'}
                    </span>
                  </div>
                  <div className="operation-time">
                    {operation.timestamp ? new Date(operation.timestamp).toLocaleTimeString() : ''}
                  </div>
                  <div className="operation-executor" style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                    Пользователь: {operation.executor || 'Неизвестно'}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <style jsx>{`
          .block-screen {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
          }
          .back-to-home-btn-global {
            position: fixed;
            top: 18px;
            left: 18px;
            display: flex;
            align-items: center;
            gap: 6px;
            background: #f3f6fd;
            color: #2563eb;
            border: none;
            border-radius: 8px;
            padding: 8px 16px 8px 10px;
            font-size: 15px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(37,99,235,0.07);
            cursor: pointer;
            transition: background 0.18s, box-shadow 0.18s, color 0.18s;
            z-index: 2000;
          }
          .back-to-home-btn-global:hover, .back-to-home-btn-global:focus {
            background: #e0eaff;
            color: #1746a2;
            box-shadow: 0 4px 16px rgba(37,99,235,0.12);
          }
          .back-to-home-btn-global svg {
            display: block;
          }

          .block-info {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .info-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .info-item {
            display: flex;
            flex-direction: column;
          }

          .info-item label {
            font-weight: 500;
            color: #666;
            margin-bottom: 4px;
          }

          .comments-section {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 20px;
          }

          .operations-section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .operations-list {
            margin-top: 20px;
            display: grid;
            gap: 16px;
          }

          .operation-item {
            border: 1px solid #eee;
            border-radius: 6px;
            padding: 16px;
          }

          .operation-item.success {
            border-left: 4px solid #4caf50;
          }

          .operation-item.error {
            border-left: 4px solid #f44336;
          }

          .operation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .operation-name {
            font-weight: 500;
          }

          .operation-status {
            font-size: 14px;
            padding: 4px 8px;
            border-radius: 4px;
          }

          .success .operation-status {
            background: #e8f5e9;
            color: #2e7d32;
          }

          .error .operation-status {
            background: #ffebee;
            color: #c62828;
          }

          .operation-result {
            font-size: 14px;
            color: #666;
            margin: 8px 0;
          }

          .operation-time {
            font-size: 12px;
            color: #999;
          }
        `}</style>
      </div>
    </>
  );
};

export default BlockScreen;
