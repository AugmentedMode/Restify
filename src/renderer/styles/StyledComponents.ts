import styled, { css, keyframes } from 'styled-components';

// Color palette inspired by Airbnb but adapted for dark mode
const colors = {
  background: {
    primary: '#121212',
    secondary: '#1e1e1e',
    tertiary: '#252525',
    elevated: '#2c2c2c',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
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
    primary: '#FF385C', // Airbnb red
    primaryHover: '#FF5A76',
    secondary: '#00A699', // Turquoise
    secondaryHover: '#00C2B3',
    blue: '#0A84FF',
    purple: '#AF52DE',
    yellow: '#FFCC00',
    orange: '#FF9500',
  },
  method: {
    get: '#0A84FF',
    post: '#00A699',
    put: '#FF9500',
    delete: '#FF385C',
    patch: '#AF52DE',
    options: '#767676',
    head: '#FF7D1A',
  },
  status: {
    success: '#00C07F',
    error: '#FF3A30',
    warning: '#FFCC00',
  },
  shadow: {
    soft: '0 4px 12px rgba(0, 0, 0, 0.4)',
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
  width: 270px;
  background:
    radial-gradient(125% 72% at -18% -12%, rgba(255, 90, 126, 0.14), transparent 58%),
    radial-gradient(115% 88% at 118% 108%, rgba(255, 136, 94, 0.12), transparent 60%),
    linear-gradient(180deg, #18181c 0%, #141418 45%, #101115 100%);
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
  height: 100vh;
  transition: width 0.3s ease;
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.03),
    14px 0 42px rgba(0, 0, 0, 0.34);

  &.dark-theme {
    --sidebar-bg: #15161a;
    --sidebar-border: rgba(255, 255, 255, 0.1);
    --sidebar-text: #ffffff;
    --sidebar-text-secondary: rgba(223, 223, 233, 0.74);
    --sidebar-hover: #23242a;

    background-color: var(--sidebar-bg);
    border-color: var(--sidebar-border);
    color: var(--sidebar-text);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.07) 0%,
        rgba(255, 255, 255, 0.02) 13%,
        rgba(255, 255, 255, 0) 26%
      ),
      radial-gradient(circle at 14% 18%, rgba(255, 96, 138, 0.16), transparent 24%);
    opacity: 0.5;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 170, 122, 0.32) 0%,
      rgba(255, 108, 150, 0.26) 40%,
      rgba(255, 255, 255, 0.14) 100%
    );
    opacity: 0.45;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.14);
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.26);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 250px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 56, 92, 0.35);
  }

  &.active {
    background-color: rgba(255, 120, 150, 0.78);
  }
`;

export const SidebarHeader = styled.div`
  padding: 18px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.015)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: ${typography.fontWeights.bold};
  font-size: 18px;
  color: rgba(245, 245, 250, 0.96);
  letter-spacing: 0.01em;
  font-family: 'Space Grotesk', 'Avenir Next', 'Segoe UI', sans-serif;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);

  svg {
    color: #ffe8d2;
  }
`;

export const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 0 6px;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.16);
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.28);
    }
  }
`;

export const CollectionList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
  margin-top: 24px;
`;

export const CollectionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  color: ${colors.text.secondary};
  transition: background-color 0.2s ease;
  font-size: 14px;

  &:hover {
    background-color: ${colors.background.tertiary};
  }

  &:hover .action-button {
    opacity: 0.8;
  }

  &.active {
    background-color: ${colors.background.tertiary};
    color: ${colors.text.primary};
  }

  svg {
    margin-right: 8px;
    font-size: 14px;
    opacity: 0.7;
  }
`;

export const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 7px 10px;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: ${typography.fontWeights.medium};
  color: rgba(228, 229, 236, 0.86);
  transition: all 0.15s ease;
  letter-spacing: 0.01em;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.16);
  }

  &:hover .action-button {
    opacity: 1;
  }
`;

export const RequestItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 9px;
  overflow: hidden;
  color: rgba(211, 213, 222, 0.8);
  border: 1px solid transparent;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.14);
  }

  &:hover .action-button {
    opacity: 1;
  }
`;

export const RequestItemContainer = styled.div<{ active?: boolean }>`
  cursor: pointer;
  margin: 2px 0;
  border-radius: 10px;
  background-color: ${(props) =>
    props.active ? 'rgba(255, 56, 92, 0.15)' : 'transparent'};
  border: 1px solid ${(props) =>
    props.active ? 'rgba(255, 115, 146, 0.34)' : 'transparent'};
  transition: all 0.15s ease;

  &[data-active="true"], &[data-active=""] {
    background-color: rgba(255, 56, 92, 0.15);
    border-color: rgba(255, 115, 146, 0.34);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
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
  color: rgba(197, 200, 212, 0.82);
`;

export const CollectionTitle = styled.div`
  font-weight: ${typography.fontWeights.semiBold};
  font-size: 13px;
  color: rgba(222, 224, 234, 0.84);
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ActionButton = styled.button`
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(176, 182, 199, 0.76);
  width: 22px;
  height: 22px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #f1f3fb;
    opacity: 1;
  }
`;

export const CollectionItemContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const CreateButton = styled.button`
  ${secondaryButtonStyle}
  color: ${colors.text.primary};
  padding: 6px 10px;
  margin: 0;
  font-size: 13px;
  font-weight: ${typography.fontWeights.medium};
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid ${colors.border.light};
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
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
  margin-bottom: 0;

  &[data-expanded="true"] {
    /* Any styles specific to expanded state can go here */
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s;
  
  .action-button {
    opacity: 0.9;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.14);
  }
