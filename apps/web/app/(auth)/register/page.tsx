'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import NextLink from 'next/link';
import { Button } from '@recharge/ui';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useTranslations();
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('invite.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('invite.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await register({ companyName, name, email, password });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string | string[] };
        const msg = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setError(msg ?? t('common.error'));
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        {t('common.appName')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.registerCta')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label={t('auth.companyName')}
          fullWidth
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.yourName')}
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.email')}
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.password')}
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.confirmPassword')}
          type="password"
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          sx={{ mb: 2 }}
        >
          {t('auth.register')}
        </Button>
      </Box>

      <Typography variant="body2" align="center">
        {t('auth.hasAccount')}{' '}
        <MuiLink component={NextLink} href="/login">
          {t('auth.login')}
        </MuiLink>
      </Typography>
    </Paper>
  );
}
