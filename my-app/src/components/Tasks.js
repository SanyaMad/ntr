import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setTasks(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.response?.data?.msg || 'Failed to fetch tasks');
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Your Tasks</h1>
      {error && <p className="text-red-500">{error}</p>}
      {tasks.length === 0 && !error ? (
        <p>No tasks found</p>
      ) : (
        <div>
          {tasks.map(task => (
            <TaskItem key={task._id} task={task} setTasks={setTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;