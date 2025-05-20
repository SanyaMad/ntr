import * as XLSX from 'xlsx';
import { 
  EXCEL_COLUMN_MAPPING, 
  EXCEL_VALIDATION_RULES,
  MODEL_TYPES,
  MODEM_TYPES,
  BLOCK_TYPES
} from '../constants';

export const parseExcelFile = async (file) => {
  try {
    const data = await readExcelFile(file);
    const validatedData = validateAndTransformData(data);
    return validatedData;
  } catch (error) {
    throw new Error(`Ошибка при обработке файла: ${error.message}`);
  }
};

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Берем первый лист
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Преобразуем в JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // Преобразовывать числа в строки
          defval: '' // Значение по умолчанию для пустых ячеек
        });
        
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Не удалось прочитать файл Excel'));
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
    reader.readAsArrayBuffer(file);
  });
};

const validateAndTransformData = (rawData) => {
  const errors = [];
  const transformedData = [];

  rawData.forEach((row, index) => {
    try {
      const transformedRow = transformRow(row);
      validateRow(transformedRow, index + 1);
      transformedData.push(transformedRow);
    } catch (error) {
      errors.push(`Строка ${index + 1}: ${error.message}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return transformedData;
};

const transformRow = (row) => {
  const transformed = {};

  // Маппинг колонок из Excel в поля приложения
  Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, appField]) => {
    const value = row[excelColumn] || row[excelColumn.toLowerCase()] || '';
    transformed[appField] = normalizeValue(appField, value);
  });

  // Добавляем дополнительные поля
  transformed.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  transformed.createdAt = new Date().toISOString();
  transformed.operations = [];
  transformed.status = 'waiting';

  return transformed;
};

const normalizeValue = (field, value) => {
  const stringValue = String(value).trim();

  switch (field) {
    case 'modelType':
      return MODEL_TYPES.find(
        type => type.toLowerCase() === stringValue.toLowerCase()
      ) || stringValue;
    
    case 'modemType':
      return MODEM_TYPES.find(
        type => type.toLowerCase() === stringValue.toLowerCase()
      ) || stringValue;
    
    case 'blockType':
      return BLOCK_TYPES.find(
        type => type.toLowerCase() === stringValue.toLowerCase()
      ) || stringValue;
    
    case 'macAddress':
      return formatMacAddress(stringValue);
    
    default:
      return stringValue;
  }
};

const validateRow = (row, rowNumber) => {
  const errors = [];

  Object.entries(EXCEL_VALIDATION_RULES).forEach(([field, rules]) => {
    const value = row[field];

    if (rules.required && !value) {
      errors.push(`Поле '${field}' обязательно для заполнения`);
    }

    if (value && rules.validate && !rules.validate(value)) {
      errors.push(rules.error);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
};

const formatMacAddress = (value) => {
  if (!value) return '';
  
  // Убираем все нежелательные символы
  const clean = value.replace(/[^A-Fa-f0-9]/g, '');
  
  // Проверяем длину
  if (clean.length !== 12) return value;
  
  // Форматируем в XX:XX:XX:XX:XX:XX
  return clean.match(/.{1,2}/g)?.join(':').toUpperCase() || value;
};