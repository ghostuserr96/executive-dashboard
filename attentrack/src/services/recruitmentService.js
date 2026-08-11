import { apiRequest } from './apiClient';

export const recruitmentService = {
  getJobs: () => apiRequest('/recruitment/jobs'),

  getJobBySlug: (slug) => apiRequest(`/recruitment/jobs/slug/${slug}`),

  createJob: (jobData) => apiRequest('/recruitment/jobs', { method: 'POST', body: jobData }),

  deleteJob: (id) => apiRequest(`/recruitment/jobs/${id}`, { method: 'DELETE' }),

  getCandidates: () => apiRequest('/recruitment/candidates'),

  createCandidate: (candidateData) => apiRequest('/recruitment/candidates', { method: 'POST', body: candidateData }),

  updateCandidateStage: (id, stage, isFinalStage = false) =>
    apiRequest(`/recruitment/candidates/${id}/stage`, { method: 'PATCH', body: { stage, cleanResume: isFinalStage } }),

  deleteCandidate: (id) => apiRequest(`/recruitment/candidates/${id}`, { method: 'DELETE' }),

  submitPublicApplication: (payload, slug) => {
    const endpoint = slug ? `/recruitment/public/apply/${slug}` : '/recruitment/public/apply';
    return apiRequest(endpoint, { method: 'POST', body: payload });
  },
};
