import { useState } from 'react';

interface ExpandedSections {
  collections: boolean;
  history: boolean;
  environments: boolean;
  notes: boolean;
  kanban: boolean;
  secrets: boolean;
  github: boolean;
  ai: boolean;
  aiPrompts: boolean;
}

export const useExpandedSections = (initialState: Partial<ExpandedSections> = {}) => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    collections: true,
    history: false,
    environments: false,
    notes: false,
    kanban: false,
    secrets: false,
    github: false,
    ai: false,
    aiPrompts: false,
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