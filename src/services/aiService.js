/**
 * AI Service - Context-Aware AI Wrapper
 * 
 * This service provides AI functionality that is always aware of:
 * - The user's current project
 * - Their current stage
 * - Their completed work
 * 
 * All responses are contextually relevant to their design thinking journey.
 */

import { generateContent } from '../lib/gemini';
import {
  MENTOR_SYSTEM_PROMPT,
  EVALUATION_SYSTEM_PROMPT,
  buildProjectContext,
  getStageToolPrompt
} from './aiPrompts';

/**
 * Send a message to the AI mentor
 * 
 * @param {string} userMessage - The user's message/question
 * @param {Object} project - User's project object
 * @param {string} stageName - Current stage name
 * @param {Object} deliverables - User's completed deliverables
 * @param {Array} chatHistory - Previous messages in the conversation
 * @returns {Promise<string>} - AI response
 */
export const sendMentorMessage = async (userMessage, project, stageName, deliverables, chatHistory = []) => {
  const projectContext = buildProjectContext(project, stageName, deliverables);
  
  // Build conversation history string
  const historyString = chatHistory
    .slice(-6) // Keep last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'Student' : 'Mentor'}: ${msg.content}`)
    .join('\n');
  
  const fullPrompt = `${MENTOR_SYSTEM_PROMPT}

${projectContext}

${historyString ? `CONVERSATION SO FAR:\n${historyString}\n` : ''}
Student: ${userMessage}

Mentor:`;

  try {
    const response = await generateContent(fullPrompt);
    return response;
  } catch (error) {
    console.error('AI Mentor Error:', error);
    throw new Error('Unable to get AI response. Please try again.');
  }
};

/**
 * Get AI evaluation of a submitted assignment
 * 
 * @param {Object} project - User's project object
 * @param {string} stageName - Stage name (Empathise, Define, etc.)
 * @param {string} deliverableType - Type of deliverable (interview_notes, pov, hmw, etc.)
 * @param {Object} content - The content being evaluated
 * @param {Object} deliverables - User's other completed deliverables for context
 * @returns {Promise<Object>} - Evaluation with strengths, suggestions, nextSteps
 */
export const evaluateAssignment = async (project, stageName, deliverableType, content, deliverables) => {
  const projectContext = buildProjectContext(project, stageName, deliverables);
  
  // Format content for evaluation
  const contentString = typeof content === 'object' 
    ? JSON.stringify(content, null, 2) 
    : content;
  
  const deliverableLabel = formatDeliverableType(deliverableType);
  
  const fullPrompt = `${EVALUATION_SYSTEM_PROMPT}

${projectContext}

ASSIGNMENT BEING EVALUATED:
Type: ${deliverableLabel}
Stage: ${stageName}

STUDENT'S WORK:
${contentString}

Please provide constructive feedback following the specified format.`;

  try {
    const response = await generateContent(fullPrompt);
    return {
      raw: response,
      parsed: parseEvaluationResponse(response)
    };
  } catch (error) {
    console.error('AI Evaluation Error:', error);
    throw new Error('Unable to evaluate assignment. Please try again.');
  }
};

/**
 * Get stage-specific AI assistance
 * 
 * @param {string} userMessage - User's question or request
 * @param {Object} project - User's project object
 * @param {string} stageName - Current stage
 * @param {Object} deliverables - User's completed work
 * @returns {Promise<string>} - AI response
 */
export const getStageAssistance = async (userMessage, project, stageName, deliverables) => {
  const projectContext = buildProjectContext(project, stageName, deliverables);
  let toolPrompt = getStageToolPrompt(stageName);
  
  // Replace placeholder with actual context
  toolPrompt = toolPrompt.replace('{projectContext}', projectContext);
  
  const fullPrompt = `${toolPrompt}

${projectContext}

STUDENT'S REQUEST:
${userMessage}

YOUR RESPONSE:`;

  try {
    const response = await generateContent(fullPrompt);
    return response;
  } catch (error) {
    console.error('AI Stage Assistance Error:', error);
    throw new Error('Unable to get AI assistance. Please try again.');
  }
};

