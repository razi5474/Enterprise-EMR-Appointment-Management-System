import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user: currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-brand">
        <div className="login-brand-mark">Enterprise EMR</div>

        <div className="login-brand-copy">
          <h1>Every patient,<br />on schedule.</h1>
          <p>
            Manage doctor schedules, book appointments, and keep your front
            desk running without double-bookings or guesswork.
          </p>
        </div>

        <svg className="login-pulse" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0,30 L110,30 L130,8 L150,52 L170,30 L400,30" />
        </svg>

        <div className="login-brand-footer">Internal staff access only</div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-card">
          <h2>Sign in</h2>
          <p className="login-subtitle">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                required
                autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;