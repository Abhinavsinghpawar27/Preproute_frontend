import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Eye, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { testsApi } from '../api/testsApi';
import type { Test } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Load tests from API
  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const data = await testsApi.getTests();
      // Handle fallback values if API returns null/undefined properties
      setTests(data || []);
    } catch (error: any) {
      console.error('Failed to fetch tests:', error);
      toast.error(error?.response?.data?.message || 'Failed to load tests list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Extract unique subjects for the filter dropdown
  const subjects = ['all', ...Array.from(new Set(tests.map((t) => t.subject).filter(Boolean)))];

  // Filter and search logic
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'live' && test.status === 'live') ||
      (statusFilter === 'draft' && (test.status === 'draft' || test.status === null));
      
    const matchesSubject =
      subjectFilter === 'all' ||
      test.subject?.toLowerCase() === subjectFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleDeleteClick = (testName: string) => {
    toast.error(`Delete action is not supported by the backend API for "${testName}".`, {
      duration: 4000,
    });
  };

  return (
    <div className="space-y-8">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Test Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and track your custom educational assessments.</p>
        </div>
        <button
          onClick={() => navigate('/test/create')}
          className="flex items-center justify-center px-4 py-3 bg-[#5B7FEC] hover:bg-[#4A6FD8] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all shrink-0"
        >
          <Plus className="w-5 h-5 mr-2 stroke-[2.5]" />
          Create New Test
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by test name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] focus:border-transparent text-sm bg-gray-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Subject Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] font-semibold text-gray-700 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'all' ? 'All Subjects' : sub}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs Filter */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            {(['all', 'live', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all duration-150 ${
                  statusFilter === filter
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-850'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Tests Content Grid/Table */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="divide-y divide-gray-150">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 animate-pulse flex items-center justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="h-5 bg-gray-200 rounded-md w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-9 bg-gray-200 rounded-md w-32"></div>
              </div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-[#F0F4FE] rounded-full flex items-center justify-center text-[#5B7FEC] mb-4">
              <BookOpen className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Tests Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              {tests.length === 0
                ? "You haven't created any tests yet. Click the button above to create your first assessment."
                : "No assessments match your active filter settings. Try adjusting your search term or filters."}
            </p>
            {tests.length === 0 && (
              <button
                onClick={() => navigate('/test/create')}
                className="mt-5 px-5 py-2.5 bg-[#5B7FEC] hover:bg-[#4A6FD8] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
              >
                Create First Test
              </button>
            )}
          </div>
        ) : (
          /* Tests Table (Responsive layout) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Test Details</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Topics Covered</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredTests.map((test) => {
                  const isLive = test.status === 'live';
                  const formattedDate = test.created_at
                    ? new Date(test.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={test.id} className="hover:bg-gray-50/50 transition-colors duration-100 group">
                      
                      {/* Name / details */}
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-gray-800 text-sm group-hover:text-[#5B7FEC] transition-colors duration-100">
                          {test.name}
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-1 flex items-center space-x-2">
                          <span className="capitalize">{test.type || 'Chapterwise'}</span>
                          {test.total_time && (
                            <>
                              <span>•</span>
                              <span>{test.total_time} mins</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4.5">
                        <span className="text-sm font-semibold text-gray-600">{test.subject}</span>
                      </td>

                      {/* Topics */}
                      <td className="px-6 py-4.5 max-w-[240px]">
                        <div className="flex flex-wrap gap-1.5">
                          {test.topics && test.topics.length > 0 ? (
                            test.topics.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200"
                              >
                                {topic}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-450 text-xs italic font-medium">None</span>
                          )}
                          {test.topics && test.topics.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold text-gray-400 bg-gray-50 border border-gray-150">
                              +{test.topics.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {test.status || 'draft'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4.5 text-sm font-semibold text-gray-500">
                        {formattedDate}
                      </td>

                      {/* Row Actions */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/test/${test.id}/preview`)}
                            title="View Test"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4 stroke-[2.25]" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/test/${test.id}/edit`)}
                            title="Edit Test"
                            className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Pencil className="w-4 h-4 stroke-[2.25]" />
                          </button>

                          {/* Delete Button (disabled) */}
                          <button
                            onClick={() => handleDeleteClick(test.name)}
                            title="Delete action not supported"
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-all cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.25] opacity-50" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
