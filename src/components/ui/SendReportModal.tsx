'use client';
import { useState } from 'react';

interface SendReportModalProps {
  open: boolean;
  title: string;
  description: string;
  sending: boolean;
  onClose: () => void;
  onSend: (dateFrom: string, dateTo: string) => void;
}

export default function SendReportModal({
  open, title, description, sending, onClose, onSend,
}: SendReportModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(today);

  if (!open) return null;

  const isValid = !!(dateFrom && dateTo && dateFrom <= dateTo);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2.5 bg-green-100 rounded-xl flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Date range picker */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Select Date Range
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || today}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={today}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          {dateFrom && dateTo && dateFrom > dateTo && (
            <p className="text-xs text-red-600 mt-1">&quot;From&quot; must be before &quot;To&quot;.</p>
          )}
          <p className="text-xs text-gray-400">
            Orders and activity within this range will be included.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(dateFrom, dateTo)}
            disabled={sending || !isValid}
            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending...
              </>
            ) : (
              'Send Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
