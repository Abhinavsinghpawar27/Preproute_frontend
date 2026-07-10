import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TestForm } from '../components/TestForm';
import { testsApi } from '../api/testsApi';
import type { Test } from '../types';

export const TestCreationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await testsApi.getTestById(id);
        setTest(data);
      } catch (error: any) {
        console.error('Failed to load test details for editing:', error);
        toast.error('Failed to load test metadata. Redirecting back to dashboard.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetails();
  }, [id, navigate]);

  const handleSubmit = async (formValues: any, requestedStatus: 'draft' | 'live' | null) => {
    setIsSubmitting(true);
    
    // API requires status as a string ("draft", "live") — null is rejected
    const status = requestedStatus === 'draft' ? 'draft' : undefined;
    const payload = {
      ...formValues,
      ...(status ? { status } : {}),
    };

    console.log('[TestCreation] Submitting with payload:', JSON.stringify(payload, null, 2));

    try {
      if (id) {
        await testsApi.updateTest(id, payload);
        toast.success('Test metadata updated successfully!');
        if (requestedStatus === 'draft') {
          navigate('/dashboard');
        } else {
          navigate(`/test/${id}/questions`);
        }
      } else {
        const response = await testsApi.createTest(payload);
        if (response.status === 'success' && response.data) {
          const testId = response.data.id;
          toast.success(response.message || 'Test created successfully!');
          if (requestedStatus === 'draft') {
            navigate('/dashboard');
          } else {
            navigate(`/test/${testId}/questions`);
          }
        } else {
          toast.error(response.message || 'Failed to create test.');
        }
      }
    } catch (error: any) {
      console.error('[TestCreation] Submit error:', error);
      console.error('[TestCreation] Error response data:', error?.response?.data);
      console.error('[TestCreation] Error response status:', error?.response?.status);
      const apiMessage = error?.response?.data?.message || 'Failed to save test details.';
      const validationDetails = error?.response?.data?.errors
        ? ' ' + JSON.stringify(error.response.data.errors)
        : '';
      toast.error(apiMessage + validationDetails);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5B7FEC] mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-gray-500 font-semibold text-sm">Loading test details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {id ? 'Edit Test metadata' : 'Create new assessment'}
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          {id ? 'Modify configurations and marking schemes.' : 'Configure parameters, durations, and criteria for this test.'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm">
        <TestForm
          initialValues={test}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};
