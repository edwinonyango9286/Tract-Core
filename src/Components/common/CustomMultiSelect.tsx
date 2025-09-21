import { Box, InputLabel, MenuItem, Select, Input, Chip, type SelectChangeEvent } from '@mui/material';
import { useState, useMemo, type FocusEvent } from "react";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface Option {
  value: string | number;
  label: string;
}

interface CustomMultiSelectProps {
  label: string;
  disabled?: boolean;
  name: string;
  id: string;
  value: (string | number)[];
  onChange: (event: SelectChangeEvent<(string | number)[]>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  options: Option[];
  searchable?: boolean;
  maxChips?: number; 
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({label,disabled = false,name, id,value, onChange,onBlur,options,searchable = false, maxChips = 3}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSearchClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  const handleChipDelete = (valueToDelete: string | number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== valueToDelete);
    const syntheticEvent = {
      target: { value: newValue, name }
    } as SelectChangeEvent<(string | number)[]>;
    onChange(syntheticEvent);
  };

  const getSelectedLabels = () => {
    return value.map(val => {
      const option = options.find(opt => opt.value === val);
      return option?.label || val.toString();
    });
  };

  const renderValue = (selected: (string | number)[]) => {
    if (!selected || selected.length === 0) {
      return <span style={{ color: '#777', opacity: 0.7 }}>Select {label.toLowerCase()}</span>;
    }

    const selectedLabels = getSelectedLabels();
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '100%' }}>
        {selectedLabels.slice(0, maxChips).map((label, index) => (
          <Chip
            key={selected[index]}
            label={label}
            size="small"
            onDelete={handleChipDelete(selected[index])}
            deleteIcon={<CloseIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              height: '24px',
              fontSize: '0.75rem',
              backgroundColor: '#e3f2fd',
              '& .MuiChip-deleteIcon': {
                fontSize: '16px',
                color: '#666',
                '&:hover': {
                  color: '#333'
                }
              }
            }}
          />
        ))}
        {selectedLabels.length > maxChips && (
          <Chip
            label={`+${selectedLabels.length - maxChips} more`}
            size="small"
            sx={{
              height: '24px',
              fontSize: '0.75rem',
              backgroundColor: '#f5f5f5',
              color: '#666'
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box  sx={{ width:"100%", display:"flex", gap:"4px", flexDirection:"column"}} >
      <InputLabel sx={{ fontSize:"14px", color: '#032541', fontWeight:"500",}}>
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        id={id}
        disabled={disabled}
        name={name}
        multiple
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        sx={{ 
            borderRadius:"8px",
            width:"100%",
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#333', 
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#333', 
            borderWidth: '1px',
          },
          '& .MuiSelect-select': {
            padding: '16.5px 14px',
            display: 'flex',
            alignItems: 'center',
            minHeight: '1.4375em',
          },
          '& .MuiSelect-icon': {
            color: '#333',
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
        renderValue={renderValue}
      >
        {searchable && (
          <Box sx={{ 
            padding: '8px 16px', 
            borderBottom: '1px solid #eee',
            backgroundColor: '#f9f9f9',
          }}>
            <Input
              fullWidth
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startAdornment={<SearchIcon sx={{ color: '#777', marginRight: '8px' }} />}
              sx={{ 
                padding: '4px 8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                '&:before, &:after': { border: 'none !important' }
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={handleSearchClick}
              autoFocus
            />
          </Box>
        )}
        
        {filteredOptions.length === 0 ? (
          <MenuItem disabled sx={{ padding: '10px 16px' }}>
            <Box sx={{ color: '#777', fontStyle: 'italic', textAlign: 'center', width: '100%'}}>
              No options available
            </Box>
          </MenuItem>
        ) : (
          filteredOptions.map((option) => (
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
    </Box>
  );
};

export default CustomMultiSelect;