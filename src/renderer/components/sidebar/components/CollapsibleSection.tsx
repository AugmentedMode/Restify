import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { CollapsibleSection as Section, SectionHeader } from '../../../styles/StyledComponents';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerIcon?: React.ReactNode;
}

// Animation variants
const iconVariants = {
  expanded: { rotate: 0 },
  collapsed: { rotate: -90 },
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  expanded,
  onToggle,
  children,
  actions,
  headerIcon,
}) => {
  return (
    <Section expanded={expanded} style={{ overflowX: 'hidden' }}>
      <SectionHeader onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {headerIcon && <div style={{ marginRight: 8 }}>{headerIcon}</div>}
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {actions}
          <motion.div
            animate={expanded ? 'expanded' : 'collapsed'}
            variants={iconVariants}
            transition={{ duration: 0.2 }}
          >
            <FaChevronDown size={12} />
          </motion.div>
        </div>
      </SectionHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default CollapsibleSection; 