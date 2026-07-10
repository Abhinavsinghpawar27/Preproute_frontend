import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Minus } from 'lucide-react';
import { subjectsApi } from '../api/subjectsApi';
import { topicsApi } from '../api/topicsApi';
import { MultiSelect } from './MultiSelect';
import type { Subject, Topic, SubTopic, Test } from '../types';

// Validation Schema
const testSchema = z.object({
  name: z.string().min(1, 'Name of Test is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one Topic'),
  sub_topics: z.array(z.string()),
  total_time: z.number().min(1, 'Duration must be at least 1 minute'),
  type: z.string().min(1, 'Test type is required'),
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  correct_marks: z.number(),
  total_questions: z.number().min(1, 'Number of questions must be at least 1'),
  total_marks: z.number().min(1, 'Total marks must be at least 1'),
});

type TestFormValues = z.infer<typeof testSchema>;

interface TestFormProps {
  initialValues?: Partial<Test>;
  onSubmit: (values: TestFormValues, status: 'draft' | 'live' | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TestForm: React.FC<TestFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialValues?.type || 'chapterwise');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialValues?.name || '',
      subject: initialValues?.subject || '',
      topics: initialValues?.topics || [],
      sub_topics: initialValues?.sub_topics || [],
      total_time: initialValues?.total_time || 60,
      type: initialValues?.type || 'chapterwise',
      difficulty: (initialValues?.difficulty as 'easy' | 'medium' | 'difficult') || 'easy',
      wrong_marks: initialValues?.wrong_marks !== undefined ? initialValues.wrong_marks : -1,
      unattempt_marks: initialValues?.unattempt_marks !== undefined ? initialValues.unattempt_marks : 0,
      correct_marks: initialValues?.correct_marks !== undefined ? initialValues.correct_marks : 5,
      total_questions: initialValues?.total_questions || 50,
      total_marks: initialValues?.total_marks || 250,
    },
  });

  const selectedSubject = watch('subject');
  const selectedTopics = watch('topics');
  const totalQuestions = watch('total_questions');
  const correctMarks = watch('correct_marks');

  // Load Subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await subjectsApi.getSubjects();
        setSubjects(data);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      }
    };
    loadSubjects();
  }, []);

  // Cascade Subject -> Topics
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedSubject) {
        setTopics([]);
        setValue('topics', []);
        return;
      }
      try {
        const data = await topicsApi.getTopicsBySubject(selectedSubject);
        setTopics(data);
        
        // If the subject has changed and it doesn't match initial subject, clear selected topics
        if (selectedSubject !== initialValues?.subject) {
          setValue('topics', []);
        }
      } catch (error) {
        console.error('Failed to load topics:', error);
      }
    };
    loadTopics();
  }, [selectedSubject, setValue, initialValues?.subject]);

  // Cascade Topics -> Subtopics
  useEffect(() => {
    const loadSubTopics = async () => {
      if (!selectedTopics || selectedTopics.length === 0) {
        setSubTopics([]);
        setValue('sub_topics', []);
        return;
      }
      try {
        const data = await topicsApi.getSubTopicsByTopics(selectedTopics);
        setSubTopics(data);

        // Filter out any pre-selected subtopics that no longer belong to selected topics
        const validSubtopicIds = data.map((st) => st.id);
        const currentSubtopics = watch('sub_topics') || [];
        const filteredSubtopics = currentSubtopics.filter((id) => validSubtopicIds.includes(id));
        setValue('sub_topics', filteredSubtopics);
      } catch (error) {
        console.error('Failed to load subtopics:', error);
      }
    };
    loadSubTopics();
  }, [selectedTopics, setValue]);

  // Auto-calculate Total Marks when correctMarks or totalQuestions change
  useEffect(() => {
    const questionsCount = Number(totalQuestions) || 0;
    const marksPerCorrect = Number(correctMarks) || 0;
    const calculatedTotal = questionsCount * marksPerCorrect;
    
    // ASSUMPTION: Auto-calculates total marks initially, but remains overrideable
    if (calculatedTotal > 0) {
      setValue('total_marks', calculatedTotal, { shouldValidate: true });
    }
  }, [totalQuestions, correctMarks, setValue]);

  const handleTabChange = (type: string) => {
    setActiveTab(type);
    setValue('type', type, { shouldValidate: true });
  };

  // Custom Stepper Widget Component
  const StepperInput = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center bg-[#FAFAFA] border border-gray-200 rounded-lg p-1 w-full max-w-[120px] justify-between">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="p-1.5 hover:bg-gray-150 rounded text-gray-600 focus:outline-none"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold text-gray-800 text-sm w-8 text-center">{value >= 0 ? `+${value}` : value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="p-1.5 hover:bg-gray-150 rounded text-gray-600 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      
      {/* Test Type Tabs Bar */}
      <div className="flex border-b border-gray-200 pb-2 gap-4">
        {['chapterwise', 'pyq', 'mock'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`pb-2.5 text-sm font-bold border-b-2 px-1 transition-all capitalize ${
              activeTab === tab
                ? 'border-[#5B7FEC] text-[#5B7FEC]'
                : 'border-transparent text-gray-400 hover:text-gray-650'
            }`}
          >
            {tab === 'chapterwise' ? 'Chapterwise' : tab === 'pyq' ? 'PYQ' : 'Mock Test'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
              Subject
            </label>
            <select
              {...register('subject')}
              id="subject"
              className={`block w-full h-[46px] px-3 py-2 rounded-lg border bg-[#FAFAFA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] focus:border-transparent transition-colors duration-150 ${
                errors.subject ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Choose from Drop-down</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-xs text-red-650 font-semibold">{errors.subject.message}</p>
            )}
          </div>

          {/* Topic Multiselect */}
          <Controller
            name="topics"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Topic"
                placeholder="Choose from Drop-down"
                options={topics}
                selectedIds={field.value}
                onChange={field.onChange}
                disabled={!selectedSubject}
                error={errors.topics?.message}
              />
            )}
          />

          {/* Duration numeric input */}
          <div className="space-y-1.5">
            <label htmlFor="total_time" className="block text-sm font-semibold text-gray-700">
              Duration (Minutes)
            </label>
            <input
              {...register('total_time', { valueAsNumber: true })}
              id="total_time"
              type="number"
              placeholder="Enter the time"
              className={`block w-full h-[46px] px-3 py-2 rounded-lg border bg-[#FAFAFA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] focus:border-transparent transition-colors duration-150 ${
                errors.total_time ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.total_time && (
              <p className="text-xs text-red-650 font-semibold">{errors.total_time.message}</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Test Name input */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Name of Test
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="Enter name of Test"
              className={`block w-full h-[46px] px-3 py-2 rounded-lg border bg-[#FAFAFA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] focus:border-transparent transition-colors duration-150 ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-650 font-semibold">{errors.name.message}</p>
            )}
          </div>

          {/* Sub Topic Multiselect */}
          <Controller
            name="sub_topics"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Sub Topic"
                placeholder="Choose from Drop-down"
                options={subTopics}
                selectedIds={field.value}
                onChange={field.onChange}
                disabled={selectedTopics.length === 0}
                error={errors.sub_topics?.message}
              />
            )}
          />

          {/* Difficulty Level Radio buttons */}
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-gray-700">Test Difficulty Level</span>
            <div className="flex items-center space-x-6 h-[46px]">
              {(['easy', 'medium', 'difficult'] as const).map((diff) => (
                <label key={diff} className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-600 capitalize">
                  <input
                    {...register('difficulty')}
                    type="radio"
                    value={diff}
                    className="w-4 h-4 text-[#5B7FEC] focus:ring-[#5B7FEC] border-gray-300"
                  />
                  <span>{diff}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Marking Scheme and Stats row */}
      <div className="space-y-4 border-t border-gray-150 pt-6">
        <h4 className="text-sm font-bold text-gray-700">Marking Scheme:</h4>
        <div className="flex flex-wrap gap-8 items-end justify-between">
          
          {/* Steppers */}
          <div className="flex items-center gap-4">
            <Controller
              name="wrong_marks"
              control={control}
              render={({ field }) => (
                <StepperInput label="Wrong Answer" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="unattempt_marks"
              control={control}
              render={({ field }) => (
                <StepperInput label="Unattempted" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="correct_marks"
              control={control}
              render={({ field }) => (
                <StepperInput label="Correct Answer" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Questions & Marks Stats fields */}
          <div className="flex flex-wrap items-center gap-4 flex-1 justify-end max-w-lg">
            
            {/* Number of Questions */}
            <div className="flex-1 min-w-[120px] space-y-1.5">
              <label htmlFor="total_questions" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                No of Questions
              </label>
              <input
                {...register('total_questions', { valueAsNumber: true })}
                id="total_questions"
                type="number"
                placeholder="Ex: 50"
                className={`block w-full h-[44px] px-3 py-2 rounded-lg border bg-[#FAFAFA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] text-sm ${
                  errors.total_questions ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.total_questions && (
                <p className="text-xs text-red-650 font-semibold">{errors.total_questions.message}</p>
              )}
            </div>

            {/* Total Marks */}
            <div className="flex-1 min-w-[120px] space-y-1.5">
              <label htmlFor="total_marks" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Marks
              </label>
              <input
                {...register('total_marks', { valueAsNumber: true })}
                id="total_marks"
                type="number"
                placeholder="Ex: 250"
                className={`block w-full h-[44px] px-3 py-2 rounded-lg border bg-[#FAFAFA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] text-sm ${
                  errors.total_marks ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.total_marks && (
                <p className="text-xs text-red-650 font-semibold">{errors.total_marks.message}</p>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end space-x-3 border-t border-gray-150 pt-6">
        
        {/* Save as Draft (secondary feature) */}
        <button
          type="button"
          onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
          disabled={!isValid || isSubmitting}
          className={`px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all ${
            !isValid ? 'opacity-55 cursor-not-allowed border-gray-150 text-gray-400' : ''
          }`}
        >
          Save as Draft
        </button>

        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg border border-transparent text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all"
        >
          Cancel
        </button>

        {/* Next / Submit */}
        <button
          type="button"
          onClick={handleSubmit((data) => onSubmit(data, null))}
          disabled={!isValid || isSubmitting}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all ${
            !isValid
              ? 'bg-[#A2BAF7] cursor-not-allowed'
              : 'bg-[#5B7FEC] hover:bg-[#4A6FD8] active:scale-[0.98]'
          } ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving...</span>
            </div>
          ) : initialValues?.id ? (
            'Save changes'
          ) : (
            'Next'
          )}
        </button>

      </div>

    </form>
  );
};
