import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { parseExcelFile } from '../utils/excelParser';

const FileUpload = ({ onFileSelect, onError }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем расширение файла
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      onError('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
      return;
    }

    setIsLoading(true);
    try {
      const parsedData = await parseExcelFile(file);
      onFileSelect(parsedData);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
      // Очищаем input для возможности повторной загрузки того же файла
      event.target.value = '';
    }
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button 
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? 'Обработка файла...' : 'Загрузить Excel файл'}
      </Button>

      <style jsx>{`
        .file-upload {
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default FileUpload;