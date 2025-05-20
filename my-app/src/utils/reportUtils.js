import * as XLSX from 'xlsx';
import { OPERATIONS, OPERATION_STATUSES } from '../constants';

export const generateDailyReport = (records) => {
  if (!Array.isArray(records)) {
    records = [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  }).map(record => ({
    Дата: record.date,
    'Тип модели': record.modelType || '',
    'Тип блока': record.modemType || '',
    'Номер блока': record.blockNumber || '',
    'Вид исполнения': record.executionType || '',
    Оператор: record.operator || '',
    'Последняя операция': record.operations && record.operations.length > 0 
      ? `${record.operations[record.operations.length - 1].name} - ${record.operations[record.operations.length - 1].success ? 'Успешно' : 'Неуспешно'}`
      : 'Нет операций'
  }));

  // Если нет записей, создаем пустую запись чтобы избежать ошибки
  if (filteredRecords.length === 0) {
    filteredRecords.push({
      Дата: '',
      'Тип модели': '',
      'Тип блока': '',
      'Номер блока': '',
      'Вид исполнения': '',
      Оператор: '',
      'Последняя операция': ''
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет за день');
  return workbook;
};

export const generateOperatorDailyReport = (records, operator) => {
  if (!Array.isArray(records)) {
    records = [];
  }

  const today = new Date().toISOString().split('T')[0];
  const operatorRecords = records.filter(record =>
    record.operator === operator &&
    record.date && record.date.startsWith(today)
  );

  const reportData = OPERATIONS.map(operation => ({
    'Операция': operation,
    'Количество выполненных': operatorRecords.filter(record =>
      record.operations && record.operations.some(op =>
        op.name === operation &&
        op.status === OPERATION_STATUSES.COMPLETED
      )
    ).length,
    'Успешно': operatorRecords.filter(record =>
      record.operations && record.operations.some(op =>
        op.name === operation &&
        op.success === true
      )
    ).length,
    'С ошибками': operatorRecords.filter(record =>
      record.operations && record.operations.some(op =>
        op.name === operation &&
        op.success === false
      )
    ).length
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(reportData);
  XLSX.utils.book_append_sheet(wb, ws, 'Отчет за день');
  return wb;
};
