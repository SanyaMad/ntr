import React from 'react';
import PropTypes from 'prop-types';

const OperationStats = ({ operations }) => {
  const stats = {
    total: operations.length,
    successful: operations.filter(op => op.success).length,
    failed: operations.filter(op => !op.success).length,
    byType: operations.reduce((acc, op) => {
      if (!acc[op.name]) {
        acc[op.name] = {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0
        };
      }
      acc[op.name].total++;
      if (op.success) {
        acc[op.name].successful++;
      } else {
        acc[op.name].failed++;
      }
      acc[op.name].successRate = (acc[op.name].successful / acc[op.name].total) * 100;
      return acc;
    }, {})
  };

  const successRate = stats.total > 0 
    ? (stats.successful / stats.total * 100).toFixed(1)
    : 0;

  return (
    <div className="operation-stats">
      <div className="stats-overview">
        <div className="stat-card">
          <h4>Всего операций</h4>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Успешных</h4>
          <div className="stat-value success">{stats.successful}</div>
        </div>
        <div className="stat-card">
          <h4>С ошибками</h4>
          <div className="stat-value error">{stats.failed}</div>
        </div>
        <div className="stat-card">
          <h4>Успешность</h4>
          <div className="stat-value">{successRate}%</div>
        </div>
      </div>

      <div className="stats-details">
        <h4>Статистика по типам операций</h4>
        <div className="stats-table">
          <table>
            <thead>
              <tr>
                <th>Операция</th>
                <th>Всего</th>
                <th>Успешно</th>
                <th>Ошибки</th>
                <th>Успешность</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.byType).map(([name, data]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{data.total}</td>
                  <td className="success">{data.successful}</td>
                  <td className="error">{data.failed}</td>
                  <td>{data.successRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .operation-stats {
          padding: 20px 0;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-card h4 {
          margin: 0 0 10px;
          color: #666;
          font-size: 14px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
        }

        .stat-value.success {
          color: #4caf50;
        }

        .stat-value.error {
          color: #f44336;
        }

        .stats-details {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stats-details h4 {
          margin: 0 0 20px;
          color: #333;
        }

        .stats-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          font-weight: 500;
          color: #666;
        }

        td.success {
          color: #4caf50;
        }

        td.error {
          color: #f44336;
        }
      `}</style>
    </div>
  );
};

OperationStats.propTypes = {
  operations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    success: PropTypes.bool.isRequired
  })).isRequired
};

export default OperationStats;