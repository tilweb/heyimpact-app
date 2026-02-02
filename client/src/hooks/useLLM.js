import { useState, useCallback } from 'react';
import { useApi } from './useApi.js';
import { useAuth } from './useAuth.js';

export function useLLM() {
  const { apiFetch } = useApi();
  const { token } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generateImpactSummary = useCallback(async (iroAssessment) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/impact-summary', {
        method: 'POST',
        body: JSON.stringify({ iro_assessment: iroAssessment }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateFinancialSummary = useCallback(async (iroAssessment) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/financial-summary', {
        method: 'POST',
        body: JSON.stringify({ iro_assessment: iroAssessment }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateJustification = useCallback(async (type, data) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/justification', {
        method: 'POST',
        body: JSON.stringify({ type, data }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateNonRelevanceJustification = useCallback(async (topicCode, topicName, companyName, industrySector) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/non-relevance-justification', {
        method: 'POST',
        body: JSON.stringify({ topicCode, topicName, companyName, industrySector }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateIRODescription = useCallback(async (type, title, topicName, topicCode) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/iro-description', {
        method: 'POST',
        body: JSON.stringify({ type, title, topicName, topicCode }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateItemDescription = useCallback(async (type, title, topic) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/item-description', {
        method: 'POST',
        body: JSON.stringify({ type, title, topic }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const suggestSDG = useCallback(async (title, description, topic) => {
    setGenerating(true);
    try {
      const { goals } = await apiFetch('/api/llm/suggest-sdg', {
        method: 'POST',
        body: JSON.stringify({ title, description, topic }),
      });
      return goals;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateExecutiveSummary = useCallback(async (report) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/executive-summary', {
        method: 'POST',
        body: JSON.stringify({ report }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateManagementReport = useCallback(async (report) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/management-report', {
        method: 'POST',
        body: JSON.stringify({ report }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const generateESGManagementSystem = useCallback(async (report) => {
    setGenerating(true);
    try {
      const { text } = await apiFetch('/api/llm/esg-management-system', {
        method: 'POST',
        body: JSON.stringify({ report }),
      });
      return text;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch]);

  const extractPolicyFromDocument = useCallback(async (file) => {
    setGenerating(true);
    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || `Upload fehlgeschlagen (${uploadRes.status})`);
      }
      const { source_id } = await uploadRes.json();

      // Step 2: Extract policy fields
      const result = await apiFetch('/api/documents/extract-policy', {
        method: 'POST',
        body: JSON.stringify({ source_id }),
      });
      return result;
    } finally {
      setGenerating(false);
    }
  }, [apiFetch, token]);

  return { generating, generateImpactSummary, generateFinancialSummary, generateJustification, generateNonRelevanceJustification, generateIRODescription, generateItemDescription, suggestSDG, generateExecutiveSummary, generateManagementReport, generateESGManagementSystem, extractPolicyFromDocument };
}
