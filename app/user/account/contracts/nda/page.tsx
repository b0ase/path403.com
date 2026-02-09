'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiDownload, FiSave, FiCheck, FiEdit, FiClock } from 'react-icons/fi';

export default function NDAPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [contractData, setContractData] = useState({
    party1Name: 'B0ASE.COM LTD',
    party2Name: '[PARTY 2 NAME]',
    party2Company: '[PARTY 2 COMPANY]',
    purpose: '[PURPOSE OF DISCLOSURE]',
    term: '2 years',
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
                MUTUAL NON-DISCLOSURE AGREEMENT
              </h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                Confidentiality & NDA
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
              <div className="text-center border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-bold mb-2">MUTUAL NON-DISCLOSURE AGREEMENT</h2>
                <p className="text-gray-400 text-sm">
                  This Mutual Non-Disclosure Agreement ("Agreement") is entered into on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">PARTIES</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <strong className="text-white">PARTY 1:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.party1Name}
                        onChange={(e) => setContractData({ ...contractData, party1Name: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                      />
                    ) : (
                      <span>{contractData.party1Name}</span>
                    )}
                  </div>
                  <div>
                    <strong className="text-white">PARTY 2:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.party2Name}
                        onChange={(e) => setContractData({ ...contractData, party2Name: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                        placeholder="Name"
                      />
                    ) : (
                      <span>{contractData.party2Name}</span>
                    )}
                  </div>
                  <div>
                    <strong className="text-white">PARTY 2 COMPANY:</strong>{' '}
                    {editing ? (
                      <input
                        type="text"
                        value={contractData.party2Company}
                        onChange={(e) => setContractData({ ...contractData, party2Company: e.target.value })}
                        className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                        placeholder="Company"
                      />
                    ) : (
                      <span>{contractData.party2Company}</span>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">1. PURPOSE</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The parties wish to explore:
                </p>
                {editing ? (
                  <textarea
                    value={contractData.purpose}
                    onChange={(e) => setContractData({ ...contractData, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                    rows={3}
                    placeholder="Purpose of confidential disclosure"
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">{contractData.purpose}</p>
                )}
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">2. DEFINITION OF CONFIDENTIAL INFORMATION</h3>
                <p className="text-sm text-gray-300">
                  "Confidential Information" means all information disclosed by one party ("Disclosing Party") to the
                  other party ("Receiving Party"), whether orally or in writing, that is designated as confidential or
                  that reasonably should be understood to be confidential given the nature of the information and the
                  circumstances of disclosure, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-400 mt-3 space-y-1 ml-4">
                  <li>Business plans, strategies, and methods</li>
                  <li>Technical data, source code, and algorithms</li>
                  <li>Customer and supplier lists</li>
                  <li>Financial information</li>
                  <li>Product development information</li>
                  <li>Marketing and sales information</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">3. OBLIGATIONS OF RECEIVING PARTY</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The Receiving Party shall:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-2 ml-4">
                  <li>Keep all Confidential Information strictly confidential</li>
                  <li>Not disclose Confidential Information to any third party without prior written consent</li>
                  <li>Only use Confidential Information for the Purpose stated above</li>
                  <li>Protect Confidential Information with the same degree of care used for its own confidential information</li>
                  <li>Only disclose Confidential Information to employees who need to know and who are bound by similar obligations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">4. EXCLUSIONS</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Confidential Information does not include information that:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 ml-4">
                  <li>Was already known to the Receiving Party prior to disclosure</li>
                  <li>Is or becomes publicly available through no breach of this Agreement</li>
                  <li>Is independently developed by the Receiving Party</li>
                  <li>Is rightfully obtained from a third party</li>
                  <li>Must be disclosed pursuant to legal requirement</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">5. TERM</h3>
                <p className="text-sm text-gray-300">
                  This Agreement shall remain in effect for{' '}
                  {editing ? (
                    <input
                      type="text"
                      value={contractData.term}
                      onChange={(e) => setContractData({ ...contractData, term: e.target.value })}
                      className="mx-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                      placeholder="2 years"
                    />
                  ) : (
                    <span className="font-bold">{contractData.term}</span>
                  )}{' '}
                  from the date of execution. The obligations of confidentiality shall survive termination of this Agreement.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">6. RETURN OF MATERIALS</h3>
                <p className="text-sm text-gray-300">
                  Upon termination or at the Disclosing Party's request, the Receiving Party shall promptly return or
                  destroy all Confidential Information and any copies thereof.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">7. NO LICENSE</h3>
                <p className="text-sm text-gray-300">
                  Nothing in this Agreement grants any rights in or to the Confidential Information except as expressly
                  set forth herein.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">8. GOVERNING LAW</h3>
                <p className="text-sm text-gray-300">
                  This Agreement shall be governed by and construed in accordance with the laws of England and Wales.
                </p>
              </section>

              <div className="border-t border-gray-800 pt-6 mt-8">
                <h3 className="text-lg font-bold mb-4 text-blue-400">SIGNATURES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Party 1</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">{contractData.party1Name}</p>
                      <p className="text-xs text-gray-500 mt-1">Date: _________________</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Party 2</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">{contractData.party2Name}</p>
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
                    <span className="text-gray-400">Version:</span>
                    <span className="font-bold">1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="font-bold">Dec 15, 2025</span>
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
                  This NDA will be inscribed on the BSV blockchain as an ordinals inscription,
                  creating an immutable record with version history.
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
