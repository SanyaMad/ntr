import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { EXCEL_VALIDATION_RULES } from '../constants';

const ImportPreviewModal = ({ data, onConfirm, onCancel, isLoading, errors = [] }) => {
  const validRecords = useMemo(() => 
    data?.filter(record => 
      !Object.entries(EXCEL_VALIDATION_RULES)
        .some(([field, rules]) => 
          (rules.required && !record[field]) ||
          (record[field] && rules.validate && !rules.validate(record[field]))
        )
    ) || [], [data]
  );

  const hasErrors = errors.length > 0 || (data?.length || 0) !== validRecords.length;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Предпросмотр импорта</h2>
        
        <div className="preview-stats">
          <div className="stats-row">
            <strong>Всего записей: </strong> {data?.length || 0}
          </div>
          <div className="stats-row">
            <strong>Валидных записей: </strong> 
            <span className={validRecords.length === data?.length ? 'success' : 'warning'}>
              {validRecords.length}
            </span>
          </div>
          
          {hasErrors && (
            <div className="validation-errors">
              <h3>Ошибки валидации:</h3>
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="error-item">{error}</li>
                ))}
                {data?.length !== validRecords.length && (
                  <li className="error-item">
                    Найдено {data?.length - validRecords.length} записей с ошибками
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="preview-table">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Тип модели</th>
                <th>Номер блока</th>
                <th>Тип модема</th>
                <th>MAC адрес</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((record, index) => {
                const isValid = !Object.entries(EXCEL_VALIDATION_RULES)
                  .some(([field, rules]) => 
                    (rules.required && !record[field]) ||
                    (record[field] && rules.validate && !rules.validate(record[field]))
                  );

                return (
                  <tr key={index} className={isValid ? '' : 'invalid-row'}>
                    <td>{index + 1}</td>
                    <td>{record.modelType}</td>
                    <td>{record.blockNumber}</td>
                    <td>{record.modemType}</td>
                    <td>{record.macAddress}</td>
                    <td>
                      <span className={`status-badge ${isValid ? 'valid' : 'invalid'}`}>
                        {isValid ? 'Готово к импорту' : 'Ошибка валидации'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm}
            disabled={isLoading || hasErrors}
          >
            {isLoading ? 'Импорт...' : 'Импортировать'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .preview-stats {
          margin: 16px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .stats-row {
          margin-bottom: 8px;
        }

        .success { color: #28a745; }
        .warning { color: #dc3545; }

        .validation-errors {
          margin-top: 16px;
          padding: 16px;
          background: #fff3f3;
          border: 1px solid #dc3545;
          border-radius: 4px;
        }

        .validation-errors h3 {
          margin: 0 0 8px 0;
          color: #dc3545;
        }

        .error-item {
          color: #dc3545;
          margin-bottom: 4px;
        }

        .preview-table {
          margin: 24px 0;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .invalid-row {
          background: #fff3f3;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .status-badge.valid {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.invalid {
          background: #f8d7da;
          color: #721c24;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 16px;
            width: 95%;
          }

          th, td {
            padding: 8px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

ImportPreviewModal.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    modelType: PropTypes.string,
    blockNumber: PropTypes.string,
    modemType: PropTypes.string,
    macAddress: PropTypes.string
  })),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errors: PropTypes.arrayOf(PropTypes.string)
};

export default ImportPreviewModal;