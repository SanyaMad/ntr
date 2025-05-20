import { useState } from 'react';
import axios from 'axios';

const TaskItem = ({ task, setTasks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [completed, setCompleted] = useState(task.completed);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, {
        title,
        description,
        completed
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.msg || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setTasks(prev => prev.filter(t => t._id !== task._id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.msg || 'Failed to delete task');
    }
  };

  return (
    <div className="border p-4 mb-4 rounded">
      {error && <p className="text-red-500">{error}</p>}
      {isEditing ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <label>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            Completed
          </label>
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white p-2 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <h3 className={completed ? 'line-through' : ''}>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {completed ? 'Completed' : 'Pending'}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white p-2 rounded mr-2"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskItem;