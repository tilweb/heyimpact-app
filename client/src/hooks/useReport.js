import { useContext, useCallback, useEffect, useRef } from 'react';
import { ReportContext } from '../context/ReportContext.jsx';
import { useApi } from './useApi.js';

export function useReport() {
  const { state, dispatch, updateSection, updateReport } = useContext(ReportContext);
  const { apiFetch } = useApi();
  const reloadAttempted = useRef(false);

  // Auto-reload report from server after page refresh
  useEffect(() => {
    if (state.needsReload && state.reportId && !state.report && !state.loading && !reloadAttempted.current) {
      reloadAttempted.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });
      apiFetch(`/api/reports/${state.reportId}`)
        .then((report) => {
          dispatch({ type: 'LOAD_REPORT', payload: { report, id: state.reportId } });
        })
        .catch((err) => {
          dispatch({ type: 'SET_ERROR', payload: err.message });
        });
    }
  }, [state.needsReload, state.reportId, state.report, state.loading, apiFetch, dispatch]);

  const loadReport = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const report = await apiFetch(`/api/reports/${id}`);
      dispatch({ type: 'LOAD_REPORT', payload: { report, id } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [apiFetch, dispatch]);

  const saveReport = useCallback(async () => {
    if (!state.report || !state.reportId) return;
    try {
      await apiFetch(`/api/reports/${state.reportId}`, {
        method: 'PUT',
        body: JSON.stringify(state.report),
      });
      dispatch({ type: 'SET_DIRTY', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [state.report, state.reportId, apiFetch, dispatch]);

  const createReport = useCallback(async (companyName, fiscalYear) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const report = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ company_name: companyName, fiscal_year: fiscalYear }),
      });
      dispatch({ type: 'LOAD_REPORT', payload: { report, id: report.metadata.report_id } });
      return report;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [apiFetch, dispatch]);

  const importReport = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const report = await apiFetch('/api/reports/import', { method: 'POST' });
      dispatch({ type: 'LOAD_REPORT', payload: { report, id: report.metadata.report_id } });
      return report;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [apiFetch, dispatch]);

  const uploadReport = useCallback(async (reportData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const report = await apiFetch('/api/reports/upload', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
      dispatch({ type: 'LOAD_REPORT', payload: { report, id: report.metadata.report_id } });
      return report;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [apiFetch, dispatch]);

  return {
    report: state.report,
    reportId: state.reportId,
    isDirty: state.isDirty,
    loading: state.loading,
    error: state.error,
    loadReport,
    saveReport,
    createReport,
    importReport,
    uploadReport,
    updateSection,
    updateReport,
    dispatch,
  };
}