`;

export const HistoryItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 10px;
  margin: 2px 0;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
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
    background-color: rgba(255, 255, 255, 0.16);
    border-radius: 3px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.28);
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
  display: flex;
  flex-direction: column;
  padding: 8px 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(
    180deg,
    rgba(10, 10, 13, 0) 0%,
    rgba(10, 10, 14, 0.62) 34%,
    rgba(9, 9, 12, 0.95) 100%
  );
  margin-top: auto;
  gap: 4px;
  position: relative;
  z-index: 1;
`;

export const SearchContainer = styled.div`
  position: relative;
  margin: 12px 12px 10px;
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(196, 199, 212, 0.55);
  z-index: 1;
`;

export const SearchInput = styled.input`
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.09) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  color: rgba(245, 246, 250, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 10px 12px;
  padding-left: 38px;
  padding-right: 58px;
  font-family: 'IBM Plex Sans', 'Avenir Next', 'Segoe UI', sans-serif;
  font-size: 13px;
  height: 40px;
  transition: all 0.2s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 10px 20px rgba(0, 0, 0, 0.18);

  &:focus {
    outline: none;
    border-color: rgba(255, 102, 140, 0.55);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.08) 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      0 0 0 2px rgba(255, 56, 92, 0.2);
  }

  &::placeholder {
    color: rgba(196, 199, 212, 0.5);
  }
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

// NeuralForge sidebar components

export const NavItem = styled.div<{ active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  padding: 9px 12px;
  cursor: pointer;
  border-radius: 12px;
  margin: 2px 10px;
  font-size: 13px;
  font-weight: ${(props) =>
    props.active ? typography.fontWeights.semiBold : typography.fontWeights.medium};
  color: ${(props) =>
    props.active ? 'rgba(247, 247, 252, 0.98)' : 'rgba(211, 214, 225, 0.76)'};
  background-color: ${(props) =>
    props.active ? 'rgba(255, 56, 92, 0.16)' : 'transparent'};
  border: 1px solid
    ${(props) => (props.active ? 'rgba(255, 115, 146, 0.34)' : 'transparent')};
  transition: all 0.18s ease;
  letter-spacing: 0.01em;

  &::before {
    content: '';
    width: 3px;
    height: 18px;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffbd91 0%, #ff5b90 100%);
    opacity: ${(props) => (props.active ? 1 : 0)};
    transform: ${(props) =>
      props.active ? 'translateX(0)' : 'translateX(-6px)'};
    transition: all 0.18s ease;
    margin-right: ${(props) => (props.active ? '8px' : '0')};
  }

  span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    margin-right: 10px;
    font-size: 14px;
    opacity: ${(props) => (props.active ? 1 : 0.84)};
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 7px;
    border-radius: 9px;
    background: ${(props) =>
      props.active ? 'rgba(255, 114, 153, 0.22)' : 'rgba(255, 255, 255, 0.06)'};
    border: 1px solid
      ${(props) =>
        props.active ? 'rgba(255, 175, 199, 0.38)' : 'rgba(255, 255, 255, 0.12)'};
    box-shadow: ${(props) =>
      props.active ? '0 0 12px rgba(255, 109, 150, 0.25)' : 'none'};
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(246, 247, 252, 0.98);

    svg {
      opacity: 1;
      background: rgba(255, 255, 255, 0.11);
      border-color: rgba(255, 255, 255, 0.24);
    }
  }
`;

export const NavItemBadge = styled.span`
  margin-left: auto;
  background: linear-gradient(
    180deg,
    rgba(255, 163, 109, 0.22) 0%,
    rgba(255, 134, 78, 0.18) 100%
  );
  color: #ffc9a0;
  font-size: 11px;
  font-weight: ${typography.fontWeights.bold};
  padding: 2px 8px;
  border-radius: 999px;
  min-width: 22px;
  text-align: center;
  line-height: 1.4;
  border: 1px solid rgba(255, 190, 149, 0.34);
`;

export const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 8px;
  font-size: 10px;
  font-weight: ${typography.fontWeights.semiBold};
  color: rgba(169, 174, 192, 0.82);
  text-transform: uppercase;
  letter-spacing: 1.3px;
  font-family: 'IBM Plex Mono', 'SF Mono', Menlo, monospace;
`;

export const SectionLabelAction = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  color: rgba(228, 230, 239, 0.78);
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: rgba(250, 250, 252, 0.96);
    background-color: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
  }

  svg {
    font-size: 12px;
  }
`;

export const KeyboardShortcutBadge = styled.span`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(22, 23, 28, 0.86);
  color: rgba(196, 200, 214, 0.74);
  font-size: 11px;
  font-weight: ${typography.fontWeights.medium};
  padding: 2px 7px;
  border-radius: 6px;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-family: 'IBM Plex Mono', 'SF Mono', Menlo, monospace;
`;

export const CollectionDot = styled.div<{ color: string }>`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 9px;
  flex-shrink: 0;
  box-shadow:
    0 0 10px ${(props) => props.color}55,
    0 0 0 2px rgba(14, 14, 18, 0.9);
`;

export const SidebarDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.22) 14%,
    rgba(255, 255, 255, 0.22) 86%,
    rgba(255, 255, 255, 0) 100%
  );
  margin: 10px 16px;
`;
