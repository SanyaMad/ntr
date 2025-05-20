import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const Select = ({
  value,
  onChange,
  options = [],
  label,
  placeholder = 'Выберите...',
  error,
  disabled = false,
  required = false,
  searchable = false,
  clearable = false,
  loading = false,
  multiple = false,
  size = 'medium',
  className,
  style,
  onFocus,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Размеры в зависимости от параметра size
  const sizeStyles = {
    small: {
      height: '28px',
      fontSize: '12px',
      padding: '4px 8px',
      iconSize: 16
    },
    medium: {
      height: '36px',
      fontSize: '14px',
      padding: '6px 12px',
      iconSize: 20
    },
    large: {
      height: '44px',
      fontSize: '16px',
      padding: '8px 16px',
      iconSize: 24
    }
  }[size];

  // Фильтрация опций по поисковому запросу
  const filteredOptions = options.filter(option => 
    option?.label?.toLowerCase?.().includes(searchQuery?.toLowerCase?.() || '') || false
  );

  // Закрытие выпадающего списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка выбора опции
  const handleSelect = useCallback((option) => {
    if (disabled) return;

    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.findIndex(v => v.value === option.value);
      
      if (index >= 0) {
        newValue.splice(index, 1);
      } else {
        newValue.push(option);
      }
      
      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
    }
    
    setSearchQuery('');
    if (!multiple) {
      inputRef.current?.blur();
    }
  }, [disabled, multiple, value, onChange, inputRef]);

  // Обработка клавиатурной навигации
  const handleKeyDown = useCallback((e) => {
    if (!isOpen && e.key === 'Enter') {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect]);

  // Очистка выбранного значения
  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;

    onChange(multiple ? [] : null); // Исправлено: добавлено действие для очистки значения
    setSearchQuery('');
    if (inputRef.current) inputRef.current.focus(); // Исправлено: добавлено условие вызова focus
  };

  // Получение отображаемого текста
  const getDisplayValue = () => {
    if (searchable && isOpen) return searchQuery;

    if (multiple) {
      if (!Array.isArray(value) || value.length === 0) return '';
      if (value.length === 1) return value[0].label;
      return `Выбрано ${value.length}`;
    }

    return value ? value.label : '';
  };

  return (
    <div
      ref={containerRef}
      className={`select-container ${className}`}
      style={style}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div
        className={`select-input ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="select-options"
      >
        <div className="select-value">
          {clearable && value && (
            <span className="select-clear" onClick={handleClear}>×</span>
          )}
          <span className="select-placeholder">
            {value && !Array.isArray(value) ? value.label : placeholder}
          </span>
          <span className="select-search-value">
            {getDisplayValue()}
          </span>
        </div>
        <div className="select-icon">
          <svg width={sizeStyles.iconSize} height={sizeStyles.iconSize} viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div
          id="select-options"
          className="select-dropdown"
          ref={dropdownRef}
          role="listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
          tabIndex={-1} // Исправлено: добавлен tabIndex
        >
          {loading && (
            <div className="select-loading">
              Загрузка...
            </div>
          )}
          {!loading && filteredOptions.length === 0 && (
            <div className="select-no-options">
              Нет вариантов
            </div>
          )}
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              id={`option-${index}`}
              className={`select-option ${highlightedIndex === index ? 'highlighted' : ''}`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value && value.value === option.value}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Select.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  searchable: PropTypes.bool,
  clearable: PropTypes.bool,
  loading: PropTypes.bool,
  multiple: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default Select;