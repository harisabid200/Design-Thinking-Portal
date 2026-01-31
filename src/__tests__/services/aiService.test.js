/**
 * AI Service Unit Tests
 * 
 * Tests for the AI mentor and evaluation functionality
 */

import { 
  sendMentorMessage, 
  evaluateAssignment, 
  getQuickActions 
} from '../../services/aiService';
import { generateContent } from '../../lib/gemini';

// Mock the Gemini API
jest.mock('../../lib/gemini', () => ({
  generateContent: jest.fn(),
}));

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMentorMessage', () => {
    const mockProject = {
      title: 'Campus Navigation App',
      description: 'Help students navigate campus',
      target_users: 'University students',
    };

    const mockDeliverables = {};
    const stageName = 'Empathise';

    it('should call generateContent with correct prompt structure', async () => {
      generateContent.mockResolvedValueOnce('Mock mentor response');

      const result = await sendMentorMessage(
        'How do I start my research?',
        mockProject,
        stageName,
        mockDeliverables,
        []
      );

      expect(generateContent).toHaveBeenCalledTimes(1);
      expect(result).toBe('Mock mentor response');
      
      // Verify prompt contains project context
      const callArg = generateContent.mock.calls[0][0];
      expect(callArg).toContain('Campus Navigation App');
      expect(callArg).toContain('Empathise');
    });

    it('should include chat history in prompt', async () => {
      generateContent.mockResolvedValueOnce('Follow-up response');

      const chatHistory = [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
      ];

      await sendMentorMessage(
        'Second question',
        mockProject,
        stageName,
        mockDeliverables,
        chatHistory
      );

      const callArg = generateContent.mock.calls[0][0];
      expect(callArg).toContain('First question');
      expect(callArg).toContain('First answer');
    });

    it('should throw error when API fails', async () => {
      generateContent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        sendMentorMessage('Test', mockProject, stageName, mockDeliverables, [])
      ).rejects.toThrow('Unable to get AI response');
    });
  });

  describe('evaluateAssignment', () => {
    const mockProject = {
      title: 'Campus Navigation App',
      description: 'Help students navigate campus',
      target_users: 'University students',
    };

    it('should return parsed evaluation with strengths, suggestions, nextSteps', async () => {
      const mockResponse = `## ✨ What's Working Well
- Great observation about user frustration
- Asked follow-up questions

## 💡 Opportunities to Explore
- Consider different user types
- Look for emotional cues

## 🎯 Suggested Next Steps
- Interview 2 more students`;

      generateContent.mockResolvedValueOnce(mockResponse);

      const result = await evaluateAssignment(
        mockProject,
        'Empathise',
        'interview_notes',
        { notes: 'User said they get lost often' },
        {}
      );

      expect(result).toHaveProperty('raw');
      expect(result).toHaveProperty('parsed');
      expect(result.parsed).toHaveProperty('strengths');
      expect(result.parsed.strengths).toContain('Great observation');
    });

    it('should handle unparseable response gracefully', async () => {
      generateContent.mockResolvedValueOnce('Simple feedback without sections');

      const result = await evaluateAssignment(
        mockProject,
        'Empathise',
        'interview_notes',
        { notes: 'Some notes' },
        {}
      );

      expect(result.raw).toBe('Simple feedback without sections');
      // Should still have parsed object, even if sections are empty
      expect(result).toHaveProperty('parsed');
    });
  });

  describe('getQuickActions', () => {
    it('should return correct actions for Empathise stage', () => {
      const actions = getQuickActions('Empathise');
      
      expect(actions).toHaveLength(3);
      expect(actions[0].label).toContain('interview');
    });

    it('should return correct actions for Define stage', () => {
      const actions = getQuickActions('Define');
      
      expect(actions).toHaveLength(3);
      expect(actions.some(a => a.label.toLowerCase().includes('pattern'))).toBe(true);
    });

    it('should return correct actions for Ideate stage', () => {
      const actions = getQuickActions('Ideate');
      
      expect(actions).toHaveLength(3);
      expect(actions.some(a => a.label.toLowerCase().includes('think'))).toBe(true);
    });

    it('should return default actions for unknown stage', () => {
      const actions = getQuickActions('Unknown');
      
      expect(actions).toHaveLength(3);
    });
  });
});
