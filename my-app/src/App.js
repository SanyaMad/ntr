import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Tasks from './components/Tasks';
import CreateTask from './components/CreateTask';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/tasks"
              element={<PrivateRoute><Tasks /></PrivateRoute>}
            />
            <Route
              path="/create-task"
              element={<PrivateRoute><CreateTask /></PrivateRoute>}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;