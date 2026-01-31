/**
 * AI Prompts Unit Tests
 * 
 * Tests for the prompt building functions
 */

import { 
  buildProjectContext, 
  getStageToolPrompt,
  MENTOR_SYSTEM_PROMPT,
  EVALUATION_SYSTEM_PROMPT 
} from '../../services/aiPrompts';

describe('AI Prompts', () => {
  
  describe('buildProjectContext', () => {
    it('should return empty string when no project', () => {
      const result = buildProjectContext(null, 'Empathise', {});
      expect(result).toBe('');
    });

    it('should include project title in context', () => {
      const project = {
        title: 'Campus Navigation App',
        description: 'Help students navigate',
        target_users: 'Students',
      };
      
      const result = buildProjectContext(project, 'Empathise', {});
      
      expect(result).toContain('Campus Navigation App');
      expect(result).toContain('Empathise');
    });

    it('should include completed deliverables', () => {
      const project = { title: 'Test Project' };
      const deliverables = {
        Empathise: {
          interview_notes: { content: { notes: 'Some notes' } },
        },
      };
      
      const result = buildProjectContext(project, 'Define', deliverables);
      
      expect(result).toContain('interview_notes');
    });
  });

  describe('getStageToolPrompt', () => {
    it('should return empathise prompt for empathise stage', () => {
      const prompt = getStageToolPrompt('empathise');
      expect(prompt).toContain('Empathise');
    });

    it('should return define prompt for define stage', () => {
      const prompt = getStageToolPrompt('define');
      expect(prompt).toContain('Define');
    });

    it('should return ideate prompt for ideate stage', () => {
      const prompt = getStageToolPrompt('ideate');
      expect(prompt).toContain('Ideate');
    });

    it('should return prototype prompt for prototype stage', () => {
      const prompt = getStageToolPrompt('prototype');
      expect(prompt).toContain('Prototype');
    });

    it('should return test prompt for test stage', () => {
      const prompt = getStageToolPrompt('test');
      expect(prompt).toContain('Test');
    });

    it('should return mentor prompt for unknown stage', () => {
      const prompt = getStageToolPrompt('unknown');
      expect(prompt).toContain('Design Thinking Mentor');
    });

    it('should handle null stage', () => {
      const prompt = getStageToolPrompt(null);
      expect(prompt).toBeDefined();
    });
  });

  describe('System Prompts', () => {
    it('should have mentor system prompt defined', () => {
      expect(MENTOR_SYSTEM_PROMPT).toBeDefined();
      expect(MENTOR_SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it('should have evaluation system prompt defined', () => {
      expect(EVALUATION_SYSTEM_PROMPT).toBeDefined();
      expect(EVALUATION_SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it('mentor prompt should mention guiding not solving', () => {
      expect(MENTOR_SYSTEM_PROMPT.toLowerCase()).toContain('guide');
      expect(MENTOR_SYSTEM_PROMPT.toLowerCase()).toContain('never');
    });

    it('evaluation prompt should mention constructive feedback', () => {
      expect(EVALUATION_SYSTEM_PROMPT.toLowerCase()).toContain('constructive');
    });
  });
});
