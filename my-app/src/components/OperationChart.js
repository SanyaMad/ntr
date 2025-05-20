import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const OperationChart = ({ operations }) => {
  // Группируем операции по типам
  const operationStats = operations.reduce((acc, op) => {
    if (!acc[op.name]) {
      acc[op.name] = {
        name: op.name,
        total: 0,
        successful: 0,
        failed: 0
      };
    }
    acc[op.name].total++;
    if (op.success) {
      acc[op.name].successful++;
    } else {
      acc[op.name].failed++;
    }
    return acc;
  }, {});

  const barChartData = Object.values(operationStats);

  // Данные для круговой диаграммы
  const pieData = [
    { 
      name: 'Успешно', 
      value: operations.filter(op => op.success).length,
      color: '#4caf50'
    },
    { 
      name: 'Ошибки', 
      value: operations.filter(op => !op.success).length,
      color: '#f44336'
    }
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 300, marginBottom: 30 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="successful" stackId="a" name="Успешно" fill="#4caf50" />
            <Bar dataKey="failed" stackId="a" name="Ошибки" fill="#f44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => 
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OperationChart;