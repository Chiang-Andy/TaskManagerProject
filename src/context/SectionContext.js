import React, { createContext, useContext, useReducer } from 'react';

const SectionContext = createContext();

const initialState = {
  sections: [],
};

const sectionReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, action.payload],
      };
    case 'DELETE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((section) => section.id !== action.payload),
      };
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.id
            ? { ...section, ...action.payload.updates }
            : section
        ),
      };
    default:
      return state;
  }
};

export const SectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sectionReducer, initialState);

  const addSection = (section) => {
    dispatch({
      type: 'ADD_SECTION',
      payload: {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...section,
      },
    });
  };

  const deleteSection = (sectionId) => {
    dispatch({ type: 'DELETE_SECTION', payload: sectionId });
  };

  const updateSection = (sectionId, updates) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, updates } });
  };

  const getSectionById = (sectionId) => {
    return state.sections.find((section) => section.id === sectionId);
  };

  return (
    <SectionContext.Provider
      value={{
        sections: state.sections,
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
