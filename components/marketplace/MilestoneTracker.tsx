'use client';

import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaPaperPlane } from 'react-icons/fa';

/**
 * Milestone Tracker Component
 *
 * Displays contract milestones and allows:
 * - Developer: Submit deliverables
 * - Client: Approve or request revision
 */

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'submitted' | 'revision_requested' | 'completed';
  deliverableDescription?: string;
  deliverableUrls?: string[];
  developerNotes?: string;
  clientFeedback?: string;
  requestedChanges?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface MilestoneTrackerProps {
  contractId: string;
  milestones: Milestone[];
  userRole: 'client' | 'developer';
  onMilestoneUpdate: () => void;
}

export default function MilestoneTracker({
  contractId,
  milestones,
  userRole,
  onMilestoneUpdate,
}: MilestoneTrackerProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [deliverableUrls, setDeliverableUrls] = useState<string[]>(['']);
  const [developerNotes, setDeveloperNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'submitted':
        return <FaPaperPlane className="text-blue-500" />;
      case 'revision_requested':
        return <FaTimesCircle className="text-orange-500" />;
      case 'pending':
      default:
        return <FaClock className="text-zinc-600" />;
    }
  };

  const getStatusText = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'submitted':
        return 'Awaiting Approval';
      case 'revision_requested':
        return 'Revision Requested';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const handleSubmitMilestone = async (milestoneId: string) => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/marketplace/milestones/${milestoneId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverableDescription,
          deliverableUrls: deliverableUrls.filter((url) => url.trim() !== ''),
          notes: developerNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit milestone');
      }

      setSelectedMilestone(null);
      setDeliverableDescription('');
      setDeliverableUrls(['']);
      setDeveloperNotes('');
      onMilestoneUpdate();
    } catch (error) {
      console.error('[milestone-tracker] Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/marketplace/milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback || undefined,
          rating,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve milestone');
      }

      setSelectedMilestone(null);
      setFeedback('');
      setRating(5);
      onMilestoneUpdate();
    } catch (error) {
      console.error('[milestone-tracker] Approve error:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectMilestone = async (milestoneId: string) => {
    if (!rejectionReason.trim() || !requestedChanges.trim()) {
      alert('Please provide both a reason and requested changes');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/marketplace/milestones/${milestoneId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectionReason,
          requestedChanges,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject milestone');
      }

      setSelectedMilestone(null);
      setRejectionReason('');
      setRequestedChanges('');
      onMilestoneUpdate();
    } catch (error) {
      console.error('[milestone-tracker] Reject error:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const addDeliverableUrl = () => {
    setDeliverableUrls([...deliverableUrls, '']);
  };

  const updateDeliverableUrl = (index: number, value: string) => {
    const newUrls = [...deliverableUrls];
    newUrls[index] = value;
    setDeliverableUrls(newUrls);
  };

  const removeDeliverableUrl = (index: number) => {
    setDeliverableUrls(deliverableUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-zinc-900 p-6">
      <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-6">
        Contract Milestones
      </h2>

      <div className="space-y-6">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="border border-zinc-900 p-4">
            {/* Milestone Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(milestone.status)}
                  <h3 className="text-sm text-white font-bold uppercase">{milestone.title}</h3>
                </div>
                <p className="text-xs text-zinc-500">{milestone.description}</p>
                <p className="text-xs text-zinc-400 mt-2">
                  {milestone.currency}{parseFloat(milestone.amount.toString()).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-600 uppercase font-mono mb-1">
                  {getStatusText(milestone.status)}
                </div>
              </div>
            </div>

            {/* Submitted Deliverables */}
            {milestone.status !== 'pending' && milestone.deliverableDescription && (
              <div className="border-t border-zinc-900 pt-4 mt-4">
                <p className="text-[10px] text-zinc-600 uppercase font-mono mb-2">Deliverable</p>
                <p className="text-xs text-zinc-400 mb-3">{milestone.deliverableDescription}</p>

                {milestone.deliverableUrls && milestone.deliverableUrls.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-zinc-600 uppercase font-mono mb-2">URLs</p>
                    {milestone.deliverableUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-white hover:text-zinc-400 transition-colors font-mono mb-1"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                )}

                {milestone.developerNotes && (
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase font-mono mb-2">Notes</p>
                    <p className="text-xs text-zinc-500">{milestone.developerNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Revision Request */}
            {milestone.status === 'revision_requested' && milestone.requestedChanges && (
              <div className="border-t border-zinc-900 pt-4 mt-4 bg-zinc-950 p-3">
                <p className="text-[10px] text-orange-500 uppercase font-mono mb-2">
                  Revision Requested
                </p>
                <p className="text-xs text-zinc-500 mb-2">{milestone.rejectionReason}</p>
                <p className="text-[10px] text-zinc-600 uppercase font-mono mb-2">
                  Requested Changes
                </p>
                <p className="text-xs text-zinc-400">{milestone.requestedChanges}</p>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-zinc-900 pt-4 mt-4">
              {/* Developer: Submit Deliverable */}
              {userRole === 'developer' &&
                (milestone.status === 'pending' || milestone.status === 'revision_requested') && (
                  <div>
                    {selectedMilestone === milestone.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-zinc-500 mb-2 block">
                            Deliverable Description *
                          </label>
                          <textarea
                            value={deliverableDescription}
                            onChange={(e) => setDeliverableDescription(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                            rows={4}
                            placeholder="Describe what you've delivered..."
                          />
                        </div>

                        <div>
                          <label className="text-xs text-zinc-500 mb-2 block">
                            Deliverable URLs (GitHub, Drive, etc.)
                          </label>
                          {deliverableUrls.map((url, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                              <input
                                type="url"
                                value={url}
                                onChange={(e) => updateDeliverableUrl(idx, e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                                placeholder="https://..."
                              />
                              {deliverableUrls.length > 1 && (
                                <button
                                  onClick={() => removeDeliverableUrl(idx)}
                                  className="text-xs text-zinc-600 hover:text-white px-3"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addDeliverableUrl}
                            className="text-xs text-zinc-500 hover:text-white font-mono uppercase"
                          >
                            + Add URL
                          </button>
                        </div>

                        <div>
                          <label className="text-xs text-zinc-500 mb-2 block">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={developerNotes}
                            onChange={(e) => setDeveloperNotes(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                            rows={3}
                            placeholder="Any additional notes for the client..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSubmitMilestone(milestone.id)}
                            disabled={submitting || !deliverableDescription.trim()}
                            className="bg-white text-black px-4 py-2 text-xs font-mono uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'Submitting...' : 'Submit Deliverable'}
                          </button>
                          <button
                            onClick={() => setSelectedMilestone(null)}
                            disabled={submitting}
                            className="border border-zinc-900 text-white px-4 py-2 text-xs font-mono uppercase hover:bg-zinc-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedMilestone(milestone.id)}
                        className="text-xs bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors font-mono uppercase"
                      >
                        Submit Deliverable
                      </button>
                    )}
                  </div>
                )}

              {/* Client: Approve or Reject */}
              {userRole === 'client' && milestone.status === 'submitted' && (
                <div>
                  {selectedMilestone === milestone.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-zinc-500 mb-2 block">
                          Feedback (Optional)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          rows={3}
                          placeholder="Your feedback for the developer..."
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-500 mb-2 block">Rating</label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(parseInt(e.target.value))}
                          className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Satisfactory</option>
                          <option value="2">2 - Needs Improvement</option>
                          <option value="1">1 - Poor</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveMilestone(milestone.id)}
                          disabled={submitting}
                          className="bg-green-600 text-white px-4 py-2 text-xs font-mono uppercase hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Approving...' : 'Approve & Release Payment'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMilestone('reject-' + milestone.id);
                          }}
                          disabled={submitting}
                          className="border border-zinc-900 text-white px-4 py-2 text-xs font-mono uppercase hover:bg-zinc-900 transition-colors"
                        >
                          Request Revision
                        </button>
                        <button
                          onClick={() => setSelectedMilestone(null)}
                          disabled={submitting}
                          className="border border-zinc-900 text-zinc-600 px-4 py-2 text-xs font-mono uppercase hover:bg-zinc-900 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : selectedMilestone === 'reject-' + milestone.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-zinc-500 mb-2 block">
                          Reason for Rejection *
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          rows={3}
                          placeholder="Why are you requesting revision?"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-500 mb-2 block">
                          Requested Changes *
                        </label>
                        <textarea
                          value={requestedChanges}
                          onChange={(e) => setRequestedChanges(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          rows={4}
                          placeholder="What specific changes do you need?"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRejectMilestone(milestone.id)}
                          disabled={submitting}
                          className="bg-orange-600 text-white px-4 py-2 text-xs font-mono uppercase hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Request Revision'}
                        </button>
                        <button
                          onClick={() => setSelectedMilestone(milestone.id)}
                          disabled={submitting}
                          className="border border-zinc-900 text-white px-4 py-2 text-xs font-mono uppercase hover:bg-zinc-900 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedMilestone(milestone.id)}
                      className="text-xs bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors font-mono uppercase"
                    >
                      Review Deliverable
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
