import React, { createContext, useReducer, useCallback, useEffect } from 'react';

export const ReportContext = createContext(null);

const STORAGE_KEY = 'berichtswerk_reportId';

const initialState = {
  report: null,
  reportId: sessionStorage.getItem(STORAGE_KEY) || null,
  isDirty: false,
  loading: false,
  error: null,
  needsReload: !!sessionStorage.getItem(STORAGE_KEY),
};

function reportReducer(state, action) {
  switch (action.type) {
    case 'LOAD_REPORT':
      sessionStorage.setItem(STORAGE_KEY, action.payload.id);
      return { ...state, report: action.payload.report, reportId: action.payload.id, isDirty: false, loading: false, error: null, needsReload: false };
    case 'SET_REPORT':
      return { ...state, report: action.payload, isDirty: false };
    case 'UPDATE_REPORT':
      return { ...state, report: action.payload, isDirty: true };
    case 'UPDATE_SECTION': {
      const newReport = { ...state.report };
      const keys = action.payload.path.split('.');
      let obj = newReport;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = action.payload.value;
      return { ...state, report: newReport, isDirty: true };
    }
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, needsReload: false };
    case 'RESET':
      sessionStorage.removeItem(STORAGE_KEY);
      return { report: null, reportId: null, isDirty: false, loading: false, error: null, needsReload: false };
    default:
      return state;
  }
}

export function ReportProvider({ children }) {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  const updateSection = useCallback((path, value) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { path, value } });
  }, []);

  const updateReport = useCallback((report) => {
    dispatch({ type: 'UPDATE_REPORT', payload: report });
  }, []);

  return (
    <ReportContext.Provider value={{ state, dispatch, updateSection, updateReport }}>
      {children}
    </ReportContext.Provider>
  );
}
