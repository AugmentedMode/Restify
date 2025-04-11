import { useState } from 'react';

interface ExpandedSections {
  collections: boolean;
  history: boolean;
  environments: boolean;
  notes: boolean;
  kanban: boolean;
  secrets: boolean;
}

export const useExpandedSections = (initialState: Partial<ExpandedSections> = {}) => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    collections: true,
    history: false,
    environments: false,
    notes: true,
    kanban: true,
    secrets: true,
    ...initialState,
  });

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return {
    expandedSections,
    toggleSection,
  };
}; 