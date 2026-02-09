'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiDownload, FiSave, FiCheck, FiEdit, FiClock, FiAlertTriangle } from 'react-icons/fi';

export default function AIRiderPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [contractData, setContractData] = useState({
    clientName: '[CLIENT NAME]',
    projectName: '[PROJECT NAME]',
    aiModels: '[AI MODELS TO BE USED]',
    dataRetention: '90 days',
    trainingData: '[TRAINING DATA DETAILS]',
  });

  const handleSave = async () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownload = () => {
    alert('PDF download will be implemented with actual contract system');
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 md:px-8 py-16">
        <div className="mb-8 border-b border-gray-800 pb-6">
          <Link
            href="/user/account?tab=contracts"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
          >
            <FiArrowLeft /> Back to Contracts
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                AI DEVELOPMENT RIDER
              </h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                AI/ML Services Addendum
              </p>
            </div>

            <div className="flex gap-3">
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/50 text-green-400 text-sm"
                >
                  <FiCheck size={14} />
                  Saved
                </motion.div>
              )}

              {editing ? (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-bold"
                >
                  <FiSave size={14} />
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                >
                  <FiEdit size={14} />
                  Edit Contract
                </button>
              )}

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-bold"
              >
                <FiDownload size={14} />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border border-gray-800 bg-gray-900/30 p-8 space-y-6">
              {/* Warning Box */}
              <div className="border border-yellow-900/30 bg-yellow-900/10 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-yellow-400 mb-1">AI Development Addendum</h4>
                    <p className="text-xs text-gray-400">
                      This rider should be attached to a main Service Agreement. It specifies terms specific to AI and machine learning development work.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-bold mb-2">AI DEVELOPMENT RIDER</h2>
                <p className="text-gray-400 text-sm">
                  Addendum to Service Agreement dated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">PARTIES & PROJECT</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <strong className="text-white">CLIENT:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.clientName}
                        onChange={(e) => setContractData({ ...contractData, clientName: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                        placeholder="Client Name"
                      />
                    ) : (
                      <span>{contractData.clientName}</span>
                    )}
                  </div>
                  <div>
                    <strong className="text-white">PROJECT:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.projectName}
                        onChange={(e) => setContractData({ ...contractData, projectName: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white w-full mt-1"
                        placeholder="Project Name"
                      />
                    ) : (
                      <span>{contractData.projectName}</span>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">1. AI MODELS & TOOLS</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The following AI models and tools will be utilized:
                </p>
                {editing ? (
                  <textarea
                    value={contractData.aiModels}
                    onChange={(e) => setContractData({ ...contractData, aiModels: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                    rows={3}
                    placeholder="e.g., Claude 3.5 Sonnet, GPT-4, Custom models, etc."
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">{contractData.aiModels}</p>
                )}
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">2. DATA USAGE & PRIVACY</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p><strong className="text-white">2.1 Training Data:</strong></p>
                  {editing ? (
                    <textarea
                      value={contractData.trainingData}
                      onChange={(e) => setContractData({ ...contractData, trainingData: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                      rows={2}
                      placeholder="Specify what data will be used for training"
                    />
                  ) : (
                    <p className="text-gray-400 italic ml-4">{contractData.trainingData}</p>
                  )}

                  <p className="mt-3"><strong className="text-white">2.2 Data Retention:</strong></p>
                  <p className="text-gray-400 ml-4">
                    Client data will be retained for{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.dataRetention}
                        onChange={(e) => setContractData({ ...contractData, dataRetention: e.target.value })}
                        className="mx-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                        placeholder="90 days"
                      />
                    ) : (
                      <span className="font-bold">{contractData.dataRetention}</span>
                    )}{' '}
                    after project completion, unless otherwise agreed.
                  </p>

                  <p className="mt-3"><strong className="text-white">2.3 Third-Party AI Services:</strong></p>
                  <p className="text-gray-400 ml-4">
                    Client acknowledges that third-party AI services (e.g., Anthropic, OpenAI) may be used,
                    and their respective terms of service and privacy policies apply.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">3. MODEL PERFORMANCE & LIMITATIONS</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">3.1 No Guarantees:</strong> AI models are probabilistic by nature. Service Provider makes no guarantees regarding accuracy, performance, or specific outcomes.</p>

                  <p><strong className="text-white">3.2 Continuous Improvement:</strong> AI models may be updated or improved during the project term, which may affect output characteristics.</p>

                  <p><strong className="text-white">3.3 Bias & Fairness:</strong> Client acknowledges potential for bias in AI outputs. Service Provider will make reasonable efforts to identify and mitigate bias but cannot guarantee complete elimination.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">4. INTELLECTUAL PROPERTY IN AI OUTPUTS</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">4.1 Generated Content:</strong> Content generated by AI models using Client data shall be owned by the Client upon full payment.</p>

                  <p><strong className="text-white">4.2 Model Weights:</strong> Any custom model weights or fine-tuned models created specifically for Client shall be Client property, subject to full payment.</p>

                  <p><strong className="text-white">4.3 Pre-existing Models:</strong> Service Provider retains all rights to pre-existing AI models, tools, and methodologies.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">5. ETHICAL AI USE</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>Both parties agree to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Not use AI systems for illegal, harmful, or unethical purposes</li>
                    <li>Respect copyright and intellectual property in training data</li>
                    <li>Disclose AI involvement where legally or ethically required</li>
                    <li>Not use AI to create deepfakes or misleading content without clear disclosure</li>
                    <li>Implement appropriate safeguards for AI systems</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">6. LIABILITY LIMITATIONS</h3>
                <p className="text-sm text-gray-300">
                  Given the experimental nature of AI technology, Service Provider's liability is limited to the amount
                  paid under the main Service Agreement. Client assumes risk for deployment of AI systems in
                  production environments.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">7. REGULATORY COMPLIANCE</h3>
                <p className="text-sm text-gray-300">
                  Client is responsible for ensuring AI system deployment complies with applicable regulations
                  (e.g., GDPR, AI Act, industry-specific regulations). Service Provider will provide reasonable
                  documentation to support compliance efforts.
                </p>
              </section>

              <div className="border-t border-gray-800 pt-6 mt-8">
                <h3 className="text-lg font-bold mb-4 text-blue-400">SIGNATURES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Service Provider</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">B0ASE.COM LTD</p>
                      <p className="text-xs text-gray-500 mt-1">Date: _________________</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Client</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">{contractData.clientName}</p>
                      <p className="text-xs text-gray-500 mt-1">Date: _________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="border border-gray-800 bg-gray-900/30 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Contract Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-bold">Rider/Addendum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version:</span>
                    <span className="font-bold">1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="font-bold">Jan 15, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs uppercase">
                      Draft
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-blue-900/30 bg-blue-900/10 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-3">
                  BSV Blockchain
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  This AI rider will be inscribed on the BSV blockchain alongside the main service agreement.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiClock size={12} />
                  <span>Inscription pending</span>
                </div>
              </div>

              <div className="border border-gray-800 bg-gray-900/30 p-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Actions
                </h3>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Request Signature
                </button>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Attach to Service Agreement
                </button>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
