import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false); // Prevent duplicate calls

    useEffect(() => {
        // If already verified, don't execute again
        if (hasVerified.current) {
            return;
        }

        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Verification token missing');
            hasVerified.current = true;
            return;
        }

        // Call verification API
        const verify = async () => {
            hasVerified.current = true; // Mark as verified to prevent duplicate calls
            const result = await verifyEmail(token);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div
            className='app-container'
            style={{ justifyContent: 'center', alignItems: 'center', background: '#fcfcfc' }}
        >
            <div
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    padding: '40px',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 4px 0 #e5e5e5',
                    border: '2px solid #e5e5e5',
                    textAlign: 'center',
                }}
            >
                <h1 className='logo' style={{ marginBottom: '20px' }}>
                    Cognitive Gym
                </h1>

                {status === 'loading' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                        <h2 style={{ marginBottom: '15px' }}>Verifying email...</h2>
                        <p style={{ color: '#666' }}>Please wait</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ marginBottom: '15px', color: '#28A745' }}>Verification successful!</h2>
                        <p style={{ marginBottom: '30px', color: '#666', lineHeight: '1.6' }}>
                            {message}
                        </p>
                        <Link to="/login">
                            <button
                                className='btn btn-primary'
                                style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                            >
                                Go to Login
                            </button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ marginBottom: '15px', color: '#FF4B4B' }}>Verification failed</h2>
                        <p style={{ marginBottom: '30px', color: '#666', lineHeight: '1.6' }}>
                            {message}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <Link to="/login">
                                <button
                                    className='btn btn-primary'
                                    style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                                >
                                    Back to Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button
                                    className='btn btn-secondary'
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '16px',
                                        background: '#f8f9fa',
                                        color: '#333',
                                        border: '2px solid #e5e5e5'
                                    }}
                                >
                                    Register Again
                                </button>
                            </Link>
                        </div>
                    </>
                )}

                <div style={{ marginTop: '30px', fontSize: '14px', color: '#999' }}>
                    {status === 'error' && (
                        <p>
                            If you continue to encounter problems, please contact the support team
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
