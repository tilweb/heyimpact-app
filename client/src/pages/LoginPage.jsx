import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import tokens from '../theme/tokens.js';
import Button from '../components/ui/Button.jsx';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryLight} 100%)`,
    }}>
      <div style={{
        background: tokens.colors.surface,
        borderRadius: tokens.radii.xl,
        boxShadow: tokens.shadows.xl,
        padding: tokens.spacing.xxxxl,
        width: 400,
        maxWidth: '90vw',
      }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing.xxxl }}>
          <h1 style={{ fontSize: tokens.typography.fontSize.xxxl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primary, margin: 0 }}>
            HeyImpact
          </h1>
          <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textSecondary, marginTop: tokens.spacing.sm }}>
            ESRS Nachhaltigkeitsberichterstattung
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: tokens.spacing.xl }}>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.textSecondary,
              marginBottom: tokens.spacing.sm,
            }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              autoFocus
              style={{
                width: '100%',
                padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
                border: `1px solid ${error ? tokens.colors.error : tokens.colors.border}`,
                borderRadius: tokens.radii.sm,
                fontSize: tokens.typography.fontSize.lg,
                outline: 'none',
                fontFamily: tokens.typography.fontFamily,
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: tokens.spacing.md,
              background: tokens.colors.errorLight,
              color: tokens.colors.error,
              borderRadius: tokens.radii.sm,
              fontSize: tokens.typography.fontSize.sm,
              marginBottom: tokens.spacing.lg,
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!password || loading}
            style={{ width: '100%', justifyContent: 'center', padding: `${tokens.spacing.md}px` }}
          >
            {loading ? 'Anmeldung...' : 'Anmelden'}
          </Button>
        </form>
      </div>
    </div>
  );
}
