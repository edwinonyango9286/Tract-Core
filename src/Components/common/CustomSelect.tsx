import { Box, InputLabel, MenuItem, Select, Input, type SelectChangeEvent, Typography } from '@mui/material';
import { useState, useMemo, type FocusEvent } from "react";
import SearchIcon from '@mui/icons-material/Search';

interface Option {
  value?: string | number;
  label?: string;
}

interface CustomSelectProps {
  label: string;
  disabled?: boolean;
  name: string;
  id: string;
  value: string | number | null | undefined;
  onChange: (event: SelectChangeEvent<string | number>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  options?: Option[];
  searchable?: boolean;
  error?: boolean; 
  helperText?: string | boolean; 
}

const CustomSelect: React.FC<CustomSelectProps> = ({label, disabled = false, name,id,value,onChange,onBlur,options,searchable = false,  error = false, helperText }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options?.filter(option => 
      option?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSearchClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <Box sx={{ display:"flex", flexDirection:"column", gap:"6px"}}>
      <InputLabel sx={{ fontSize:"14px", fontWeight:"500", color:"#032541"}} 
        id={`${name}-label`}>
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        id={id}
        disabled={disabled}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        sx={{ 
          borderRadius:"8px",
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: error ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: error ? '#d32f2f' : '#333', 
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: error ? '#d32f2f' : '#333', 
            borderWidth: '1px',
          },
          '& .MuiSelect-select': {
            padding: '16.5px 14px',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiSelect-icon': {
            color: error ? '#d32f2f' : '#333',
          }
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
              marginTop: '8px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
          disableAutoFocusItem: true,
          MenuListProps: {
            sx: {
              paddingTop: 0,
            }
          }
        }}
        renderValue={(selected) => {
          if (!selected && selected !== 0) {
            return <span style={{ color: '#777', opacity: 0.7 }}>Select {label.toLowerCase()}</span>;
          }
          const selectedOption = options?.find(opt => opt.value === selected);
          return selectedOption?.label || selected;
        }}
      >
        {searchable && (
          <Box sx={{ padding: '8px 16px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
            <Input
              fullWidth
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={<SearchIcon sx={{ color: '#777', marginRight: '8px' }} />}
              sx={{ padding: '4px 8px', backgroundColor: 'white', borderRadius: '4px', '&:before, &:after': { border: 'none !important' }}}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={handleSearchClick}
              autoFocus
            />
          </Box>
        )}
        
        {filteredOptions?.length === 0 ? (
          <MenuItem disabled sx={{ padding: '10px 16px' }}>
            <Box sx={{ color: '#777', fontStyle: 'italic', textAlign: 'center', width: '100%'}}>
              No options available
            </Box>
          </MenuItem>
        ) : (
          filteredOptions?.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{
                padding: '10px 16px',
                '&:hover': {
                  backgroundColor: '#f0f7ff',
                },
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                }
              }}
            >
              {option.label}
            </MenuItem>
          ))
        )}
      </Select>
     {error && helperText && (<Typography sx={{ color: '#d32f2f', fontSize:"12px",  }}>{helperText}</Typography>)}
     </Box>
  );
};

export default CustomSelect;