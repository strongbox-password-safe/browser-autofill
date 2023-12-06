import React from 'react';
import IconButton from '@mui/material/IconButton';

import { FormControl, InputAdornment, OutlinedInput, InputLabel, Tooltip, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { useTranslation } from 'react-i18next';

interface CustomTextBoxProps {
  title: string;
  value: string;

  allowConceal?: boolean;
  allowCopy?: boolean;
  allowAutofill?: boolean;
  allowRedirect?: boolean;

  onCopy?: (value: string) => void;
  onAutofill?: (value: string) => void;
  onRedirect?: (value: string) => void;
}

function CustomTextBox({
  title,
  value,
  allowConceal = false,
  allowCopy = false,
  allowAutofill = false,
  allowRedirect = false,
  onCopy,
  onAutofill,
  onRedirect,
}: CustomTextBoxProps) {
  const [hideText, setHideText] = React.useState(allowConceal);
  const [isHovered, setIsHovered] = React.useState(false);
  const [t] = useTranslation('global');

  return (
    <FormControl variant="outlined" fullWidth onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <InputLabel>{title}</InputLabel>
      <OutlinedInput
        sx={{ input: { cursor: allowAutofill ? 'pointer' : 'text' } }}
        onClick={() => {
          if (allowAutofill) {
            
            onAutofill?.(value);
          }
        }}
        readOnly={true}
        value={value}
        error={value.length === 0 ? true : false}
        type={!hideText ? 'text' : 'password'}
        endAdornment={
          isHovered && (
            <>
              {allowConceal && (
                <Tooltip title={t('general.show-hide')} placement="top" arrow>
                  <Box sx={{ pt: 3, pb: 3 }}>
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label={t('general.show-hide')} edge="end" onClick={() => setHideText(hide => !hide)}>
                        {!hideText ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  </Box>
                </Tooltip>
              )}

              {allowRedirect && (
                <Tooltip title={t('general.launch-url')} placement="top" arrow>
                  <Box sx={{ pt: 3, pb: 3 }}>
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={t('general.launch-url')}
                        edge="end"
                        onClick={event => {
                          event.stopPropagation();
                          onRedirect?.(value);
                        }}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                    </InputAdornment>
                  </Box>
                </Tooltip>
              )}

              {allowCopy && (
                <Tooltip title={t('general.copy')} placement="top" arrow>
                  <Box sx={{ pt: 3, pb: 3 }}>
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={t('general.copy')}
                        edge="end"
                        onClick={event => {
                          event.stopPropagation();
                          onCopy?.(value);
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  </Box>
                </Tooltip>
              )}

              {allowAutofill && (
                <Tooltip title={t('general.autofill')} placement="top" arrow>
                  <Box sx={{ pt: 3, pb: 3 }}>
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={t('general.autofill')}
                        edge="end"
                        onClick={event => {
                          event.stopPropagation();
                          onAutofill?.(value);
                        }}
                      >
                        <ContentPasteGoIcon />
                      </IconButton>
                    </InputAdornment>
                  </Box>
                </Tooltip>
              )}
            </>
          )
        }
        label={title}
      />
    </FormControl>
  );
}

export default CustomTextBox;
