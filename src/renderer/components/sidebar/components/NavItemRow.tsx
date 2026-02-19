import React from 'react';
import { NavItem, NavItemBadge } from '../../../styles/StyledComponents';

interface NavItemRowProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
  rightAction?: React.ReactNode;
}

const NavItemRow: React.FC<NavItemRowProps> = ({
  icon,
  label,
  badge,
  active = false,
  onClick,
  rightAction,
}) => {
  return (
    <NavItem active={active} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <NavItemBadge>{badge}</NavItemBadge>
      )}
      {rightAction}
    </NavItem>
  );
};

export default NavItemRow;
