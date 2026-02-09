'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiDownload, FiSave, FiCheck, FiEdit, FiClock } from 'react-icons/fi';

export default function IPTransferPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [contractData, setContractData] = useState({
    transferorName: '[TRANSFEROR NAME]',
    transferorCompany: '[TRANSFEROR COMPANY]',
    transfereeName: '[TRANSFEREE NAME]',
    transfereeCompany: '[TRANSFEREE COMPANY]',
    ipDescription: '[DESCRIPTION OF INTELLECTUAL PROPERTY]',
    consideration: '[CONSIDERATION/PAYMENT]',
    effectiveDate: new Date().toISOString().split('T')[0],
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
                INTELLECTUAL PROPERTY TRANSFER AGREEMENT
              </h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                IP Assignment & Transfer
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
                <h2 className="text-2xl font-bold mb-2">INTELLECTUAL PROPERTY TRANSFER AGREEMENT</h2>
                <p className="text-gray-400 text-sm">
                  This IP Transfer Agreement ("Agreement") is entered into on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">PARTIES</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <strong className="text-white">TRANSFEROR (Seller):</strong>
                    <div className="ml-4 mt-1 space-y-1">
                      <div>
                        Name:{' '}
                        {editing ? (
                          <input
                            type="text"
                            value={contractData.transferorName}
                            onChange={(e) => setContractData({ ...contractData, transferorName: e.target.value })}
                            className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                            placeholder="Name"
                          />
                        ) : (
                          <span>{contractData.transferorName}</span>
                        )}
                      </div>
                      <div>
                        Company:{' '}
                        {editing ? (
                          <input
                            type="text"
                            value={contractData.transferorCompany}
                            onChange={(e) => setContractData({ ...contractData, transferorCompany: e.target.value })}
                            className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                            placeholder="Company"
                          />
                        ) : (
                          <span>{contractData.transferorCompany}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <strong className="text-white">TRANSFEREE (Buyer):</strong>
                    <div className="ml-4 mt-1 space-y-1">
                      <div>
                        Name:{' '}
                        {editing ? (
                          <input
                            type="text"
                            value={contractData.transfereeName}
                            onChange={(e) => setContractData({ ...contractData, transfereeName: e.target.value })}
                            className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                            placeholder="Name"
                          />
                        ) : (
                          <span>{contractData.transfereeName}</span>
                        )}
                      </div>
                      <div>
                        Company:{' '}
                        {editing ? (
                          <input
                            type="text"
                            value={contractData.transfereeCompany}
                            onChange={(e) => setContractData({ ...contractData, transfereeCompany: e.target.value })}
                            className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                            placeholder="Company"
                          />
                        ) : (
                          <span>{contractData.transfereeCompany}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">1. INTELLECTUAL PROPERTY</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The Transferor hereby assigns, transfers, and conveys to the Transferee all right, title, and interest in and to the following intellectual property ("IP"):
                </p>
                {editing ? (
                  <textarea
                    value={contractData.ipDescription}
                    onChange={(e) => setContractData({ ...contractData, ipDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                    rows={5}
                    placeholder="Describe the intellectual property in detail: patents, copyrights, trademarks, source code, designs, etc."
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">{contractData.ipDescription}</p>
                )}
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">2. TRANSFER OF RIGHTS</h3>
                <p className="text-sm text-gray-300 mb-3">
                  The transfer includes, without limitation:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 ml-4">
                  <li>All copyrights and the right to register such copyrights</li>
                  <li>All patent rights and applications</li>
                  <li>All trademark rights and goodwill</li>
                  <li>All trade secrets and confidential information</li>
                  <li>All rights to derivative works</li>
                  <li>All source code, documentation, and related materials</li>
                  <li>All rights to sue for past, present, and future infringement</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">3. CONSIDERATION</h3>
                <p className="text-sm text-gray-300">
                  In consideration for this transfer, Transferee shall pay Transferor:
                </p>
                <div className="mt-3">
                  {editing ? (
                    <textarea
                      value={contractData.consideration}
                      onChange={(e) => setContractData({ ...contractData, consideration: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm resize-none"
                      rows={2}
                      placeholder="£50,000 payable in full upon execution of this Agreement"
                    />
                  ) : (
                    <p className="text-sm text-gray-400 italic ml-4">{contractData.consideration}</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">4. REPRESENTATIONS & WARRANTIES</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p><strong className="text-white">4.1 Ownership:</strong> Transferor represents and warrants that it is the sole and exclusive owner of the IP and has full right and authority to transfer the IP.</p>

                  <p><strong className="text-white">4.2 No Encumbrances:</strong> The IP is free and clear of all liens, claims, encumbrances, and security interests.</p>

                  <p><strong className="text-white">4.3 No Infringement:</strong> To Transferor's knowledge, the IP does not infringe upon the rights of any third party.</p>

                  <p><strong className="text-white">4.4 No Pending Claims:</strong> There are no pending or threatened claims, litigation, or disputes relating to the IP.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">5. FURTHER ASSURANCES</h3>
                <p className="text-sm text-gray-300">
                  Transferor agrees to execute any additional documents and take any further actions reasonably necessary to effectuate the transfer of the IP, including but not limited to assignments recordable with the UK Intellectual Property Office or other relevant authorities.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">6. INDEMNIFICATION</h3>
                <p className="text-sm text-gray-300">
                  Transferor agrees to indemnify and hold harmless Transferee from any claims, damages, or liabilities arising from any breach of the representations and warranties contained herein.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 text-blue-400">7. EFFECTIVE DATE</h3>
                <p className="text-sm text-gray-300">
                  This transfer shall be effective as of:{' '}
                  {editing ? (
                    <input
                      type="date"
                      value={contractData.effectiveDate}
                      onChange={(e) => setContractData({ ...contractData, effectiveDate: e.target.value })}
                      className="ml-2 px-2 py-1 bg-gray-800 border border-gray-700 text-white"
                    />
                  ) : (
                    <span className="font-bold">
                      {new Date(contractData.effectiveDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  )}
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
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Transferor</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">{contractData.transferorName}</p>
                      <p className="text-xs text-gray-400">{contractData.transferorCompany}</p>
                      <p className="text-xs text-gray-500 mt-1">Date: _________________</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Transferee</p>
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-sm font-bold">{contractData.transfereeName}</p>
                      <p className="text-xs text-gray-400">{contractData.transfereeCompany}</p>
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
                    <span className="font-bold">Nov 10, 2025</span>
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
                  This IP transfer will be inscribed on the BSV blockchain, creating a permanent, tamper-proof record of the transaction.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiClock size={12} />
                  <span>Inscription pending</span>
                </div>
              </div>

              <div className="border border-yellow-900/30 bg-yellow-900/10 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-400 mb-3">
                  Legal Notice
                </h3>
                <p className="text-xs text-gray-400">
                  IP transfers should be reviewed by legal counsel. This template is provided for convenience but may need customization for your specific situation.
                </p>
              </div>

              <div className="border border-gray-800 bg-gray-900/30 p-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Actions
                </h3>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Request Signatures
                </button>
                <button className="w-full py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                  Record with IP Office
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
