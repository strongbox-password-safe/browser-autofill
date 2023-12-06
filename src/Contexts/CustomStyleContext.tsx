import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsStore } from '../Settings/SettingsStore';
import { FontSize, LightOrDarkAppearance, Spacing } from '../Settings/Settings';
import { IframeMessageTypes } from '../Content/Iframe/iframeManager';
import { Utils } from '../Utils';
import { tooltipClasses } from '@mui/material';

interface ThemeContextType {
  getCustomStyle: (components?: object | null) => object;
  darkMode: boolean;
  systemMode: boolean;
  fontSize: FontSize;
  toggleDarkMode: (isDark: boolean) => void;
  setFontSize: (fontSize: FontSize) => void;
  setSpacing: (spacing: Spacing) => void;
  switchToSystemMode: () => void;
}

const CustomStyleContext = createContext<ThemeContextType | undefined>(undefined);

export function useCustomStyle() {
  const context = useContext(CustomStyleContext);
  if (!context) {
    throw new Error('useCustomStyle must be used within a CustomStyleProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function CustomStyleProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [systemMode, setSystemMode] = useState(true);
  const [fontSize, setFontSize] = useState(FontSize.medium);
  const [spacing, setSpacing] = useState(Spacing.medium);

  const theme = {
    palette: { mode: 'light' },
    spacing: spacing,
    typography: {
      htmlFontSize: fontSize as number,
    },
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            [`.${tooltipClasses.popper}[data-popper-placement*="right"] &`]: {
              marginLeft: '1px',
            },
          },
        },
      },
    },
  };

  React.useEffect(() => {
    initializeStyles();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (event.matches && systemMode) {
        setDarkMode(true);
        addColorSchemeTag(true);
      } else if (systemMode) {
        setDarkMode(false);
        addColorSchemeTag(false);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [systemMode]);

  const getCustomStyle = () => {
    systemMode
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? (theme.palette.mode = 'dark')
        : (theme.palette.mode = 'light')
      : darkMode
      ? (theme.palette.mode = 'dark')
      : (theme.palette.mode = 'light');

    theme.typography.htmlFontSize = parseInt(fontSize.toString());
    theme.spacing = spacing;

    return theme;
  };

  const toggleDarkMode = (isDark: boolean) => {
    setDarkMode(isDark);
    addColorSchemeTag(isDark);
    setSystemMode(false);
  };

  const switchToSystemMode = () => {
    setSystemMode(true);
  };

  const initializeStyles = async () => {
    const stored = await SettingsStore.getSettings();

    
    switch (stored.lightOrDarkAppearance) {
      case LightOrDarkAppearance.dark:
      case LightOrDarkAppearance.light:
        toggleDarkMode(stored.lightOrDarkAppearance == LightOrDarkAppearance.dark);
        addColorSchemeTag(stored.lightOrDarkAppearance == LightOrDarkAppearance.dark);
        break;
      case LightOrDarkAppearance.system:
        toggleDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        addColorSchemeTag(window.matchMedia('(prefers-color-scheme: dark)').matches);
        switchToSystemMode();
        break;
    }

    
    setFontSize(stored.fontSize as FontSize);

    
    setSpacing(stored.spacing as Spacing);
  };

  const addColorSchemeTag = (isDark: boolean) => {
    if (Utils.isFirefox()) {
      removeColorSchemeTag();

      const metaTag = document.createElement('meta');
      metaTag.name = 'color-scheme';
      metaTag.content = isDark ? 'dark' : 'light';
      const head = document.head || document.getElementsByTagName('head')[0];
      head.appendChild(metaTag);

      parent.postMessage({ type: IframeMessageTypes.colorSchemeChanged, data: isDark ? 'dark' : 'light' }, '*');
    }
  };

  const removeColorSchemeTag = () => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const metaTag = document.querySelector('meta[name="color-scheme"]');

    if (metaTag) {
      head.removeChild(metaTag);
    }
  };

  const contextValue = {
    getCustomStyle,
    darkMode,
    toggleDarkMode,
    setFontSize,
    setSpacing,
    systemMode,
    switchToSystemMode,
    fontSize,
  };

  return <CustomStyleContext.Provider value={contextValue}>{children}</CustomStyleContext.Provider>;
}
