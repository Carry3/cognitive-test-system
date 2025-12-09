import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await changePassword(
                passwordForm.oldPassword,
                passwordForm.newPassword,
                passwordForm.confirmPassword
            );

            if (result.success) {
                setSuccess(result.message || 'Password changed successfully!');
                setPasswordForm({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setSuccess('');
                }, 2000);
            } else {
                setError(result.message || 'Failed to change password');
            }
        } catch (err) {
            setError('An error occurred, please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="view-settings">
            <h2 style={{ marginBottom: '20px' }}>Settings</h2>

            {/* Account Information Card */}
            <div className="test-card" style={{ marginBottom: '20px', cursor: 'default' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>Account Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-border)' }}>
                        <span style={{ color: '#777', fontWeight: '600' }}>Username</span>
                        <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{user?.username || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-border)' }}>
                        <span style={{ color: '#777', fontWeight: '600' }}>Email</span>
                        <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{user?.email || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: '#777', fontWeight: '600' }}>Role</span>
                        <span style={{
                            fontWeight: '700',
                            color: 'white',
                            background: 'var(--duo-blue)',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px'
                        }}>
                            {user?.role || 'USER'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Security Card */}
            <div className="test-card" style={{ marginBottom: '20px', cursor: 'default' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>Security</h3>
                <p style={{ color: '#777', marginBottom: '16px', fontSize: '15px' }}>
                    Keep your account secure by regularly updating your password
                </p>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setShowPasswordModal(true)}
                >
                    Change Password
                </button>
            </div>

            {/* Password Change Modal */}
            <div className={`modal-overlay ${showPasswordModal ? 'active' : ''}`}>
                <div className="modal-card" style={{ width: '450px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Change Password</h2>

                    {error && (
                        <div style={{
                            background: '#fff4f4',
                            border: '2px solid var(--duo-red)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: 'var(--duo-red)',
                            fontWeight: '700',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            background: '#f0fff4',
                            border: '2px solid var(--duo-green)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: 'var(--duo-green)',
                            fontWeight: '700',
                            fontSize: '14px'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: '700',
                                color: 'var(--text-color)',
                                marginBottom: '8px',
                                fontSize: '15px'
                            }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordForm.oldPassword}
                                onChange={handlePasswordChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid var(--gray-border)',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontFamily: 'Nunito, sans-serif',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter current password"
                                disabled={loading}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: '700',
                                color: 'var(--text-color)',
                                marginBottom: '8px',
                                fontSize: '15px'
                            }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid var(--gray-border)',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontFamily: 'Nunito, sans-serif',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter new password"
                                disabled={loading}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontWeight: '700',
                                color: 'var(--text-color)',
                                marginBottom: '8px',
                                fontSize: '15px'
                            }}>
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid var(--gray-border)',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontFamily: 'Nunito, sans-serif',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Confirm new password"
                                disabled={loading}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                    setError('');
                                    setSuccess('');
                                }}
                                className="btn btn-outline"
                                style={{ flex: 1 }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
