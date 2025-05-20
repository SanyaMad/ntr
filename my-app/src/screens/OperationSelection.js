import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STORAGE_KEY, OPERATIONS } from '../constants';
import Header from '../components/Header';
import Button from '../components/Button';

const OperationSelection = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const storedRecords = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const record = storedRecords.find(r => r.id === recordId);
  const [selectedOperations, setSelectedOperations] = useState(record?.operations || []);

  const toggleOperation = (operation) => {
    setSelectedOperations((prev) =>
      prev.some(op => op.name === operation.name)
        ? prev.filter(op => op.name !== operation.name)
        : [...prev, { name: operation.name, success: null }]
    );
  };

  const handleSave = () => {
    const updatedRecords = storedRecords.map(r =>
      r.id === recordId ? { ...r, operations: selectedOperations } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    navigate(-1);
  };

  if (!record) {
    return <p>Запись не найдена</p>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Header title="Выбор операций" onBack={() => navigate(-1)} />
      <div style={{ marginBottom: '16px' }}>
        {OPERATIONS.map((operation) => (
          <button
            key={operation}
            onClick={() => toggleOperation({ name: operation })}
            style={{
              padding: '8px 12px',
              marginRight: '8px',
              marginBottom: '8px',
              borderRadius: '8px',
              border: selectedOperations.some(op => op.name === operation) ? '2px solid green' : '1px solid #ccc',
              backgroundColor: selectedOperations.some(op => op.name === operation) ? 'green' : '#f0f0f0',
              color: selectedOperations.some(op => op.name === operation) ? '#fff' : '#000',
              cursor: 'pointer',
            }}
          >
            {operation}
          </button>
        ))}
      </div>
      <Button title="Сохранить" onPress={handleSave} />
    </div>
  );
};

export default OperationSelection;
