import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Select from './Select';
import Input from './Input';
import Button from './Button';

const DashboardFilters = ({ onApplyFilters, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: initialFilters.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: initialFilters.dateRange?.end || new Date().toISOString().split('T')[0]
    },
    operator: initialFilters.operator || '',
    status: initialFilters.status || 'all',
    modelType: initialFilters.modelType || 'all',
    sortBy: initialFilters.sortBy || 'date',
    sortOrder: initialFilters.sortOrder || 'desc'
  });

  const handleFilterChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (field) => (e) => {
    const value = e?.target?.value;
    if (!value) return;
    
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleReset = () => {
    const defaultFilters = {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      operator: '',
      status: 'all',
      modelType: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  return (
    <div className="dashboard-filters slide-in-up">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        padding: '20px',
        background: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <Input
            type="date"
            label="Начало периода"
            value={filters.dateRange.start}
            onChange={handleDateRangeChange('start')}
            required
          />
        </div>

        <div>
          <Input
            type="date"
            label="Конец периода"
            value={filters.dateRange.end}
            onChange={handleDateRangeChange('end')}
            required
          />
        </div>

        <div>
          <Select
            label="Оператор"
            value={filters.operator}
            onChange={handleFilterChange('operator')}
            options={[
              { value: '', label: 'Все операторы' },
              { value: 'operator1', label: 'Оператор 1' },
              { value: 'operator2', label: 'Оператор 2' }
            ]}
          />
        </div>

        <div>
          <Select
            label="Статус"
            value={filters.status}
            onChange={handleFilterChange('status')}
            options={[
              { value: 'all', label: 'Все статусы' },
              { value: 'completed', label: 'Завершено' },
              { value: 'in_progress', label: 'В работе' },
              { value: 'error', label: 'С ошибками' }
            ]}
          />
        </div>

        <div>
          <Select
            label="Тип модели"
            value={filters.modelType}
            onChange={handleFilterChange('modelType')}
            options={[
              { value: 'all', label: 'Все типы' },
              { value: 'type1', label: 'Тип 1' },
              { value: 'type2', label: 'Тип 2' }
            ]}
          />
        </div>

        <div>
          <Select
            label="Сортировать по"
            value={filters.sortBy}
            onChange={handleFilterChange('sortBy')}
            options={[
              { value: 'date', label: 'Дате' },
              { value: 'block', label: 'Номеру блока' },
              { value: 'success_rate', label: 'Успешности' }
            ]}
          />
        </div>

        <div>
          <Select
            label="Порядок"
            value={filters.sortOrder}
            onChange={handleFilterChange('sortOrder')}
            options={[
              { value: 'desc', label: 'По убыванию' },
              { value: 'asc', label: 'По возрастанию' }
            ]}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '16px'
      }}>
        <Button 
          title="Сбросить"
          onClick={handleReset}
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--text)'
          }}
        />
        <Button 
          title="Применить фильтры"
          onClick={() => onApplyFilters(filters)}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}
        />
      </div>
    </div>
  );
};

DashboardFilters.propTypes = {
  onApplyFilters: PropTypes.func.isRequired,
  initialFilters: PropTypes.shape({
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string
    }),
    operator: PropTypes.string,
    status: PropTypes.string,
    modelType: PropTypes.string,
    sortBy: PropTypes.string,
    sortOrder: PropTypes.string
  })
};

export default React.memo(DashboardFilters);