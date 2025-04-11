import styled, { css, keyframes } from 'styled-components';

// Color palette inspired by Airbnb but adapted for dark mode
const colors = {
  background: {
    primary: '#121212',
    secondary: '#1a1a1a',
    tertiary: '#252525',
    elevated: '#2c2c2c',
    glass: 'rgba(30, 30, 35, 0.7)',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    focused: 'rgba(255, 255, 255, 0.25)',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  accent: {
    primary: '#7367f0', // Purple accent
    primaryHover: '#8e85f2',
    secondary: '#ce9ffc', // Light purple
    secondaryHover: '#d9b7fe',
    blue: '#0A84FF',
    purple: '#AF52DE',
    yellow: '#FFCC00',
    orange: '#FF9500',
    gradient: 'linear-gradient(135deg, #7367f0, #ce9ffc)', // Gradient accent
  },
  method: {
    get: '#7367f0', // Changed to match our theme
    post: '#00A699',
    put: '#FF9500',
    delete: '#FF385C',
    patch: '#AF52DE',
    options: '#767676',
    head: '#FF7D1A',
  },
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFCC00',
  },
  shadow: {
    soft: '0 8px 32px rgba(0, 0, 0, 0.2)',
    medium: '0 12px 20px rgba(0, 0, 0, 0.3)',
  },
};

// Typography
const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontWeights: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const inputStyle = css`
  background-color: ${colors.background.elevated};
  color: ${colors.text.primary};
  border: 1px solid ${colors.border.light};
  border-radius: 8px;
  padding: 10px 12px;
  font-family: ${typography.fontFamily};
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.border.focused};
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }

  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const buttonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeights.medium};
  font-size: 14px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const primaryButtonStyle = css`
  ${buttonStyle}
  background-color: ${colors.accent.primary};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${colors.accent.primaryHover};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const secondaryButtonStyle = css`
  ${buttonStyle}
  background-color: transparent;
  color: ${colors.text.primary};
  border: 1px solid ${colors.border.medium};

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// Main app container
export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  color: ${colors.text.primary};
  background-color: ${colors.background.primary};
  font-family: ${typography.fontFamily};
`;

// Sidebar
export const Sidebar = styled.div`
  width: 300px;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  border-right: 1px solid ${colors.border.light};
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
  height: 100vh;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: ${colors.shadow.soft};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(circle at top right, rgba(115, 103, 240, 0.05), transparent 60%);
    pointer-events: none;
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 250px;
    border-right: none;
    border-bottom: 1px solid ${colors.border.light};
  }
`;

export const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: -3px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 100;
  background-color: transparent;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    background-color: ${colors.accent.primary}40;
  }

  &.active {
    background-color: ${colors.accent.primary};
  }
`;

export const SidebarHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.border.light};
  background: ${colors.background.glass};
  backdrop-filter: blur(10px);
  border-radius: 0;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.6rem;
  color: ${colors.text.primary};
  letter-spacing: -0.5px;

  svg {
    margin-right: 12px;
    color: ${colors.accent.primary};
    filter: drop-shadow(0 0 8px rgba(115, 103, 240, 0.5));
  }
`;

export const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

export const CollectionList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  margin-top: 24px;
`;

export const CollectionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  color: ${colors.text.secondary};
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 14px;
  background: rgba(30, 30, 35, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${colors.accent.gradient};
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    background: rgba(40, 40, 45, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
  }

  &:hover .action-button {
    opacity: 0.8;
  }

  &.active {
    background: rgba(30, 30, 40, 0.6);
    color: ${colors.text.primary};
    border-color: rgba(115, 103, 240, 0.3);
    
    &::before {
      opacity: 1;
    }
  }

  svg {
    margin-right: 12px;
    font-size: 16px;
    opacity: 0.9;
    color: ${colors.accent.primary};
  }
`;

