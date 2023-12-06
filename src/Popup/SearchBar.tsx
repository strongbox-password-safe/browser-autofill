import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export enum SearchMode {
  Popup,
  InlineMenu,
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '5px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface SearchBarProps {
  handleSearchChange: (searchText: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setSearching: (loading: boolean) => void;
  autofocus: boolean;
  searchMode: SearchMode;
  onDismissButon?: (text: string) => void; 
}

export default function SearchBar(props: SearchBarProps) {
  const [searchText, setSearchText] = React.useState('');
  const [t] = useTranslation('global');

  const debouncedSearch = React.useRef(
    debounce((text: string) => {
      props.handleSearchChange(text);
    }, 300)
  ).current;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    searchChange(event.target.value);
  };

  const searchChange = (text: string) => {
    setSearchText(text);
    props.setLoading(true);

    if (text.trim() !== String()) {
      props.setSearching(true);
    } else {
      props.setSearching(false);
    }

    debouncedSearch(text);
  };

  const handleDismissClick = () => {
    searchChange(String());
    if (!searchText.trim() && props.onDismissButon) {
      props.onDismissButon(searchText.trim());
    }
  };

  return SearchMode.InlineMenu == props.searchMode ? (
    <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
      <SearchIcon style={{ marginRight: '10px' }} />
      <InputBase
        placeholder={t('search-bar.place-holder')}
        style={{ flex: 1 }}
        inputProps={{ 'aria-label': 'search' }}
        onChange={handleSearchChange}
        value={searchText}
        autoFocus={props.autofocus}
      />
      <IconButton sx={{ color: 'gray' }} onClick={handleDismissClick}>
        <CloseIcon />
      </IconButton>
    </Box>
  ) : (
    <Box sx={{ flexGrow: 1, paddingRight: '10px', paddingLeft: '10px' }}>
      <Search style={{ marginRight: '0px', marginLeft: 0 }}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder={t('search-bar.place-holder')}
          style={{ width: '100%' }}
          inputProps={{ 'aria-label': 'search' }}
          onChange={handleSearchChange}
          value={searchText}
          autoFocus={props.autofocus}
        />
      </Search>
    </Box>
  );
}
