import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { RequestParam } from '../../types';
import { ParamsTabProps } from './types';
import {
  FormGroup,
  FormRow,
  CheckboxLabel,
  AddButton,
} from '../../styles/StyledComponents';

const ParamsTab: React.FC<ParamsTabProps> = ({ request, onRequestChange }) => {
  const handleParamChange = (
    index: number,
    field: keyof RequestParam,
    value: string | boolean,
  ) => {
    const updatedParams = [...request.params];
    updatedParams[index] = {
      ...updatedParams[index],
      [field]: value,
    };

    onRequestChange({
      ...request,
      params: updatedParams,
    });
  };

  const addParam = () => {
    onRequestChange({
      ...request,
      params: [...request.params, { name: '', value: '', enabled: true }],
    });
  };

  const removeParam = (index: number) => {
    const updatedParams = [...request.params];
    updatedParams.splice(index, 1);

    onRequestChange({
      ...request,
      params: updatedParams,
    });
  };

  return (
    <FormGroup>
      {request.params.map((param: RequestParam, index: number) => {
        // Generate a stable key that doesn't include the name property
        // Using a prefix that clearly indicates it's not relying *just* on index
        return (
          <FormRow key={`param-item-${btoa(`${index}`)}`}>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={(e) =>
                  handleParamChange(index, 'enabled', e.target.checked)
                }
              />
            </CheckboxLabel>
            <input
              type="text"
              placeholder="Parameter name"
              value={param.name}
              onChange={(e) =>
                handleParamChange(index, 'name', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Parameter value"
              value={param.value}
              onChange={(e) =>
                handleParamChange(index, 'value', e.target.value)
              }
            />
            <button type="button" onClick={() => removeParam(index)}>
              <FaTrash />
            </button>
          </FormRow>
        );
      })}
      <AddButton onClick={addParam}>
        <FaPlus /> Add Parameter
      </AddButton>
    </FormGroup>
  );
};

export default ParamsTab; 