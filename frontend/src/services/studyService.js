import api from './api';

export const studyService = {
  // Summary
  async generateSummary(documentId, summaryType = 'detailed', customInstruction = '', chapterOrTopic = '') {
    const response = await api.post('/summary/generate', {
      document_id: documentId,
      summary_type: summaryType,
      custom_instruction: customInstruction,
      chapter_or_topic: chapterOrTopic,
    });
    return response.data;
  },

  // Ask PDF & Chat
  async sendChatMessage(message, documentId = null, sessionId = null) {
    const response = await api.post('/chat/message', {
      message,
      document_id: documentId,
      session_id: sessionId,
    });
    return response.data;
  },

  async getChatHistory(documentId = null, sessionId = null) {
    const response = await api.get('/chat/history', {
      params: { document_id: documentId, session_id: sessionId }
    });
    return response.data;
  },

  // Mock Tests
  async generateMockTest(documentId, numQuestions = 10, difficulty = 'medium', questionType = 'mixed', specificTopics = null) {
    const response = await api.post('/tests/generate', {
      document_id: documentId,
      num_questions: numQuestions,
      difficulty,
      question_type: questionType,
      specific_topics: specificTopics,
    });
    return response.data;
  },

  async getTest(testId) {
    const response = await api.get(`/tests/${testId}`);
    return response.data;
  },

  async submitTest(testId, documentId, answers, timeTakenSeconds = 0) {
    const response = await api.post('/tests/submit', {
      test_id: testId,
      document_id: documentId,
      answers,
      time_taken_seconds: timeTakenSeconds,
    });
    return response.data;
  },

  async getTestHistory(documentId = null) {
    const response = await api.get('/tests/history', {
      params: { document_id: documentId }
    });
    return response.data;
  },

  async generatePersonalizedTest(documentId = null, difficulty = 'hard', numQuestions = 5) {
    const response = await api.post('/tests/personalized', {
      document_id: documentId,
      difficulty,
      num_questions: numQuestions,
      based_on_weak_topics: true,
    });
    return response.data;
  },

  // Performance & Weak Topics
  async getPerformanceOverview(documentId = null) {
    const response = await api.get('/performance/overview', {
      params: { document_id: documentId }
    });
    return response.data;
  },

  async getWeakTopics(documentId = null) {
    const response = await api.get('/performance/weak-topics', {
      params: { document_id: documentId }
    });
    return response.data;
  },

  // Direct Agentic Coordinator Execution
  async executeCoordinatorWorkflow(userPrompt, documentId = null, sessionId = null) {
    const response = await api.post('/coordinator/execute', {
      user_prompt: userPrompt,
      document_id: documentId,
      session_id: sessionId,
    });
    return response.data;
  }
};
