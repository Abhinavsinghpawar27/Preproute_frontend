import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Upload, Trash2, CheckCircle, Circle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { testsApi } from '../api/testsApi';
import { questionsApi } from '../api/questionsApi';
import { useTestDraftStore, type DraftQuestion } from '../store/useTestDraftStore';
import type { Test } from '../types';

const EMPTY_QUESTION = (testId: string): DraftQuestion => ({
  localId: uuidv4(),
  type: 'mcq',
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: '',
  explanation: '',
  difficulty: '',
  test_id: testId,
  isSaved: false,
});

const isQuestionComplete = (q: DraftQuestion): boolean => {
  const result =
    q.question.trim().length > 0 &&
    q.option1.trim().length > 0 &&
    q.option2.trim().length > 0 &&
    q.option3.trim().length > 0 &&
    q.option4.trim().length > 0 &&
    q.correct_option !== '';
  if (!result) {
    console.log('[AddQuestions] isQuestionComplete false for', q.localId.substring(0, 8), {
      questionLen: q.question.trim().length,
      opt1Len: q.option1.trim().length,
      opt2Len: q.option2.trim().length,
      opt3Len: q.option3.trim().length,
      opt4Len: q.option4.trim().length,
      correct_option: q.correct_option,
    });
  }
  return result;
};

