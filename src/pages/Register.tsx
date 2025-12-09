import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // 密码复杂度验证
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // 检查是否包含大写字母
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    // 检查是否包含小写字母
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    // 检查是否包含数字
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    // 检查是否包含特殊字符
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(username.trim(), email.trim(), password);
      if (result.success) {
        setSuccessMessage(result.message || 'Registration successful! Please check your email to verify your account.');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: '#fcfcfc' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5' }}>
        <h1 className="logo" style={{ textAlign: 'center', marginBottom: '20px' }}>Cognitive Gym</h1>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Profile</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: '#FFE5E5',
              color: '#FF4B4B',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          {successMessage && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: '#E5F9E5',
              color: '#28A745',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {successMessage}
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Choose a Username (min 3 characters)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={isLoading || !!successMessage}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={isLoading || !!successMessage}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={isLoading || !!successMessage}
            />
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#666', lineHeight: '1.4', marginLeft: '8px' }}>
              Must be 8+ characters with uppercase, lowercase, number, and special character
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '16px', boxSizing: 'border-box' }}
              required
              disabled={isLoading || !!successMessage}
            />
          </div>
          {!successMessage && (
            <button
              type="submit"
              className="btn btn-blue"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          )}
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#58CC02', textDecoration: 'none', fontWeight: 'bold' }}>
            {successMessage ? 'Go to Login' : 'Already have an account?'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

