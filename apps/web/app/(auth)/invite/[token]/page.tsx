'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Button } from '@recharge/ui';
import { apiClient, ApiError } from '@/lib/api-client';
import { useTranslations } from 'next-intl';
import type { InviteValidationResponse } from '@recharge/shared';

export default function InviteAcceptPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteValidationResponse | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Invalid invite');
        }
        return res.json();
      })
      .then((data: InviteValidationResponse) => setInvite(data))
      .catch((err) => setValidationError(err.message))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('invite.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('invite.passwordMinLength'));
      return;
    }

    setSubmitting(true);
    try {
      await apiClient(`/invites/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify({ name, password }),
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data?.message ?? 'Failed to accept invite');
      } else {
        setError('Failed to accept invite');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>{t('invite.validating')}</Typography>
      </Paper>
    );
  }

  if (validationError) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{t('invite.invalid')}</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
        <Button variant="outlined" onClick={() => router.push('/login')}>{t('auth.login')}</Button>
      </Paper>
    );
  }

  if (success) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{t('invite.welcome')}</Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('invite.accountCreated')}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/login')}>{t('auth.login')}</Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        {t('invite.joinCompany', { company: invite?.companyName ?? '' })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('invite.invitedAs', { role: invite?.role ?? '' })}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label={t('auth.email')}
          value={invite?.email ?? ''}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.yourName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('auth.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
        />
        <Button type="submit" variant="contained" fullWidth disabled={submitting}>
          {submitting ? t('invite.creatingAccount') : t('invite.createAccount')}
        </Button>
      </Box>
    </Paper>
  );
}