export const AddQuestionsPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const {
    draftQuestions,
    activeQuestionLocalId,
    setCurrentTest,
    addQuestion,
    updateQuestion,
    removeQuestion,
    setActiveQuestion,
    markQuestionsAsSaved,
  } = useTestDraftStore();

  // Fetch test metadata
  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      setIsLoadingTest(true);
      try {
        const data = await testsApi.getTestById(testId);
        setTest(data);
        setCurrentTest(data);

        // If no questions in draft, add a blank first question
        if (draftQuestions.length === 0) {
          const blank = EMPTY_QUESTION(testId);
          addQuestion(blank);
        }
      } catch (err: any) {
        toast.error('Failed to load test details.');
        navigate('/dashboard');
      } finally {
        setIsLoadingTest(false);
      }
    };
    fetchTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const activeQuestion = draftQuestions.find((q) => q.localId === activeQuestionLocalId);

  const handleFieldChange = useCallback(
    (field: keyof DraftQuestion, value: string) => {
      if (!activeQuestionLocalId) return;
      updateQuestion(activeQuestionLocalId, { [field]: value });
    },
    [activeQuestionLocalId, updateQuestion]
  );

  const handleAddNewQuestion = () => {
    if (!testId) return;
    // Validate current before adding new
    if (activeQuestion && !isQuestionComplete(activeQuestion)) {
      toast.error('Complete all fields in the current question before adding a new one.');
      return;
    }
    const newQ = EMPTY_QUESTION(testId);
    addQuestion(newQ);
  };

  const handleDeleteAllEdits = () => {
    if (!activeQuestionLocalId) return;
    updateQuestion(activeQuestionLocalId, {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: '',
      explanation: '',
      difficulty: '',
    });
  };

  const handleRemoveQuestion = (localId: string) => {
    if (draftQuestions.length <= 1) {
      toast.error('At least one question is required.');
      return;
    }
    removeQuestion(localId);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !testId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      // ASSUMPTION: CSV format: question,option1,option2,option3,option4,correct_option,explanation,difficulty
      const header = lines[0]?.toLowerCase() ?? '';
      const startIdx = header.includes('question') ? 1 : 0;
      let importCount = 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i]!.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length < 6) continue;
        const [question, option1, option2, option3, option4, correct_option, explanation, difficulty] = parts;
        if (!question || !option1 || !option2 || !option3 || !option4) continue;

        const validCorrect = ['option1', 'option2', 'option3', 'option4'].includes(correct_option ?? '')
          ? (correct_option as DraftQuestion['correct_option'])
          : '';

        addQuestion({
          localId: uuidv4(),
          type: 'mcq',
          question: question ?? '',
          option1: option1 ?? '',
          option2: option2 ?? '',
          option3: option3 ?? '',
          option4: option4 ?? '',
          correct_option: validCorrect,
          explanation: explanation ?? '',
          difficulty: difficulty ?? '',
          test_id: testId,
          isSaved: false,
        });
        importCount++;
      }

      toast.success(`Imported ${importCount} question(s) from CSV.`);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
  };

  const handleSaveAndContinue = async () => {
    if (!testId) return;

    const completedQuestions = draftQuestions.filter(isQuestionComplete);
    if (completedQuestions.length === 0) {
      toast.error('Add and complete at least one question before continuing.');
      return;
    }

    const incomplete = draftQuestions.filter((q) => !isQuestionComplete(q));
    if (incomplete.length > 0) {
      toast.error(`${incomplete.length} question(s) are incomplete. Complete or remove them first.`);
      return;
    }

    setIsSaving(true);
    try {
      // POST /questions/bulk
      // Backend requires `subject` (UUID) on each question
      const subjectId = test?.subject || '';
      const bulkPayload = {
        questions: completedQuestions.map((q) => ({
          type: q.type,
          question: q.question,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          correct_option: q.correct_option,
          explanation: q.explanation,
          difficulty: q.difficulty,
          subject: subjectId,
          test_id: q.test_id,
        })),
      };

      console.log('[AddQuestions] Sending POST /questions/bulk payload:', JSON.stringify(bulkPayload, null, 2));

      const bulkResult = await questionsApi.bulkCreate(bulkPayload);

      console.log('[AddQuestions] POST /questions/bulk response:', JSON.stringify(bulkResult, null, 2));

      if (bulkResult.status !== 'success') {
        toast.error(bulkResult.message || 'Failed to save questions.');
        return;
      }

      // Mark questions as saved locally
      markQuestionsAsSaved(bulkResult.data);

      // PUT /tests/:id to attach question IDs
      const questionIds = bulkResult.data.map((q) => q.id!).filter(Boolean);
      console.log('[AddQuestions] Sending PUT /tests/:id with questionIds:', questionIds);
      const updatePayload = {
        questions: questionIds,
        total_questions: questionIds.length,
      };
      console.log('[AddQuestions] PUT payload:', JSON.stringify(updatePayload));
      await testsApi.updateTest(testId, updatePayload as any);

      toast.success(bulkResult.message || 'Questions saved successfully!');
      navigate(`/test/${testId}/preview`);
    } catch (err: any) {
      console.error('[AddQuestions] Save error:', err);
      console.error('[AddQuestions] Error response:', JSON.stringify(err?.response?.data, null, 2));
      const apiMessage = err?.response?.data?.message || '';
      const details = err?.response?.data?.errors
        ? JSON.stringify(err.response.data.errors)
        : '';
      toast.error(apiMessage + (details ? ': ' + details : 'Failed to save questions.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTest) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin h-8 w-8 text-[#5B7FEC]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const totalTarget = test?.total_questions ?? draftQuestions.length;
  const completedCount = draftQuestions.filter(isQuestionComplete).length;
  const activeIndex = draftQuestions.findIndex((q) => q.localId === activeQuestionLocalId);

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-6 -my-8 overflow-hidden">

      {/* Left Sidebar — Question List */}
      <div className={`${isSidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} transition-all duration-200 bg-white border-r border-gray-150 flex flex-col shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-150 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question creation</p>
            <p className="text-sm font-bold text-gray-700 mt-1">
              Total: <span className="text-[#5B7FEC]">{completedCount}/{totalTarget}</span>
            </p>
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {draftQuestions.map((q, idx) => {
            const complete = isQuestionComplete(q);
            const isActive = q.localId === activeQuestionLocalId;
            return (
              <div
                key={q.localId}
                className={`flex items-center rounded-lg text-sm font-semibold border transition-all ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : complete
                    ? 'bg-white border-gray-150 text-gray-700 hover:bg-gray-50'
                    : 'bg-white border-gray-150 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => setActiveQuestion(q.localId)}
                  className="flex-1 flex items-center px-3 py-2.5 min-w-0"
                >
                  <div className="flex items-center space-x-2.5">
                    {complete ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    <span>Question {idx + 1}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQuestion(q.localId);
                  }}
                  className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-r-lg transition-colors shrink-0"
                  title="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar icon nav (Dashboard/Analytics etc.) */}
        <div className="border-t border-gray-150 p-3 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
            className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button
            onClick={() => navigate(`/test/${testId}/preview`)}
            title="Preview Test"
            className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="flex items-center justify-center w-6 bg-white border-r border-gray-150 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Right Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFC]">

        {/* Test Summary Card + Publish Button */}
        <div className="bg-white border-b border-gray-150 px-6 py-4 shrink-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Test Info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-gray-900 text-white uppercase tracking-wide">
                  {test?.type ? test.type.charAt(0).toUpperCase() + test.type.slice(1) : 'Chapter Wise'}
                </span>
                <span className="font-bold text-gray-800 text-sm">Chapter 1</span>
                {test?.difficulty && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    test.difficulty === 'easy' ? 'bg-teal-100 text-teal-700' :
                    test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {test.difficulty}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs font-semibold text-gray-500">
                {test?.subject && <span>Subject : <span className="text-gray-700">{test.subject}</span></span>}
                {test?.topics && test.topics.length > 0 && (
                  <span className="flex items-center gap-1">Topic :
                    {test.topics.slice(0, 3).map((t, i) => (
                      <span key={i} className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded text-xs font-semibold">{t}</span>
                    ))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-500">
                {test?.total_time && <span>⏱ {test.total_time} Min</span>}
                <span>📝 {totalTarget} Q's</span>
                {test?.total_marks && <span>⭐ {test.total_marks} Marks</span>}
              </div>
            </div>

            {/* Publish Button */}
            <button
              onClick={handleSaveAndContinue}
              disabled={isSaving || completedCount === 0}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all shrink-0 ${
                completedCount === 0 ? 'bg-gray-300 cursor-not-allowed' :
                'bg-[#5B7FEC] hover:bg-[#4A6FD8] active:scale-[0.98] shadow-sm'
              } ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>

        {/* Question Editor Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Question Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">
              Question <span className="text-[#5B7FEC]">{activeIndex + 1}</span>
              <span className="text-gray-400">/{totalTarget}</span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Add MCQ Button */}
              <button
                onClick={handleAddNewQuestion}
                className="flex items-center px-3 py-1.5 text-xs font-bold text-[#5B7FEC] border border-[#5B7FEC] rounded-lg hover:bg-[#F0F4FE] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                MCQ
              </button>
              {/* CSV Import Button */}
              <button
                onClick={() => csvInputRef.current?.click()}
                className="flex items-center px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                CSV
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVImport}
              />
            </div>
          </div>

          {activeQuestion ? (
            <div className="space-y-5">
              {/* Question-level action buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleDeleteAllEdits}
                  className="flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear Fields
                </button>
                <button
                  onClick={() => handleRemoveQuestion(activeQuestion.localId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Question
                </button>
              </div>

              {/* Question Text Area */}
              <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-150 flex-wrap">
                  {(['B', 'I', 'U', 'S'] as const).map((fmt) => (
                    <button key={fmt} type="button" className={`px-2 py-0.5 text-xs font-bold rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 ${fmt === 'B' ? 'font-black' : fmt === 'I' ? 'italic' : fmt === 'U' ? 'underline' : 'line-through'}`}>{fmt}</button>
                  ))}
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <button type="button" className="px-2 py-0.5 text-xs font-bold rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100">¶</button>
                  <button type="button" className="px-2 py-0.5 text-xs font-bold rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100">≡</button>
                  <button type="button" className="px-2 py-0.5 text-xs font-bold rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100">⊞</button>
                  <button type="button" className="px-2 py-0.5 text-xs font-bold rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100">fx</button>
                </div>
                <div className="relative">
                  <textarea
                    value={activeQuestion.question}
                    onChange={(e) => handleFieldChange('question', e.target.value)}
                    placeholder="Type the question here..."
                    rows={4}
                    className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => handleRemoveQuestion(activeQuestion.localId)}
                    className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                    title="Delete this question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700">Type the options below</h3>
                {(['option1', 'option2', 'option3', 'option4'] as const).map((optKey, idx) => {
                  const isCorrect = activeQuestion.correct_option === optKey;
                  return (
                    <div
                      key={optKey}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => {
                        console.log('[AddQuestions] Row clicked for', optKey, 'was:', activeQuestion.correct_option);
                        handleFieldChange('correct_option', optKey);
                      }}
                    >
                      <input
                        type="radio"
                        name={`correct_${activeQuestion.localId}`}
                        checked={isCorrect}
                        readOnly
                        className="w-4 h-4 text-[#5B7FEC] shrink-0 pointer-events-none"
                      />
                      <div className={`flex-1 flex items-center bg-white rounded-lg border transition-all ${
                        isCorrect
                          ? 'border-[#5B7FEC] ring-1 ring-[#5B7FEC]'
                          : 'border-gray-200 group-hover:border-gray-300'
                      }`}>
                        <input
                          type="text"
                          value={activeQuestion[optKey]}
                          onChange={(e) => {
                            console.log('[AddQuestions] Text changed for', optKey, 'value:', e.target.value);
                            handleFieldChange(optKey, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={`Type Option ${idx + 1} here`}
                          className="flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-lg bg-transparent"
                        />
                        {isCorrect && (
                          <span className="pr-3 text-[#5B7FEC]">
                            <CheckCircle className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Explanation (optional)</label>
                  <textarea
                    value={activeQuestion.explanation}
                    onChange={(e) => handleFieldChange('explanation', e.target.value)}
                    placeholder="Add an explanation for the correct answer..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm text-gray-800 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty (optional)</label>
                  <select
                    value={activeQuestion.difficulty}
                    onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                    className="w-full h-[44px] px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
                  >
                    <option value="">Select difficulty...</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>
              </div>

              {/* Add Another Question Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddNewQuestion}
                  disabled={!isQuestionComplete(activeQuestion)}
                  className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                    isQuestionComplete(activeQuestion)
                      ? 'border-[#5B7FEC] text-[#5B7FEC] hover:bg-[#F0F4FE]'
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Question
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400 font-semibold">Select a question from the left panel or add a new one.</p>
              <button
                onClick={handleAddNewQuestion}
                className="mt-4 px-5 py-2.5 bg-[#5B7FEC] text-white text-sm font-bold rounded-lg hover:bg-[#4A6FD8] transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add First Question
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
