import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, CheckCircle, Clock, CalendarDays, AlarmClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { testsApi } from '../api/testsApi';
import { questionsApi } from '../api/questionsApi';
import type { Test, Question } from '../types';

type LiveUntilOption = 'always' | '1week' | '2weeks' | '3weeks' | '1month' | 'custom';

export const PreviewPublishPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTab, setPublishTab] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [liveUntil, setLiveUntil] = useState<LiveUntilOption>('always');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!testId) return;
      setIsLoading(true);
      try {
        const testData = await testsApi.getTestById(testId);
        setTest(testData);

        // Fetch question details if question IDs exist
        if (testData.questions && testData.questions.length > 0) {
          try {
            const questionData = await questionsApi.fetchBulk(testData.questions);
            setQuestions(questionData ?? []);
          } catch (qErr) {
            console.error('Failed to load question details:', qErr);
            // Non-fatal — show test without question details
          }
        }
      } catch (err: any) {
        toast.error('Failed to load test details for preview.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [testId, navigate]);

  const handlePublish = async () => {
    if (!testId) return;
    setIsPublishing(true);
    try {
      let payload: Record<string, unknown> = { status: 'live' };

      // ASSUMPTION: schedule fields added as publish_at / live_until since API doc doesn't define them
      if (publishTab === 'schedule') {
        if (scheduleDate && scheduleTime) {
          payload.publish_at = `${scheduleDate}T${scheduleTime}`;
        }
        if (liveUntil === 'custom' && endDate && endTime) {
          payload.live_until = `${endDate}T${endTime}`;
        } else if (liveUntil !== 'always') {
          payload.live_until = liveUntil;
        }
      }

      await testsApi.updateTest(testId, payload as any);
      toast.success('Test published successfully! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to publish test.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin h-8 w-8 text-[#5B7FEC]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const isAlreadyLive = test?.status === 'live';
  const questionsDone = questions.length > 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isAlreadyLive ? 'Test Live' : 'Preview & Publish'}
          </h1>
          {questionsDone && (
            <div className="flex items-center mt-2 gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600">
                All {questions.length} Question{questions.length !== 1 ? 's' : ''} done
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handlePublish}
          disabled={isPublishing || isAlreadyLive}
          className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
            isAlreadyLive
              ? 'bg-emerald-500 cursor-default'
              : isPublishing
              ? 'bg-[#5B7FEC] opacity-70 cursor-wait'
              : 'bg-[#5B7FEC] hover:bg-[#4A6FD8] hover:shadow active:scale-[0.98]'
          }`}
        >
          {isAlreadyLive ? '✓ Published' : isPublishing ? 'Publishing...' : 'Publish Test'}
        </button>
      </div>

      {/* Test Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-gray-900 text-white uppercase tracking-wide">
                  {test?.type ? test.type.charAt(0).toUpperCase() + test.type.slice(1) : 'Chapter Wise'}
                </span>
                <span className="font-bold text-gray-800 text-base">Chapter 1</span>
                {test?.difficulty && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    test.difficulty === 'easy' ? 'bg-teal-100 text-teal-700' :
                    test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                <div>
                  <span className="text-gray-400 font-semibold text-xs">Subject</span>
                  <p className="font-bold text-gray-800">{test?.subject || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold text-xs">Topics</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {test?.topics?.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-xs font-semibold">{t}</span>
                    )) ?? <span className="text-gray-400 text-xs">None</span>}
                  </div>
                </div>
                {test?.sub_topics && test.sub_topics.length > 0 && (
                  <div>
                    <span className="text-gray-400 font-semibold text-xs">Sub Topics</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {test.sub_topics.map((st, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-semibold">{st}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => navigate(`/test/${testId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5B7FEC] border border-[#5B7FEC] rounded-lg hover:bg-[#F0F4FE] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
              <Clock className="w-4 h-4 text-[#5B7FEC]" />
              <span>{test?.total_time ?? '—'} Min</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
              <span>📝</span>
              <span>{test?.total_questions ?? questions.length} Q's</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
              <span>⭐</span>
              <span>{test?.total_marks ?? '—'} Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Now / Schedule Toggle */}
      {!isAlreadyLive && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-6">
          <div className="flex border-b border-gray-150 gap-6">
            {(['now', 'schedule'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPublishTab(tab)}
                className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${
                  publishTab === tab
                    ? 'border-[#5B7FEC] text-[#5B7FEC]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'now' ? 'Publish Now' : 'Schedule Publish'}
              </button>
            ))}
          </div>

          {publishTab === 'schedule' && (
            <div className="space-y-6">
              {/* Select Date and Time */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#5B7FEC]" />
                  Select Date and Time
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Select Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full h-[44px] px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Select Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full h-[44px] px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
                    />
                  </div>
                </div>
              </div>

              {/* Live Until */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <AlarmClock className="w-4 h-4 text-[#5B7FEC]" />
                  Live Until
                </h4>
                <p className="text-xs text-gray-400 font-medium mb-4">Choose how long this test should remain available on the platform.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { value: 'always', label: 'Always Available' },
                    { value: '1week', label: '1 Week' },
                    { value: '2weeks', label: '2 Weeks' },
                    { value: '3weeks', label: '3 Weeks' },
                    { value: '1month', label: '1 Month' },
                    { value: 'custom', label: 'Custom Duration' },
                  ] as { value: LiveUntilOption; label: string }[]).map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="liveUntil"
                        value={opt.value}
                        checked={liveUntil === opt.value}
                        onChange={() => setLiveUntil(opt.value)}
                        className="w-4 h-4 text-[#5B7FEC] focus:ring-[#5B7FEC]"
                      />
                      <span className="text-sm font-semibold text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {liveUntil === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">Select End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-[44px] px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">Select End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full h-[44px] px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Preview List */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-800">Questions ({questions.length})</h3>
            <button
              onClick={() => navigate(`/test/${testId}/questions`)}
              className="flex items-center gap-2 text-sm font-bold text-[#5B7FEC] hover:underline"
            >
              <Pencil className="w-4 h-4" />
              Edit Questions
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id ?? idx} className="bg-white rounded-xl border border-gray-150 shadow-sm p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-gray-800">
                    <span className="text-[#5B7FEC] mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </p>
                  {q.difficulty && (
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'easy' ? 'bg-teal-50 text-teal-600' :
                      q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>{q.difficulty}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['option1', 'option2', 'option3', 'option4'] as const).map((optKey, optIdx) => (
                    <div key={optKey} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-semibold ${
                      q.correct_option === optKey
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-gray-50 border-gray-150 text-gray-600'
                    }`}>
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full border-2 text-xs font-bold border-current">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{q[optKey]}</span>
                      {q.correct_option === optKey && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700">
                    <span className="font-bold">Explanation: </span>{q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {questions.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm p-8 text-center">
          <p className="text-gray-400 font-semibold text-sm">No questions have been saved yet.</p>
          <button
            onClick={() => navigate(`/test/${testId}/questions`)}
            className="mt-4 px-5 py-2.5 bg-[#5B7FEC] text-white text-sm font-bold rounded-lg hover:bg-[#4A6FD8] transition-colors"
          >
            Add Questions
          </button>
        </div>
      )}

    </div>
  );
};
