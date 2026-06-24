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
import type { InviteValidationResponse } from '@recharge/shared';

export default function InviteAcceptPage() {
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
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
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
        <Typography variant="body2" sx={{ mt: 2 }}>Validating invite...</Typography>
      </Paper>
    );
  }

  if (validationError) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Invalid Invite</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
        <Button variant="outlined" onClick={() => router.push('/login')}>Go to Login</Button>
      </Paper>
    );
  }

  if (success) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Welcome!</Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Your account has been created. You can now log in.
        </Alert>
        <Button variant="contained" onClick={() => router.push('/login')}>Log In</Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Join {invite?.companyName}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You&apos;ve been invited as {invite?.role}. Set up your account below.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          value={invite?.email ?? ''}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
        />
        <Button type="submit" variant="contained" fullWidth disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Box>
    </Paper>
  );
}
