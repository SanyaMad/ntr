import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '../services/DatabaseService';
import Header from '../components/Header';
import RecordCard from '../components/RecordCard';
import KPIMetrics from '../components/KPIMetrics';
import DashboardFilters from '../components/DashboardFilters';
import ImportPreviewModal from '../components/ImportPreviewModal';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    operator: '',
    modelType: '',
    status: ''
  });

  const navigate = useNavigate();

  const applyFilters = useCallback((records, currentFilters) => {
    let filtered = [...records];

    if (currentFilters.operator) {
      filtered = filtered.filter(record => record.operator === currentFilters.operator);
    }

    if (currentFilters.status && currentFilters.status !== 'all') {
      filtered = filtered.filter(record => {
        if (currentFilters.status === 'completed') {
          return record.operations?.every(op => op.success);
        } else if (currentFilters.status === 'in_progress') {
          return record.operations?.some(op => !op.success) && record.operations?.some(op => op.success);
        } else if (currentFilters.status === 'error') {
          return record.operations?.some(op => !op.success);
        }
        return true;
      });
    }

    if (currentFilters.modelType && currentFilters.modelType !== 'all') {
      filtered = filtered.filter(record => record.modelType === currentFilters.modelType);
    }

    setFilteredRecords(filtered);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allBlocks = await databaseService.getAllBlocks(); // Загружаем все блоки из базы
      const statsData = await databaseService.getOperationsStats(
        new Date(filters.dateRange.start).toISOString(),
        new Date(filters.dateRange.end + 'T23:59:59').toISOString()
      );

      setRecords(allBlocks); // Устанавливаем все блоки для отображения
      setStats(statsData); // Устанавливаем статистику по всем блокам
      applyFilters(allBlocks, filters); // Применяем фильтры к блокам
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, applyFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFiltersApply = useCallback((newFilters) => {
    setFilters(newFilters);
    applyFilters(records, newFilters);
  }, [records, applyFilters]);

  const handleDelete = useCallback(async (recordId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await databaseService.deleteBlock(recordId); // Удаляем запись из базы данных
        setRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
        setFilteredRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        alert('Не удалось удалить запись');
      }
    }
  }, []);

  const calculateMetrics = (data) => {
    if (!stats) return { totalRecords: 0, successRate: 0, averageOperations: 0 };

    const totalRecords = stats.totalBlocks || 0;
    const successRate = stats.total > 0
      ? (stats.successful / stats.total) * 100
      : 0;
    const averageOperations = stats.totalBlocks > 0
      ? stats.total / stats.totalBlocks
      : 0;

    return { totalRecords, successRate, averageOperations };
  };

  const handleExport = async () => {
    try {
      const dataToExport = records.map(record => ({
        ID: record.id,
        Статус: record.status,
        'Дата создания': new Date(record.createdAt).toLocaleString('ru-RU'),
        'Последнее обновление': new Date(record.updatedAt).toLocaleString('ru-RU'),
        Оператор: record.operator,
        Комментарий: record.comment || ''
      }));
      
      await exportToExcel(dataToExport, 'Отчет_по_операциям');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  };

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    
    // Генерируем имя файла с текущей датой
    const date = new Date().toISOString().split('T')[0];
    const fileName = `export_${date}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setImportError('');

    try {
      const importedRecords = await parseExcelReport(file);
      setImportPreviewData(importedRecords);
      setIsImportModalOpen(true);
    } catch (error) {
      setImportError('Ошибка при чтении файла: ' + error.message);
      console.error('Ошибка импорта:', error);
    } finally {
      setIsLoading(false);
      // Очищаем input для возможности повторной загрузки того же файла
      event.target.value = '';
    }
  };

  const parseExcelReport = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const records = XLSX.utils.sheet_to_json(worksheet);
          
          // Преобразуем данные в формат приложения
          const formattedRecords = records.map(record => ({
            id: record['ID'] || Date.now().toString(),
            date: record['Дата'] || new Date().toISOString(),
            modelType: record['Тип модели'],
            blockNumber: record['Номер блока'].toString(),
            operator: record['Оператор'] || 'Система',
            operations: [],
            status: 'В работе'
          }));
          
          resolve(formattedRecords);
        } catch (error) {
          reject(new Error('Ошибка при чтении файла: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportError = (error) => {
    setImportError(error);
    setImportPreviewData(null);
    setIsImportModalOpen(false);
    setImportErrors([]);
  };

  const handleImportConfirm = async () => {
    if (!importPreviewData) return;

    setIsImporting(true);
    try {
      // Обновляем записи в базе данных
      for (const record of importPreviewData) {
        await databaseService.addRecord({
          ...record,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          operator: localStorage.getItem('currentOperator') || 'Система'
        });
      }

      // Обновляем список записей
      await loadData();
      
      setIsImportModalOpen(false);
      setImportPreviewData(null);
      setImportErrors([]);
      setImportError(null);
    } catch (error) {
      console.error('Ошибка при импорте:', error);
      setImportErrors([error.message]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <Header title="Панель администратора" />
      
      <div className="dashboard-actions">
        <FileUpload 
          onFileSelect={handleImportExcel}
          onError={handleImportError}
        />
        <button onClick={() => exportToExcel(filteredRecords)} className="export-button">
          Экспорт в Excel
        </button>
        {importError && (
          <div className="error-message">
            {importError}
          </div>
        )}
      </div>

      <DashboardFilters 
        filters={filters}
        onApplyFilters={handleFiltersApply}
        onFilterChange={setFilters}
      />

      {/* KPI-блоки с подсчетом операций */}
      <KPIMetrics stats={stats} calculateMetrics={calculateMetrics} />

      {/* Список записей */}
      <div className="records-list">
        <div className="records-section slide-in-up" style={{ 
          marginTop: '24px',
          animationDelay: '0.6s'
        }}>
          <div className="section-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0 }}>Записи ({filteredRecords.length})</h3>
            <Button
              onClick={handleExport}
              variant="primary"
            >
              Экспорт в Excel
            </Button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {filteredRecords.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                onClick={() => navigate(`/block/${record.id}`)}
                onDelete={() => handleDelete(record.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно предпросмотра импорта */}
      {isImportModalOpen && (
        <ImportPreviewModal
          data={importPreviewData}
          onConfirm={handleImportConfirm}
          onCancel={() => {
            setIsImportModalOpen(false);
            setImportPreviewData(null);
            setImportErrors([]);
          }}
          isLoading={isImporting}
          errors={importErrors}
        />
      )}

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-md)'
          }}>
            Загрузка...
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-actions {
          margin-bottom: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .error-message {
          color: #dc3545;
          padding: 8px;
          border: 1px solid #dc3545;
          border-radius: 4px;
          background-color: #fff;
        }

        .records-list {
          display: grid;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
