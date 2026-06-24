'use client';

import { useLocale } from 'next-intl';
import { IconButton, Tooltip } from '@mui/material';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const nextLocale = locale === 'en' ? 'ro' : 'en';
  const label = locale === 'en' ? 'RO' : 'EN';

  const switchLocale = () => {
    document.cookie = `locale=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  return (
    <Tooltip title={`Switch to ${nextLocale.toUpperCase()}`}>
      <IconButton
        onClick={switchLocale}
        size="small"
        sx={{
          fontSize: 13,
          fontWeight: 700,
          color: 'inherit',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          px: 1,
          py: 0.25,
        }}
      >
        {label}
      </IconButton>
    </Tooltip>
  );
}