/**
 * Get quick action suggestions based on current stage
 * 
 * @param {string} stageName - Current stage
 * @returns {Array} - Array of quick action objects
 */
export const getQuickActions = (stageName) => {
  const actions = {
    'Empathise': [
      { id: 'interview-prep', label: 'Help me prepare for interviews', icon: 'MessageSquare' },
      { id: 'observation-tips', label: 'What should I observe?', icon: 'Eye' },
      { id: 'empathy-map', label: 'Guide me through an empathy map', icon: 'Users' },
    ],
    'Define': [
      { id: 'synthesize', label: 'Help me find patterns in my research', icon: 'Lightbulb' },
      { id: 'pov-review', label: 'Review my problem statement', icon: 'FileText' },
      { id: 'hmw-help', label: 'Help me frame HMW questions', icon: 'HelpCircle' },
    ],
    'Ideate': [
      { id: 'brainstorm', label: 'Expand my thinking', icon: 'Sparkles' },
      { id: 'wild-ideas', label: 'Push me to think wilder', icon: 'Zap' },
      { id: 'narrow-down', label: 'Help me prioritize ideas', icon: 'Target' },
    ],
    'Prototype': [
      { id: 'prototype-plan', label: 'What should I prototype first?', icon: 'Box' },
      { id: 'low-fi-ideas', label: 'Quick prototype ideas', icon: 'Pencil' },
      { id: 'test-plan', label: 'Plan my prototype test', icon: 'ClipboardList' },
    ],
    'Test': [
      { id: 'test-questions', label: 'What questions to ask testers?', icon: 'MessageCircle' },
      { id: 'analyze-feedback', label: 'Help me analyze feedback', icon: 'BarChart' },
      { id: 'iterate', label: 'What should I iterate on?', icon: 'RefreshCw' },
    ],
  };
  
  return actions[stageName] || actions['Empathise'];
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format deliverable type to human-readable label
 */
const formatDeliverableType = (type) => {
  const labels = {
    'interview_notes': 'Interview Notes',
    'pov': 'Point of View Statement',
    'hmw': 'How Might We Statement',
    'brainstorm': 'Brainstorm Ideas',
    'prototype_description': 'Prototype Description',
    'test_feedback': 'Test Feedback',
  };
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Parse AI evaluation response into structured format
 */
const parseEvaluationResponse = (response) => {
  // Try to extract sections from the response
  const sections = {
    strengths: '',
    suggestions: '',
    nextSteps: ''
  };
  
  // Look for emoji-prefixed sections
  const strengthsMatch = response.match(/(?:✨|##?\s*(?:What's Working|Strengths))[\s\S]*?(?=(?:💡|##?\s*(?:Opportunities|Suggestions|Growth))|$)/i);
  const suggestionsMatch = response.match(/(?:💡|##?\s*(?:Opportunities|Suggestions|Growth))[\s\S]*?(?=(?:🎯|##?\s*(?:Next Steps|Suggested))|$)/i);
  const nextStepsMatch = response.match(/(?:🎯|##?\s*(?:Next Steps|Suggested))[\s\S]*/i);
  
  if (strengthsMatch) sections.strengths = strengthsMatch[0].trim();
  if (suggestionsMatch) sections.suggestions = suggestionsMatch[0].trim();
  if (nextStepsMatch) sections.nextSteps = nextStepsMatch[0].trim();
  
  // If parsing failed, just return the raw response
  if (!sections.strengths && !sections.suggestions && !sections.nextSteps) {
    sections.strengths = response;
  }
  
  return sections;
};

const aiService = {
  sendMentorMessage,
  evaluateAssignment,
  getStageAssistance,
  getQuickActions
};

export default aiService;
