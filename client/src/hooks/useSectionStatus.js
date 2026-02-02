import { useCallback } from 'react';
import { useReport } from './useReport.js';
import { SECTION_ROUTES } from '../utils/sectionStatusConstants.js';

const DEFAULT_STATUS = { status: 'draft', reviewedBy: null, approvedBy: null };

export function useSectionStatus() {
  const { report, updateReport } = useReport();

  const getStatus = useCallback((route) => {
    if (!report || !report.sectionStatus) return { ...DEFAULT_STATUS };
    return report.sectionStatus[route] || { ...DEFAULT_STATUS };
  }, [report]);

  const setStatus = useCallback((route, status, name) => {
    if (!report) return;
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.sectionStatus) updated.sectionStatus = {};

    const current = updated.sectionStatus[route] || { ...DEFAULT_STATUS };

    if (status === 'review') {
      current.status = 'review';
      current.reviewedBy = name || current.reviewedBy;
    } else if (status === 'approved') {
      current.status = 'approved';
      current.approvedBy = name || current.approvedBy;
    } else {
      current.status = 'draft';
    }

    updated.sectionStatus[route] = current;
    updateReport(updated);
  }, [report, updateReport]);

  const allStatuses = SECTION_ROUTES.map((route) => ({
    route,
    ...getStatus(route),
  }));

  return { getStatus, setStatus, allStatuses };
}
