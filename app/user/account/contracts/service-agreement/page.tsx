'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiDownload, FiSave, FiCheck, FiEdit, FiClock } from 'react-icons/fi';

export default function ServiceAgreementPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Contract variables that can be edited
  const [contractData, setContractData] = useState({
    clientName: '[CLIENT NAME]',
    clientCompany: '[CLIENT COMPANY]',
    agentName: 'B0ASE.COM LTD',
    projectDescription: '[PROJECT DESCRIPTION]',
    deliverables: '[DELIVERABLES]',
    timeline: '[TIMELINE]',
    fee: '[FEE AMOUNT]',
    paymentTerms: '[PAYMENT TERMS]',
  });

  const handleSave = async () => {
    // TODO: Save to database and create BSV ordinals inscription
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownload = () => {
    // TODO: Generate PDF
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
        {/* Header */}
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
                STANDARD SERVICE AGREEMENT
              </h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                Professional Services Contract
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
          {/* Contract Content */}
          <div className="lg:col-span-2">
            <div className="border border-gray-800 bg-gray-900/30 p-8 space-y-6">
              {/* Contract Header */}
              <div className="text-center border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-bold mb-2">SERVICE AGREEMENT</h2>
                <p className="text-gray-400 text-sm">
                  This Service Agreement ("Agreement") is entered into on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Parties */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">PARTIES</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <strong className="text-white">SERVICE PROVIDER:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.agentName}
                        onChange={(e) => setContractData({ ...contractData, agentName: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                      />
                    ) : (
                      <span>{contractData.agentName}</span>
                    )}
                  </div>
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
                    <strong className="text-white">CLIENT COMPANY:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.clientCompany}
                        onChange={(e) => setContractData({ ...contractData, clientCompany: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                        placeholder="Company Name"
                      />
                    ) : (
                      <span>{contractData.clientCompany}</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Services */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">1. SERVICES</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The Service Provider agrees to provide the following services ("Services"):
                </p>
                {editing ? (
                  <textarea
                    value={contractData.projectDescription}
                    onChange={(e) => setContractData({ ...contractData, projectDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                    rows={4}
                    placeholder="Describe the project and services to be provided"
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">{contractData.projectDescription}</p>
                )}
              </section>

              {/* Deliverables */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">2. DELIVERABLES</h3>
                {editing ? (
                  <textarea
                    value={contractData.deliverables}
                    onChange={(e) => setContractData({ ...contractData, deliverables: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                    rows={4}
                    placeholder="List expected deliverables"
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">{contractData.deliverables}</p>
                )}
              </section>

              {/* Timeline */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">3. TIMELINE</h3>
                {editing ? (
                  <input
                    type="text"
                    value={contractData.timeline}
                    onChange={(e) => setContractData({ ...contractData, timeline: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm"
                    placeholder="Expected timeline (e.g., 6 weeks from project start)"
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">{contractData.timeline}</p>
                )}
              </section>

              {/* Payment */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">4. PAYMENT TERMS</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <strong className="text-white">Total Fee:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.fee}
                        onChange={(e) => setContractData({ ...contractData, fee: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                        placeholder="£10,000"
                      />
                    ) : (
                      <span>{contractData.fee}</span>
                    )}
                  </div>
                  <div>
                    <strong className="text-white">Payment Schedule:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.paymentTerms}
                        onChange={(e) => setContractData({ ...contractData, paymentTerms: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white w-full mt-1"
                        placeholder="50% upfront, 50% on completion"
                      />
                    ) : (
                      <span>{contractData.paymentTerms}</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Standard Clauses */}
              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">5. INTELLECTUAL PROPERTY</h3>
                <p className="text-sm text-gray-300">
                  Upon full payment, all intellectual property rights in the deliverables shall transfer to the Client.
                  The Service Provider retains rights to any pre-existing materials and tools used in delivery.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">6. CONFIDENTIALITY</h3>
                <p className="text-sm text-gray-300">
                  Both parties agree to maintain confidentiality of any proprietary information shared during the course
                  of this engagement. This obligation survives termination of this Agreement.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">7. TERMINATION</h3>
                <p className="text-sm text-gray-300">
                  Either party may terminate this Agreement with 14 days written notice. Client shall pay for all work
                  completed up to the date of termination.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">8. GOVERNING LAW</h3>
                <p className="text-sm text-gray-300">
                  This Agreement shall be governed by and construed in accordance with the laws of England and Wales.
                </p>
              </section>

              {/* Signatures */}
              <div className="border-t border-gray-800 pt-6 mt-8">
                <h3 className="text-lg font-bold mb-4 text-blue-400">SIGNATURES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Service Provider</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">{contractData.agentName}</p>
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Version Info */}
              <div className="border border-gray-800 bg-gray-900/30 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Contract Info
                </h3>
                <div className="space-y-3 text-sm">
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

              {/* Blockchain Info */}
              <div className="border border-blue-900/30 bg-blue-900/10 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-3">
                  BSV Blockchain
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  This contract will be inscribed on the BSV blockchain as an ordinals inscription,
                  creating an immutable record with version history.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiClock size={12} />
                  <span>Inscription pending</span>
                </div>
              </div>

              {/* Actions */}
              <div className="border border-gray-800 bg-gray-900/30 p-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Actions
                </h3>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Request Client Signature
                </button>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Duplicate Contract
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
