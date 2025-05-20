import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODEL_TYPES, MODEM_TYPES, EXECUTION_TYPES, BLOCK_TYPES, OPERATOR_STORAGE_KEY } from '../constants';
import Header from '../components/Header';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { databaseService } from '../services/DatabaseService';

const toOptions = arr => arr.map(item => ({ label: item, value: item }));

const NewRecord = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    modelType: MODEL_TYPES[0],
    modemType: MODEM_TYPES[0],
    blockNumber: '',
    blockType: BLOCK_TYPES[0],
    executionType: EXECUTION_TYPES[0],
    macAddress: '',
    modemNumber: '',
    radioNumber: '',
    firmwareNumber: '',
    serialNumber: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Универсальный обработчик для Select (работает и с объектом, и с event)
  const handleSelectChange = (field) => (optionOrEvent) => {
    if (optionOrEvent && optionOrEvent.value !== undefined) {
      handleInputChange(field, optionOrEvent.value);
    } else if (optionOrEvent && optionOrEvent.target) {
      handleInputChange(field, optionOrEvent.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Простая валидация
    if (!formData.blockNumber) {
      setError('Поле "Номер блока" обязательно для заполнения');
      return;
    }
    try {
      const currentOperator = localStorage.getItem(OPERATOR_STORAGE_KEY) || 'Неизвестный оператор';
      const newRecord = {
        ...formData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        operator: currentOperator,
        operations: [
          // Если хотите добавить первую операцию при создании блока:
          // {
          //   name: 'Создание',
          //   success: true,
          //   timestamp: new Date().toISOString(),
          //   executor: currentOperator
          // }
        ]
      };

      const savedBlock = await databaseService.addBlock(newRecord);
      navigate(`/block/${savedBlock.id}`);
    } catch (err) {
      setError(err.message || 'Произошла ошибка при создании записи. Пожалуйста, попробуйте снова.');
      console.error('Ошибка при создании записи:', err);
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <Header title="Новая запись" onBack={() => navigate(-1)} />
      
      <form onSubmit={handleSubmit} style={{ 
        display: 'grid', 
        gap: '16px',
        backgroundColor: '#f5f5f5',
        padding: '24px',
        borderRadius: '8px',
        marginTop: '16px'
      }}>
        {error && (
          <div style={{
            color: '#c62828',
            background: '#ffebee',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            {error}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Select
            label="Тип модели"
            value={toOptions(MODEL_TYPES).find(opt => opt.value === formData.modelType)}
            onChange={handleSelectChange('modelType')}
            options={toOptions(MODEL_TYPES)}
            required
          />

          <Select
            label="Тип модема"
            value={toOptions(MODEM_TYPES).find(opt => opt.value === formData.modemType)}
            onChange={handleSelectChange('modemType')}
            options={toOptions(MODEM_TYPES)}
            required
          />

          <Input
            label="Номер блока"
            value={formData.blockNumber}
            onChange={e => handleInputChange('blockNumber', e.target.value)}
            placeholder="Введите номер блока"
            required
          />

          <Select
            label="Тип блока"
            value={toOptions(BLOCK_TYPES).find(opt => opt.value === formData.blockType)}
            onChange={handleSelectChange('blockType')}
            options={toOptions(BLOCK_TYPES)}
            required
          />

          <Select
            label="Вид исполнения"
            value={toOptions(EXECUTION_TYPES).find(opt => opt.value === formData.executionType)}
            onChange={handleSelectChange('executionType')}
            options={toOptions(EXECUTION_TYPES)}
            required
          />

          <Input
            label="MAC-адрес"
            value={formData.macAddress}
            onChange={e => handleInputChange('macAddress', e.target.value)}
            placeholder="XX:XX:XX:XX:XX:XX"
          />

          <Input
            label="Номер модема"
            value={formData.modemNumber}
            onChange={e => handleInputChange('modemNumber', e.target.value)}
            placeholder="Введите номер модема"
          />

          <Input
            label="Номер радио"
            value={formData.radioNumber}
            onChange={e => handleInputChange('radioNumber', e.target.value)}
            placeholder="Введите номер радио"
          />

          <Input
            label="Номер прошивки"
            value={formData.firmwareNumber}
            onChange={e => handleInputChange('firmwareNumber', e.target.value)}
            placeholder="Введите номер прошивки"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <Button 
            title="Отмена"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd'
            }}
          />
          <Button 
            title="Создать запись"
            onClick={handleSubmit}
            style={{
              backgroundColor: '#2196F3',
              color: 'white'
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default NewRecord;