import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false); // 防止重复调用

    useEffect(() => {
        // 如果已经验证过，不再执行
        if (hasVerified.current) {
            return;
        }

        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('验证令牌缺失');
            hasVerified.current = true;
            return;
        }

        // 调用验证API
        const verify = async () => {
            hasVerified.current = true; // 标记为已验证，防止重复调用
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
                        <h2 style={{ marginBottom: '15px' }}>正在验证邮箱...</h2>
                        <p style={{ color: '#666' }}>请稍候</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ marginBottom: '15px', color: '#28A745' }}>验证成功!</h2>
                        <p style={{ marginBottom: '30px', color: '#666', lineHeight: '1.6' }}>
                            {message}
                        </p>
                        <Link to="/login">
                            <button
                                className='btn btn-primary'
                                style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                            >
                                前往登录
                            </button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ marginBottom: '15px', color: '#FF4B4B' }}>验证失败</h2>
                        <p style={{ marginBottom: '30px', color: '#666', lineHeight: '1.6' }}>
                            {message}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <Link to="/login">
                                <button
                                    className='btn btn-primary'
                                    style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                                >
                                    返回登录
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
                                    重新注册
                                </button>
                            </Link>
                        </div>
                    </>
                )}

                <div style={{ marginTop: '30px', fontSize: '14px', color: '#999' }}>
                    {status === 'error' && (
                        <p>
                            如果您持续遇到问题，请联系支持团队
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