export const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: rgba(30, 30, 35, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 6px;
  font-weight: 500;
  
  &:hover {
    background: rgba(40, 40, 45, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:hover .action-button {
    opacity: 0.8;
  }
  
  svg {
    color: ${colors.accent.primary};
    margin-right: 8px;
  }
`;

export const RequestItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover {
    background: rgba(40, 40, 45, 0.3);
  }
  
  &:hover .action-button {
    opacity: 0.8;
  }
  
  svg {
    margin-right: 8px;
  }
`;

export const RequestItemContainer = styled.div<{ active?: boolean }>`
  cursor: pointer;
  margin: 4px 0;
  border-radius: 8px;
  background: ${(props) => props.active ? 'rgba(30, 30, 40, 0.6)' : 'rgba(25, 25, 30, 0.3)'};
  border: 1px solid ${(props) => props.active ? 'rgba(115, 103, 240, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${colors.accent.gradient};
    opacity: ${(props) => props.active ? 1 : 0};
    transition: opacity 0.2s;
  }
  
  &[data-active="true"], &[data-active=""] {
    background: rgba(30, 30, 40, 0.6);
    border-color: rgba(115, 103, 240, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:hover {
    background: rgba(35, 35, 45, 0.5);
    border-color: rgba(115, 103, 240, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 0.7;
    }
  }
`;

// Main content
export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${colors.background.primary};
  animation: ${fadeIn} 0.3s ease;
`;

// Home page styles
export const FeatureCard = styled.div`
  background-color: ${colors.background.secondary};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid ${colors.border.light};
  
  h3 {
    display: flex;
    align-items: center;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 18px;
    color: ${colors.text.primary};
  }
  
  p {
    color: ${colors.text.secondary};
    margin-bottom: 15px;
    font-size: 14px;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    border-color: ${colors.border.medium};
  }
  
  button.primary-button {
    ${primaryButtonStyle}
    height: 36px;
  }
  
  button.secondary-button {
    ${secondaryButtonStyle}
    height: 36px;
  }
  
  button.text-button {
    ${buttonStyle}
    background: transparent;
    color: ${colors.text.secondary};
    padding: 6px 12px;
    
    &:hover {
      color: ${colors.text.primary};
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
`;

export const RequestResponseContainer = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  overflow: hidden;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

export const RequestContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  border-right: 1px solid ${colors.border.light};
  overflow: hidden;

  @media (max-width: 1200px) {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid ${colors.border.light};
  }
`;

export const StatusBar = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  background-color: ${colors.background.secondary};
  border-top: 1px solid ${colors.border.light};
  font-size: 12px;
  color: ${colors.text.tertiary};
  justify-content: space-between;
`;

export const StatusBarItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;

  svg {
    margin-right: 6px;
    font-size: 14px;
  }
`;

export const RequestHeader = styled.div`
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid ${colors.border.light};
  align-items: center;
  background-color: ${colors.background.secondary};
`;

export const UrlContainer = styled.div`
  position: relative;
  flex: 1;
  margin-right: 8px;
  display: flex;
  align-items: center;
  background-color: ${colors.background.elevated};
  border-radius: 8px;
  border: 1px solid ${colors.border.light};
  overflow: hidden;
`;

export const MethodSelector = styled.select`
  background-color: transparent;
  color: ${colors.text.secondary};
  padding: 8px 12px;
  font-weight: ${typography.fontWeights.bold};
  width: auto;
  min-width: 90px;
  font-size: 13px;
  cursor: pointer;
  appearance: none;
  border: none;
  border-right: 1px solid ${colors.border.light};
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 8px top 50%;
  background-size: 8px auto;

  option {
    background-color: ${colors.background.tertiary};
    color: ${colors.text.primary};
    padding: 8px;
  }

  &:focus {
    outline: none;
  }

  &[value='GET'] {
    color: ${colors.method.get};
  }

  &[value='POST'] {
    color: ${colors.method.post};
  }

  &[value='PUT'] {
    color: ${colors.method.put};
  }

  &[value='DELETE'] {
    color: ${colors.method.delete};
  }

  &[value='PATCH'] {
    color: ${colors.method.patch};
  }

  &[value='OPTIONS'] {
    color: ${colors.method.options};
  }

  &[value='HEAD'] {
    color: ${colors.method.head};
  }
`;

export const UrlInput = styled.input<{ hasProtocol?: boolean }>`
  flex: 1;
  background-color: transparent;
  color: ${colors.text.primary};
  border: none;
  padding: 10px 12px;
  font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  
  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

export const SendButton = styled.button`
  ${primaryButtonStyle}
  height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

export const ResponseContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${colors.background.secondary};
  border-left: 1px solid ${colors.border.light};
  overflow: hidden;
`;

export const ResponseHeader = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
  background-color: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.light};
  gap: 12px;
  padding: 0 16px;
`;

export const StatusPill = styled.div<{ success: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 13px;
  background-color: ${({ success }) =>
    success ? 'rgba(0, 192, 127, 0.15)' : 'rgba(255, 58, 48, 0.15)'};
  color: ${({ success }) =>
    success ? colors.status.success : colors.status.error};
`;

export const ResponseMetric = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${colors.text.secondary};
`;

export const ResponseTabs = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  background-color: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.light};
  padding-left: 8px;
`;

export const ResponseTab = styled.div<{ active: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 13px;
  cursor: pointer;
  color: ${({ active }) =>
    active ? colors.text.primary : colors.text.tertiary};
  border-bottom: 2px solid
    ${({ active }) => (active ? colors.accent.primary : 'transparent')};

  &[data-active="true"] {
    color: ${colors.text.primary};
    border-bottom: 2px solid ${colors.accent.primary};
  }

  &:hover {
    color: ${colors.text.primary};
    background-color: ${colors.background.tertiary};
  }
`;

export const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${colors.background.primary};
`;

export const ResponseBody = styled.div`
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  overflow: auto;
  height: 100%;
  color: ${colors.text.primary};
`;

export const JSONValue = styled.span<{ type: string }>`
  color: ${({ type }) => {
    switch (type) {
      case 'string':
        return '#FF70F9';
      case 'number':
        return '#FFC641';
      case 'boolean':
        return '#FF9500';
      case 'null':
        return '#FF453A';
      case 'key':
        return '#67F9B1';
      default:
        return colors.text.secondary;
    }
  }};
`;

export const KeyValue = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;

  strong {
    min-width: 120px;
    color: #67f9b1;
  }

  span {
    color: #ff70f9;
    word-break: break-all;
  }
`;

// Environment selector in header area
export const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.light};
  padding: 8px 16px;
`;

export const EnvironmentSelector = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 16px;

  select {
    ${inputStyle}
    height: 32px;
    padding: 0 32px 0 12px;
    cursor: pointer;
    min-width: 150px;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 12px top 50%;
    background-size: 10px auto;
  }
`;

export const TabContainer = styled.div`
  background-color: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.light};
`;

export const TabList = styled.div`
  display: flex;
  padding: 0 16px;
`;

export const Tab = styled.div<{ active: boolean }>`
  padding: 12px 16px;
  margin-right: 8px;
  cursor: pointer;
  position: relative;
  color: ${(props) =>
    props.active ? colors.text.primary : colors.text.tertiary};
  font-weight: ${typography.fontWeights.medium};
  transition: color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${(props) =>
      props.active ? colors.accent.primary : 'transparent'};
    border-radius: 3px 3px 0 0;
    transition: background-color 0.2s ease;
  }

  &:hover {
    color: ${colors.text.primary};
  }
`;

export const ResponseStats = styled.div`
  font-size: 13px;
  color: ${colors.text.tertiary};

  span {
    margin-left: 16px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px;
  gap: 12px;
`;

export const FormRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  margin-bottom: 8px;

  input[type='text'] {
    flex: 1;
    padding: 10px 12px;
    border-radius: 4px;
    border: 1px solid ${colors.border.light};
    background-color: ${colors.background.primary};
    color: ${colors.text.primary};
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: ${colors.accent.primary};
      box-shadow: 0 0 0 2px ${colors.accent.secondary}40;
    }
  }

  button {
    background: transparent;
    border: none;
    color: ${colors.text.tertiary};
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      color: ${colors.status.error};
      background-color: rgba(255, 70, 70, 0.1);
    }
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px;

  input {
    margin: 0;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

export const TextArea = styled.textarea`
  ${inputStyle}
  width: 100%;
  height: 200px;
  resize: vertical;
  border-radius: 8px;
  font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
  line-height: 1.5;
`;

export const AddButton = styled.button`
  ${secondaryButtonStyle}
  color: ${colors.text.primary};
  border: 1px solid ${colors.border.light};
  padding: 8px 12px;
  margin-top: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: ${typography.fontWeights.medium};
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;

  svg {
    color: ${colors.accent.primary};
    font-size: 15px;
    margin-right: 6px;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: ${colors.border.medium};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: ${colors.text.tertiary};
  animation:
    ${fadeIn} 0.5s ease-out,
    ${slideIn} 0.5s ease-out;

  svg {
    font-size: 64px;
    margin-bottom: 24px;
    color: ${colors.accent.primary};
    opacity: 0.9;
    animation: ${fadeIn} 0.8s ease-out;
  }

  h3 {
    font-size: 28px;
    font-weight: ${typography.fontWeights.bold};
    margin-bottom: 16px;
    color: ${colors.text.primary};
    letter-spacing: -0.5px;
  }

  p {
    max-width: 500px;
    margin-bottom: 32px;
    font-size: 16px;
    line-height: 1.6;
    color: ${colors.text.secondary};
  }

  button {
    font-weight: ${typography.fontWeights.medium};
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    
    svg {
      font-size: 18px;
      margin: 0;
    }
  }
`;

export const Badge = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  background-color: ${(props) => props.color};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: ${typography.fontWeights.medium};
  padding: 2px 8px;
  opacity: 0.9;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${colors.background.elevated};
  color: ${colors.text.primary};
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: ${colors.shadow.soft};
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

export const TooltipTrigger = styled.div`
  position: relative;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;

export const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${colors.border.medium};
  border-top-color: ${colors.accent.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const SettingsButton = styled.button`
  ${secondaryButtonStyle}
  width: 32px;
  height: 32px;
  border-radius: 6px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;

  svg {
    font-size: 16px;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const GlobalStyles = css`
  :root {
    color-scheme: dark;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${typography.fontFamily};
    background-color: ${colors.background.primary};
    color: ${colors.text.primary};
    overflow: hidden;
  }

  * {
    box-sizing: border-box;
  }

  code {
    font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
  }
  
  .primary-button {
    ${primaryButtonStyle}
  }
  
  .secondary-button {
    ${secondaryButtonStyle}
    background-color: transparent;
    border: 1px solid ${colors.border.medium};
    color: ${colors.text.secondary};
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      transform: translateY(-1px);
    }
    
    svg {
      font-size: 18px;
      margin-right: 8px;
      color: ${colors.text.primary};
    }
  }
`;

export const CollectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CollectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
`;

export const CollectionTitle = styled.div`
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.text.secondary};
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.tertiary};
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;
  
  &:hover {
    background: ${colors.background.elevated};
    color: ${colors.text.primary};
    opacity: 1;
  }
`;

export const CollectionItemContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${colors.accent.gradient};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const CreatePanel = styled.div`
  position: absolute;
  right: 18px;
  top: 42px;
  background-color: ${colors.background.elevated};
  border-radius: 8px;
  border: 1px solid ${colors.border.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 220px;
  z-index: 100;
  overflow: hidden;
  padding: 6px;
`;

export const CreatePanelHeader = styled.div`
  color: ${colors.text.tertiary};
  font-size: 12px;
  font-weight: ${typography.fontWeights.medium};
  padding: 6px 8px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CreatePanelItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: none;
  color: ${colors.text.primary};
  border-radius: 6px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  gap: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 16px;
    color: ${colors.text.secondary};
  }

  .shortcut {
    margin-left: auto;
    color: ${colors.text.tertiary};
    font-size: 12px;
  }
`;

export const CollapsibleSection = styled.div<{ expanded?: boolean }>`
  margin-bottom: 10px;
  
  &[data-expanded="true"] {
    /* Any styles specific to expanded state can go here */
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  margin-top: 16px;
  color: ${colors.text.secondary};
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:first-of-type {
    margin-top: 0;
  }
  
  svg {
    color: ${colors.accent.primary};
    margin-right: 8px;
  }
`;

export const HistoryItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  margin: 2px 0;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${colors.background.elevated};
    transform: translateX(4px);
  }
`;

export const HistoryItemsContainer = styled.div`
  padding: 8px 12px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

export const EmptyHistoryMessage = styled.div`
  padding: 16px;
  color: ${colors.text.tertiary};
  font-style: italic;
  font-size: 14px;
  text-align: center;
`;

export const ClearHistoryButton = styled.button`
  background: none;
  border: none;
  color: ${colors.text.tertiary};
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  
  &:hover {
    color: ${colors.text.primary};
  }
`;

export const FooterButton = styled.button`
  ${secondaryButtonStyle}
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  
  &:hover {
    background-color: ${colors.background.elevated};
  }
`;

export const ThemeToggle = styled.button`
  ${secondaryButtonStyle}
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ContextMenu = styled.div`
  position: absolute;
  z-index: 100;
  background-color: ${colors.background.elevated};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-width: 180px;
  animation: ${fadeIn} 0.15s ease;
  border: 1px solid ${colors.border.medium};
  padding: 6px;
`;

export const ContextMenuItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${colors.text.secondary};
  transition: all 0.15s ease;
  gap: 8px;
  border-radius: 4px;

  svg {
    font-size: 16px;
    color: ${colors.text.tertiary};
  }

  &:hover {
    background-color: ${colors.background.tertiary};
    color: ${colors.text.primary};

    svg {
      color: ${colors.text.primary};
    }
  }

  &.danger {
    color: ${colors.status.error};

    svg {
      color: ${colors.status.error};
    }

    &:hover {
      background-color: rgba(255, 58, 48, 0.1);
    }
  }
`;

export const ContextMenuDivider = styled.div`
  height: 1px;
  background-color: ${colors.border.light};
  margin: 4px 0;
`;

export const SidebarFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${colors.background.glass};
  backdrop-filter: blur(10px);
  border-top: 1px solid ${colors.border.light};
  margin-top: auto;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: rgba(40, 40, 50, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: ${colors.text.secondary};
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &:hover {
      background-color: rgba(60, 60, 70, 0.6);
      color: ${colors.accent.primary};
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.15);
    }
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  margin: 16px 16px 8px;
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.tertiary};
`;

export const SearchInput = styled.input`
  ${inputStyle}
  width: 100%;
  padding-left: 36px;
  height: 36px;
  font-size: 13px;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: ${colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);

  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: ${typography.fontWeights.semiBold};
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
`;

export const InputGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    color: ${colors.text.secondary};
    font-size: 14px;
  }

  input,
  select {
    ${inputStyle}
    width: 100%;
  }

  select {
    height: 40px;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 12px top 50%;
    background-size: 10px auto;
    padding-right: 32px;
  }
`;

export const Button = styled.button`
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 6px 12px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #333;
  }
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

export const MethodBadge = styled.span<{ method: string }>`
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${({ method }) => {
    const m = method.toUpperCase();
    switch (m) {
      case 'GET': return 'rgba(115, 103, 240, 0.15)';
      case 'POST': return 'rgba(0, 166, 153, 0.15)';
      case 'PUT': return 'rgba(255, 149, 0, 0.15)';
      case 'DELETE': return 'rgba(255, 56, 92, 0.15)';
      case 'PATCH': return 'rgba(175, 82, 222, 0.15)';
      case 'OPTIONS': return 'rgba(118, 118, 118, 0.15)';
      case 'HEAD': return 'rgba(255, 125, 26, 0.15)';
      default: return 'rgba(118, 118, 118, 0.15)';
    }
  }};
  color: ${({ method }) => {
    const m = method.toUpperCase();
    switch (m) {
      case 'GET': return colors.method.get;
      case 'POST': return colors.method.post;
      case 'PUT': return colors.method.put;
      case 'DELETE': return colors.method.delete;
      case 'PATCH': return colors.method.patch;
      case 'OPTIONS': return colors.method.options;
      case 'HEAD': return colors.method.head;
      default: return colors.text.tertiary;
    }
  }};
  margin-right: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;