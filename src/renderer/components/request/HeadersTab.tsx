import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { RequestHeader } from '../../types';
import { HeadersTabProps } from './types';
import {
  FormGroup,
  FormRow,
  CheckboxLabel,
  AddButton,
} from '../../styles/StyledComponents';

const HeadersTab: React.FC<HeadersTabProps> = ({ request, onRequestChange }) => {
  const handleHeaderChange = (
    index: number,
    field: keyof RequestHeader,
    value: string | boolean,
  ) => {
    // Ensure headers is an array before attempting to spread it
    const currentHeaders = Array.isArray(request.headers) ? request.headers : [];
    const updatedHeaders = [...currentHeaders];
    
    updatedHeaders[index] = {
      ...updatedHeaders[index],
      [field]: value,
    };

    onRequestChange({
      ...request,
      headers: updatedHeaders,
    });
  };

  const addHeader = () => {
    // Ensure headers is an array before attempting to spread it
    const currentHeaders = Array.isArray(request.headers) ? request.headers : [];
    
    onRequestChange({
      ...request,
      headers: [...currentHeaders, { name: '', value: '', enabled: true }],
    });
  };

  const removeHeader = (index: number) => {
    // Ensure headers is an array before attempting to spread it
    const currentHeaders = Array.isArray(request.headers) ? request.headers : [];
    const updatedHeaders = [...currentHeaders];
    updatedHeaders.splice(index, 1);

    onRequestChange({
      ...request,
      headers: updatedHeaders,
    });
  };

  return (
    <FormGroup>
      {Array.isArray(request.headers) && request.headers.map((header: RequestHeader, index: number) => {
        // Generate a stable key that doesn't include the name property
        // Using a prefix that clearly indicates it's not relying *just* on index
        return (
          <FormRow key={`header-item-${btoa(`${index}`)}`}>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) =>
                  handleHeaderChange(index, 'enabled', e.target.checked)
                }
              />
            </CheckboxLabel>
            <input
              type="text"
              placeholder="Header name"
              value={header.name}
              onChange={(e) =>
                handleHeaderChange(index, 'name', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Header value"
              value={header.value}
              onChange={(e) =>
                handleHeaderChange(index, 'value', e.target.value)
              }
            />
            <button type="button" onClick={() => removeHeader(index)}>
              <FaTrash />
            </button>
          </FormRow>
        );
      })}
      <AddButton onClick={addHeader}>
        <FaPlus /> Add Header
      </AddButton>
    </FormGroup>
  );
};

export default HeadersTab; 