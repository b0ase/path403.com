'use client';

import React, { useState, useEffect } from 'react';
import { useN8n } from '@/lib/hooks/useN8n';
import { FaPlay, FaCog, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

interface N8nWorkflowTriggerProps {
  workflowId?: string;
  workflowName?: string;
  defaultData?: any;
  onSuccess?: (execution: any) => void;
  onError?: (error: string) => void;
  className?: string;
  buttonText?: string;
  showDataInput?: boolean;
}

export default function N8nWorkflowTrigger({
  workflowId,
  workflowName,
  defaultData = {},
  onSuccess,
  onError,
  className = '',
  buttonText = 'Trigger Workflow',
  showDataInput = false
}: N8nWorkflowTriggerProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflowId || '');
  const [customData, setCustomData] = useState(JSON.stringify(defaultData, null, 2));
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<any>(null);
  const [showDataEditor, setShowDataEditor] = useState(showDataInput);

  const { workflows, loading, error, loadWorkflows, executeWorkflow } = useN8n();

  useEffect(() => {
    if (!workflowId) {
      loadWorkflows();
    }
  }, [workflowId, loadWorkflows]);

  const handleExecute = async () => {
    if (!selectedWorkflowId) {
      onError?.('Please select a workflow');
      return;
    }

    setIsExecuting(true);
    try {
      let data = defaultData;
      if (showDataEditor && customData) {
        try {
          data = JSON.parse(customData);
        } catch (err) {
          onError?.('Invalid JSON data');
          return;
        }
      }

      const execution = await executeWorkflow(selectedWorkflowId, data);
      if (execution) {
        setLastExecution(execution);
        onSuccess?.(execution);
      } else {
        onError?.('Failed to execute workflow');
      }
    } catch (err) {
      onError?.('Error executing workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  const getWorkflowName = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    return workflow?.name || id;
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="space-y-4">
        {/* Workflow Selection */}
        {!workflowId && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Workflow
            </label>
            <select
              value={selectedWorkflowId}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Choose a workflow...</option>
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name} {workflow.active ? '(Active)' : '(Inactive)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Workflow Info */}
        {selectedWorkflowId && (
          <div className="bg-gray-700 rounded-md p-3">
            <h3 className="text-white font-medium">
              {workflowName || getWorkflowName(selectedWorkflowId)}
            </h3>
            <p className="text-gray-400 text-sm">ID: {selectedWorkflowId}</p>
          </div>
        )}

        {/* Data Input */}
        {showDataEditor && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Input Data (JSON)
              </label>
              <button
                onClick={() => setShowDataEditor(!showDataEditor)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {showDataEditor ? 'Hide' : 'Show'} Editor
              </button>
            </div>
            {showDataEditor && (
              <textarea
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter JSON data for the workflow..."
              />
            )}
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={isExecuting || !selectedWorkflowId}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isExecuting || !selectedWorkflowId
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isExecuting ? (
            <>
              <FaSpinner className="animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <FaPlay />
              {buttonText}
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-md p-3">
            <div className="flex items-center gap-2">
              <FaTimes className="text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Success Display */}
        {lastExecution && (
          <div className="bg-green-900 border border-green-700 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <FaCheck className="text-green-400" />
              <span className="text-green-200 font-medium">Workflow executed successfully!</span>
            </div>
            <div className="text-green-300 text-sm">
              <p>Execution ID: {lastExecution.id}</p>
              <p>Status: {lastExecution.status}</p>
              <p>Started: {new Date(lastExecution.startedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 