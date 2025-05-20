import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const VALIDATION_RULES = {
  blockNumber: {
    required: true,
    pattern: /^\d+$/,
    min: 1,
    max: 999999,
    message: 'Номер блока должен быть положительным числом'
  },
  modelVersion: {
    required: true,
    pattern: /^[0-9.]+$/,
    message: 'Версия модели должна быть в формате X.Y.Z'
  },
  operatorName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Имя оператора должно содержать от 2 до 50 символов'
  }
};

const EditRecordModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  record = {}, 
  availableOperators = [],
  availableModelVersions = [] 
}) => {
  const [formData, setFormData] = useState({
    blockNumber: '',
    modelVersion: '',
    operatorName: '',
    notes: '',
    ...record
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        blockNumber: '',
        modelVersion: '',
        operatorName: '',
        notes: '',
        ...record
      });
      setErrors({});
      setIsDirty(false);
      setIsSubmitting(false);
    }
  }, [isOpen, record]);

  const validateField = useCallback((name, value) => {
    if (!VALIDATION_RULES[name]) return '';

    const rule = VALIDATION_RULES[name];
    
    if (rule.required && !value) {
      return 'Это поле обязательно для заполнения';
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `Минимальная длина ${rule.minLength} символов`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Максимальная длина ${rule.maxLength} символов`;
    }

    if (name === 'blockNumber') {
      const num = parseInt(value, 10);
      if (num < rule.min || num > rule.max) {
        return `Значение должно быть между ${rule.min} и ${rule.max}`;
      }
    }

    return '';
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleChange = useCallback((field) => (e) => {
    const value = e?.target?.value ?? e;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setIsDirty(true);

    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Произошла ошибка при сохранении. Пожалуйста, попробуйте снова.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('Есть несохраненные изменения. Вы уверены, что хотите закрыть?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ 
          margin: '0 0 24px',
          color: 'var(--text-primary)'
        }}>
          {record.id ? 'Редактирование записи' : 'Новая запись'}
        </h2>

        <div style={{ marginBottom: '24px' }}>
          <Input
            label="Номер блока"
            type="number"
            value={formData.blockNumber}
            onChange={handleChange('blockNumber')}
            error={errors.blockNumber}
            required
            disabled={isSubmitting}
            min={1}
            max={999999}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Select
            label="Версия модели"
            value={formData.modelVersion}
            onChange={handleChange('modelVersion')}
            options={availableModelVersions.map(version => ({
              value: version,
              label: version
            }))}
            error={errors.modelVersion}
            required
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Select
            label="Оператор"
            value={formData.operatorName}
            onChange={handleChange('operatorName')}
            options={availableOperators.map(operator => ({
              value: operator.name,
              label: operator.name
            }))}
            error={errors.operatorName}
            required
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            label="Примечания"
            value={formData.notes}
            onChange={handleChange('notes')}
            multiline
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        {errors.submit && (
          <div style={{ 
            color: '#ff4d4f',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#fff2f0',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {errors.submit}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px'
        }}>
          <Button
            title="Отмена"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--text)'
            }}
          />
          <Button
            title={isSubmitting ? 'Сохранение...' : 'Сохранить'}
            onClick={handleSave}
            disabled={isSubmitting || (!isDirty && !record.id)}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              opacity: (isSubmitting || (!isDirty && !record.id)) ? 0.7 : 1
            }}
          />
        </div>
      </div>
    </div>
  );
};

EditRecordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  record: PropTypes.shape({
    id: PropTypes.string,
    blockNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modelVersion: PropTypes.string,
    operatorName: PropTypes.string,
    notes: PropTypes.string
  }),
  availableOperators: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired
    })
  ),
  availableModelVersions: PropTypes.arrayOf(PropTypes.string)
};

export default React.memo(EditRecordModal);
