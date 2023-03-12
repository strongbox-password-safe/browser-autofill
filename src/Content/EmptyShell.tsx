import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider, EmotionCache } from '@emotion/react';

export interface EmptyShellProps {
    shadowRootElement: HTMLElement;
    cache: EmotionCache;
}

export default function EmptyShell(props: EmptyShellProps) {
    const darkTheme = createTheme({
        palette: { mode: 'dark' },
        components: {
            MuiPopover: {
                defaultProps: {
                    container: props.shadowRootElement,
                },
            },
            MuiPopper: {
                defaultProps: {
                    container: props.shadowRootElement,
                },
            },
            MuiDialog: {
                defaultProps: {
                    container: props.shadowRootElement,
                },
            },
            MuiModal: {
                defaultProps: {
                    container: props.shadowRootElement,
                },
            },
        },
    });

    return (
        <CacheProvider value={props.cache}>
            <ThemeProvider theme={darkTheme}>
            </ThemeProvider >
        </CacheProvider>
    );
}