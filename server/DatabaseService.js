import { indexedDBService } from './IndexedDBService';
import { STORAGE_KEY, MODEL_TYPES } from '../my-app/src/constants';
import * as XLSX from 'xlsx';

class DatabaseService {
  constructor() {
    this.storageKey = STORAGE_KEY;
    // Мигрируем данные из localStorage при первом запуске
    this.migrateFromLocalStorage();
  }

  async migrateFromLocalStorage() {
    try {
      const localData = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      if (localData.length > 0) {
        for (const record of localData) {
          await indexedDBService.addBlock(record);
        }
        // После успешной миграции очищаем localStorage
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('Ошибка при миграции данных:', error);
    }
  }

  getAllBlocks() {
    return indexedDBService.getAllBlocks();
  }

  async getBlockById(blockId) {
    return indexedDBService.getBlockById(blockId);
  }

  validateBlock(block) {
    const requiredFields = ['modelType', 'blockNumber'];
    const missingFields = requiredFields.filter(field => !block[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
    }

    // Проверка типа модели
    if (!MODEL_TYPES.includes(block.modelType)) {
      throw new Error(`Недопустимый тип модели: ${block.modelType}`);
    }

    // Проверка номера блока
    if (!/^\d+$/.test(block.blockNumber)) {
      throw new Error('Номер блока должен содержать только цифры');
    }

    // Проверка MAC-адреса, если он указан
    if (block.macAddress && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(block.macAddress)) {
      throw new Error('Неверный формат MAC-адреса');
    }

    return true;
  }

  async addBlock(block) {
    this.validateBlock(block);
    return indexedDBService.addBlock(block);
  }

  async updateBlock(blockId, updatedBlock) {
    return indexedDBService.updateBlock(blockId, updatedBlock);
  }

  async deleteBlock(blockId) {
    try {
      await indexedDBService.deleteBlock(blockId); // Удаляем блок из IndexedDB
    } catch (error) {
      console.error('Ошибка при удалении блока:', error);
      throw new Error('Не удалось удалить блок');
    }
  }

  async getBlocksByOperator(operator) {
    return indexedDBService.getBlocksByOperator(operator);
  }

  async getOperationsStats(startDate, endDate) {
    const blocks = await this.getAllBlocks();
    const filteredBlocks = blocks.filter(block => {
      const blockDate = new Date(block.date);
      return blockDate >= new Date(startDate) && blockDate <= new Date(endDate);
    });

    const stats = {
      totalBlocks: filteredBlocks.length,
      total: 0,
      successful: 0,
      failed: 0,
      averageDuration: 0,
      byOperator: {},
      operations: {}
    };

    let totalDuration = 0;
    let operationsCount = 0;

    filteredBlocks.forEach(block => {
      if (!Array.isArray(block.operations)) return;
      
      const operator = block.operator || 'Неизвестный оператор';
      if (!stats.byOperator[operator]) {
        stats.byOperator[operator] = 0;
      }
      stats.byOperator[operator] += block.operations.length;
      
      block.operations.forEach((op, index) => {
        stats.total++;
        if (op.success) stats.successful++;
        else stats.failed++;

        const opName = op.name || 'Неизвестная операция';
        if (!stats.operations[opName]) {
          stats.operations[opName] = {
            total: 0,
            successful: 0,
            failed: 0,
            averageDuration: 0,
            totalDuration: 0,
            durationCount: 0
          };
        }
        
        stats.operations[opName].total++;
        if (op.success) stats.operations[opName].successful++;
        else stats.operations[opName].failed++;

        if (index > 0 && block.operations[index - 1].timestamp) {
          const duration = new Date(op.timestamp) - new Date(block.operations[index - 1].timestamp);
          if (duration > 0 && duration < 4 * 60 * 60 * 1000) {
            totalDuration += duration;
            operationsCount++;
            
            const opStats = stats.operations[opName];
            opStats.totalDuration += duration;
            opStats.durationCount++;
            opStats.averageDuration = opStats.totalDuration / opStats.durationCount;
          }
        }
      });
    });

    stats.averageDuration = operationsCount > 0 ? totalDuration / operationsCount : 0;
    return stats;
  }

  async importFromExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const records = XLSX.utils.sheet_to_json(worksheet);

          // Преобразование данных в формат приложения
          const formattedRecords = records.map(record => ({
            id: record['ID'] || Date.now().toString(),
            date: record['Дата'] || new Date().toISOString(),
            modelType: record['Тип модели'],
            modemType: record['Тип модема'],
            blockNumber: record['Номер блока'],
            macAddress: record['MAC адрес'],
            operator: record['Оператор'],
            operations: this.parseOperations(record['Операции']),
            status: record['Статус'] || 'В работе'
          }));

          // Импортируем записи в IndexedDB
          for (const record of formattedRecords) {
            await indexedDBService.addBlock(record);
          }

          const updatedRecords = await this.getAllBlocks();
          resolve(updatedRecords);
        } catch (error) {
          reject(new Error('Ошибка при импорте данных: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsArrayBuffer(file);
    });
  }

  async importRecords(records) {
    try {
      // Валидация данных перед импортом
      const validationErrors = [];
      const validatedRecords = records.map((record, index) => {
        try {
          if (!record.modelType || !record.blockNumber) {
            throw new Error('Отсутствуют обязательные поля');
          }

          return {
            ...record,
            id: record.id || Date.now() + Math.random().toString(36).substr(2, 9),
            createdAt: record.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending',
            operations: record.operations || [],
            status: record.status || 'В работе'
          };
        } catch (error) {
          validationErrors.push(`Ошибка в записи ${index + 1}: ${error.message}`);
          return null;
        }
      }).filter(Boolean);

      if (validationErrors.length > 0) {
        throw new Error(`Ошибки валидации:\n${validationErrors.join('\n')}`);
      }

      // Импортируем записи в базу данных
      const importResults = await Promise.allSettled(
        validatedRecords.map(record => this.addBlock(record))
      );

      // Проверяем результаты импорта
      const importErrors = importResults
        .map((result, index) => 
          result.status === 'rejected' 
            ? `Ошибка импорта записи ${index + 1}: ${result.reason.message}`
            : null
        )
        .filter(Boolean);

      if (importErrors.length > 0) {
        throw new Error(`Ошибки при импорте:\n${importErrors.join('\n')}`);
      }

      return validatedRecords;
    } catch (error) {
      console.error('Ошибка при импорте записей:', error);
      throw new Error('Не удалось импортировать записи: ' + error.message);
    }
  }

  parseOperations(operationsString) {
    if (!operationsString) return [];
    return operationsString.split(';').map(op => {
      const match = op.trim().match(/(.+)\s*\((\w+)\)/);
      if (match) {
        return {
          name: match[1].trim(),
          success: match[2] === 'Успешно',
          timestamp: new Date().toISOString()
        };
      }
      return null;
    }).filter(Boolean);
  }
}

export const databaseService = new DatabaseService();
