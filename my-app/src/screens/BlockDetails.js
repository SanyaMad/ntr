import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OPERATIONS } from '../constants';
import Header from '../components/Header';
import formatDate from '../utils/formatDate';
import OperationStatusModal from '../components/OperationStatusModal';
import OperationStatusBar from '../components/OperationStatusBar';
import QuickActionButton from '../components/QuickActionButton';
import { databaseService } from '../services/DatabaseService';

const BlockDetails = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [operations, setOperations] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlock();
  }, [blockId]);

  const loadBlock = async () => {
    try {
      const blocks = await databaseService.getAllBlocks();
      const foundBlock = blocks.find((b) => b.id === blockId);
      if (foundBlock) {
        setBlock(foundBlock);
        setOperations(foundBlock.operations || []);
      }
    } catch (error) {
      console.error('Ошибка при загрузке блока:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperation = (operationName) => {
    setSelectedOperation(operationName);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (status, details) => {
    try {
      const currentOperator = localStorage.getItem('currentOperator') || 'Неизвестный оператор';
      const newOperation = {
        name: selectedOperation,
        success: status,
        executor: currentOperator,
        comment: details.comment,
        duration: details.duration,
        errorCode: details.errorCode,
        errorDescription: details.errorDescription,
        timestamp: new Date().toISOString()
      };

      const updatedOperations = [...operations, newOperation];
      const updatedBlock = { ...block, operations: updatedOperations };
      
      await databaseService.updateBlock(blockId, updatedBlock);
      setBlock(updatedBlock);
      setOperations(updatedOperations);
      
      setIsStatusModalOpen(false);
      setSelectedOperation(null);
    } catch (error) {
      console.error('Ошибка при сохранении операции:', error);
      alert('Не удалось сохранить операцию');
    }
  };

  const handleStatusBarClick = (operationName) => {
    setSelectedOperation(operationName);
    setIsStatusModalOpen(true);
  };

  const handleQuickAction = (operationName) => {
    setSelectedOperation(operationName);
    setIsStatusModalOpen(true);
  };

  const getCurrentOperation = (operations) => {
    const lastOperation = operations[operations.length - 1];
    return lastOperation ? lastOperation.name : 'Нет текущей операции';
  };

  const getBlockStatus = (operations) => {
    const lastOperation = operations[operations.length - 1];
    return lastOperation ? (lastOperation.success ? 'Успешно' : 'Неуспешно') : 'Статус неизвестен';
  };

  const getOperationIcon = (operation) => {
    const icons = {
      'Прошивка': '📱',
      'Тестирование': '🔧',
      'Настройка': '⚙️',
      'Проверка': '✅',
      'Упаковка': '📦',
      'default': '🔄'
    };
    return icons[operation] || icons.default;
  };

  const getOperationColor = (operation) => {
    const colors = {
      'Прошивка': '#9C27B0',
      'Тестирование': '#FF9800',
      'Настройка': '#2196F3',
      'Проверка': '#4CAF50',
      'Упаковка': '#607D8B',
      'default': '#2196F3'
    };
    return colors[operation] || colors.default;
  };

  const isOperationInProgress = () => {
    return operations.some((operation) => !operation.success);
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (!block) {
    return <p>Блок не найден</p>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Header title="Детали блока" onBack={() => navigate(-1)} />
      
      <OperationStatusBar 
        operations={operations}
        onStatusClick={handleStatusBarClick}
      />

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {OPERATIONS.map((op) => (
          <QuickActionButton
            key={op}
            icon={getOperationIcon(op)}
            label={op}
            onClick={() => handleQuickAction(op)}
            color={getOperationColor(op)}
            disabled={isOperationInProgress()}
          />
        ))}
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '12px' }}>Информация о блоке</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { label: 'Дата создания', value: formatDate(block.date) },
            { label: 'Тип модели', value: block.modelType },
            { label: 'Тип блока', value: block.modemType },
            { label: 'Номер блока', value: block.blockNumber },
            { label: 'Вид исполнения', value: block.executionType },
            { label: 'MAC-адрес', value: block.macAddress || 'Не указан' },
            { label: 'Номер модема', value: block.modemNumber || 'Не указан' },
            { label: 'Номер радио', value: block.radioNumber || 'Не указан' },
            { label: 'Номер прошивки', value: block.firmwareNumber || 'Не указан' },
            { label: 'Текущая операция', value: getCurrentOperation(operations) },
            { label: 'Статус', value: getBlockStatus(operations) }
          ].map((item, index) => (
            <div key={index} className="info-row">
              <div className="info-label">{item.label}:</div>
              <div className="info-value">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h3>Выбор операций</h3>
        <div style={{ marginBottom: '16px' }}>
          {OPERATIONS.map((operation) => (
            <button
              key={operation}
              onClick={() => handleAddOperation(operation)}
              style={{
                padding: '8px 12px',
                marginRight: '8px',
                marginBottom: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                color: '#000',
                cursor: 'pointer',
              }}
            >
              {operation}
            </button>
          ))}
        </div>
        <h3>Операции</h3>
        {operations.length > 0 ? (
          operations.map((operation, index) => (
            <div
              key={index}
              style={{
                border: `2px solid ${operation.success ? 'green' : 'red'}`,
                backgroundColor: operation.success ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                color: '#fff',
              }}
            >
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{operation.name}</p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '8px',
                margin: '8px 0',
                fontSize: '14px' 
              }}>
                <p style={{ margin: 0 }}>Дата: {operation.date || 'Не указана'}</p>
                <p style={{ margin: 0 }}>Исполнитель: {operation.executor || 'Не указан'}</p>
                {operation.duration && (
                  <p style={{ margin: 0 }}>
                    Длительность: {Math.floor(operation.duration / 60000)}м {Math.floor((operation.duration % 60000) / 1000)}с
                  </p>
                )}
                {!operation.success && operation.errorCode && (
                  <p style={{ margin: 0 }}>Код ошибки: {operation.errorCode}</p>
                )}
              </div>
              {operation.comment && (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px',
                  fontStyle: 'italic',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  Комментарий: {operation.comment}
                </p>
              )}
              {!operation.success && operation.errorDescription && (
                <p style={{ 
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  Описание проблемы: {operation.errorDescription}
                </p>
              )}
            </div>
          ))
        ) : (
          <p>Нет операций</p>
        )}
      </div>
      {isStatusModalOpen && (
        <OperationStatusModal
          isOpen={isStatusModalOpen}
          operation={selectedOperation}
          onClose={() => setIsStatusModalOpen(false)}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
};

export default BlockDetails;
