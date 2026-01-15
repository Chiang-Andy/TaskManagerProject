import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SectionContext = createContext();

export const SectionProvider = ({ children }) => {
  // Queries - automatically update when data changes
  const sections = useQuery(api.sections.list) ?? [];
  const isLoading = sections === undefined;

  // Mutations
  const createSection = useMutation(api.sections.create);
  const updateSectionMutation = useMutation(api.sections.update);
  const deleteSectionMutation = useMutation(api.sections.remove);

  const addSection = async (section) => {
    await createSection({
      name: section.name,
      color: section.color,
    });
  };

  const deleteSection = async (sectionId) => {
    await deleteSectionMutation({ id: sectionId });
  };

  const updateSection = async (sectionId, updates) => {
    await updateSectionMutation({ id: sectionId, ...updates });
  };

  const getSectionById = useCallback(
    (sectionId) => {
      return sections.find((section) => section._id === sectionId);
    },
    [sections]
  );

  return (
    <SectionContext.Provider
      value={{
        sections,
        isLoading,
        addSection,
        deleteSection,
        updateSection,
        getSectionById,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
};

export const useSections = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSections must be used within a SectionProvider');
  }
  return context;
};
