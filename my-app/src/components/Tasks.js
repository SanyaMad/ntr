import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err.response?.data?.msg || err.message);
        alert('Failed to fetch tasks: ' + (err.response?.data?.msg || 'Unknown error'));
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Your Tasks</h1>
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <div>
          {tasks.map(task => (
            <TaskItem key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;