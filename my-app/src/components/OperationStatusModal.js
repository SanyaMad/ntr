import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const ERROR_CODES = {
  E001: 'Неисправность оборудования',
  E002: 'Ошибка конфигурации',
  E003: 'Проблема с прошивкой',
  E004: 'Физическое повреждение',
  E005: 'Проблема с питанием',
  E006: 'Ошибка связи'
};

const OperationStatusModal = ({ isOpen, onClose, onSave, operation, initialData = {}, confirmationMode = false }) => {
  const [formData, setFormData] = useState({
    status: initialData.status ?? true,
    comment: initialData.comment ?? '',
    errorCode: initialData.errorCode ?? '',
    errorDescription: initialData.errorDescription ?? ''
  });
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      // Сброс формы при закрытии
      setFormData({
        status: true,
        comment: '',
        errorCode: '',
        errorDescription: ''
      });
      setValidationErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.status && !formData.errorCode) {
      errors.errorCode = 'Необходимо выбрать код ошибки';
    }
    
    if (!formData.status && !formData.errorDescription?.trim()) {
      errors.errorDescription = 'Необходимо описать проблему';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      // Сброс полей ошибок при смене статуса на успешный
      ...(newStatus && {
        errorCode: '',
        errorDescription: ''
      })
    }));
    setValidationErrors({});
  };

  const handleChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем ошибку валидации при изменении поля
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const duration = Date.now() - startTime;
      await onSave(formData.status, {
        comment: formData.comment.trim(),
        duration,
        errorCode: formData.status ? null : formData.errorCode,
        errorDescription: formData.status ? null : formData.errorDescription.trim()
      });
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setValidationErrors({ submit: 'Произошла ошибка при сохранении' });
    } finally {
      setIsSubmitting(false);
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
        {confirmationMode ? (
          <>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>
              Продолжить
            </h3>
            <div className="modal-actions" style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <Button 
                title="Да"
                onClick={() => onSave(true)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
              <Button 
                title="Нет"
                onClick={() => onSave(false)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </>
        ) : (
          <>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>
              Статус операции: {operation}
            </h3>
            
            <div className="status-buttons" style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <Button 
                title="Успешно"
                onClick={() => handleStatusChange(true)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: formData.status ? '#4CAF50' : '#f5f5f5',
                  color: formData.status ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              <Button 
                title="Неуспешно"
                onClick={() => handleStatusChange(false)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: !formData.status ? '#f44336' : '#f5f5f5',
                  color: !formData.status ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {!formData.status && (
              <div style={{ marginBottom: '24px' }}>
                <Select
                  label="Код ошибки"
                  value={formData.errorCode}
                  onChange={handleChange('errorCode')}
                  options={Object.entries(ERROR_CODES).map(([code, desc]) => ({
                    value: code,
                    label: `${code}: ${desc}`
                  }))}
                  error={validationErrors.errorCode}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="Описание проблемы"
                  value={formData.errorDescription}
                  onChange={handleChange('errorDescription')}
                  placeholder="Опишите возникшую проблему"
                  error={validationErrors.errorDescription}
                  required
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <Input
              label="Дополнительный комментарий"
              value={formData.comment}
              onChange={handleChange('comment')}
              placeholder="Введите комментарий если необходимо"
              multiline
              rows={3}
              disabled={isSubmitting}
            />

            {validationErrors.submit && (
              <div style={{ 
                color: '#ff4d4f', 
                marginBottom: '16px',
                textAlign: 'center' 
              }}>
                {validationErrors.submit}
              </div>
            )}

            <div className="modal-actions" style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <Button 
                title="Сохранить"
                onClick={handleSave}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              />
              <Button 
                title="Отмена"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#000',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

OperationStatusModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  operation: PropTypes.string.isRequired,
  initialData: PropTypes.shape({
    status: PropTypes.bool,
    comment: PropTypes.string,
    errorCode: PropTypes.string,
    errorDescription: PropTypes.string
  }),
  confirmationMode: PropTypes.bool
};

export default React.memo(OperationStatusModal);
