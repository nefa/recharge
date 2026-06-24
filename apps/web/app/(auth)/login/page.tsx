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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data.message ?? 'Invalid credentials');
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
        {t('auth.loginCta')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
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
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          sx={{ mb: 2 }}
        >
          {t('auth.login')}
        </Button>
      </Box>

      <Typography variant="body2" align="center">
        {t('auth.noAccount')}{' '}
        <MuiLink component={NextLink} href="/register">
          {t('auth.register')}
        </MuiLink>
      </Typography>

      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {t('demo.credentials')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>
          admin@techro.ro / password123
        </Typography>
      </Box>
    </Paper>
  );
}
