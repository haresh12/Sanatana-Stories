import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { AnalysisResponse } from './types';

/**
 * Fetches the analysis for the given transcript.
 * @param transcript The transcript to analyze.
 * @returns The analysis response containing the analysis text and score.
 */
export const fetchAnalysis = async (transcript: string): Promise<AnalysisResponse> => {
  const analyzeChanting = httpsCallable<{ transcript: string }, AnalysisResponse>(functions, 'analyzeChanting');
  const response = await analyzeChanting({ transcript });
  return response.data;
};
