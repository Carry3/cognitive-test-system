import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please enter username/email and password')
      return
    }

    setIsLoading(true)
    try {
      const result = await login(usernameOrEmail.trim(), password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className='app-container'
      style={{ justifyContent: 'center', alignItems: 'center', background: '#fcfcfc' }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '40px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 0 #e5e5e5',
          border: '2px solid #e5e5e5',
        }}
      >
        <h1 className='logo' style={{ textAlign: 'center', marginBottom: '20px' }}>
          Cognitive Gym
        </h1>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                marginBottom: '15px',
                padding: '10px',
                background: '#FFE5E5',
                color: '#FF4B4B',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <input
              type='text'
              placeholder='Username or Email'
              value={usernameOrEmail}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value)
                setError('')
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e5e5e5',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              required
              disabled={isLoading}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e5e5e5',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type='submit'
            className='btn btn-primary'
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link
            to='/register'
            style={{ color: '#1CB0F6', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
