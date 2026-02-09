"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

// ============================================
// CONFIGURATION - Edit these values
// ============================================

const config = {
  // Debt & Savings Goals
  totalDebt: 150000,
  debtYears: 5,
  carGoal: 10000,
  carYears: 2,
  emergencyFundGoal: 10000,
  emergencyYears: 2,

  // Work Schedule
  workDaysPerWeek: 5,
  weeksPerYear: 52,
  holidayWeeks: 4, // 4 weeks holiday per year

  // Location (affects cost of living)
  currency: "$",
};

// ============================================
// HARDWARE INVESTMENTS (One-time)
// ============================================

const hardware = [
  { item: "Mac Studio M2 Max", cost: 2000, priority: "Essential", notes: "Primary development workstation" },
  { item: "MacBook Air/Pro M3", cost: 1200, priority: "Essential", notes: "Mobile development & client meetings" },
  { item: "20TB NAS Storage", cost: 600, priority: "Essential", notes: "Synology DS224+ with 2x10TB drives" },
  { item: "External SSD (2TB)", cost: 150, priority: "Essential", notes: "Fast portable backup & transfer" },
  { item: "4K Monitor (27\")", cost: 400, priority: "High", notes: "External display for Mac Studio" },
  { item: "Mechanical Keyboard", cost: 150, priority: "Medium", notes: "Ergonomic, long-term investment" },
  { item: "Quality Mouse/Trackpad", cost: 100, priority: "Medium", notes: "Magic Trackpad or MX Master" },
  { item: "Webcam (4K)", cost: 150, priority: "Medium", notes: "Client calls & content creation" },
  { item: "Microphone", cost: 200, priority: "Medium", notes: "Blue Yeti or similar for calls/content" },
  { item: "Desk & Chair", cost: 500, priority: "High", notes: "Ergonomic setup, health investment" },
  { item: "Cables & Accessories", cost: 150, priority: "Low", notes: "USB-C hub, cables, etc." },
];

// ============================================
// MONTHLY SOFTWARE & SERVICES
// ============================================

const software = [
  { item: "Vercel Pro", cost: 20, category: "Hosting", notes: "Production hosting for b0ase.com" },
  { item: "Supabase Pro", cost: 25, category: "Database", notes: "PostgreSQL + Auth + Storage" },
  { item: "Domain Renewals", cost: 15, category: "Hosting", notes: "~$180/year for domains" },
  { item: "Twitter/X API (Basic)", cost: 100, category: "APIs", notes: "For startup social automation" },
  { item: "Claude Max/API", cost: 100, category: "APIs", notes: "AI development & agents" },
  { item: "OpenAI API", cost: 50, category: "APIs", notes: "Backup AI, embeddings, etc." },
  { item: "GitHub Pro", cost: 4, category: "Development", notes: "Private repos, actions" },
  { item: "Figma", cost: 15, category: "Design", notes: "UI/UX design work" },
  { item: "Adobe Creative Cloud", cost: 55, category: "Design", notes: "Photoshop, Illustrator, Premiere" },
  { item: "Notion", cost: 10, category: "Productivity", notes: "Documentation & project management" },
  { item: "1Password", cost: 5, category: "Security", notes: "Password management" },
  { item: "Backblaze B2", cost: 10, category: "Backup", notes: "Cloud backup for critical data" },
  { item: "Email (Google Workspace)", cost: 12, category: "Communication", notes: "Professional email" },
  { item: "Zoom Pro", cost: 15, category: "Communication", notes: "Client calls & meetings" },
  { item: "Miscellaneous Tools", cost: 50, category: "Other", notes: "Various SaaS subscriptions" },
];

// ============================================
// MONTHLY OFFICE & LIVING
// ============================================

const office = [
  { item: "Coworking/Office Space", cost: 300, category: "Workspace", notes: "Hot desk or small office" },
  { item: "High-Speed Internet", cost: 80, category: "Utilities", notes: "1Gbps fiber connection" },
  { item: "Phone Plan", cost: 50, category: "Communication", notes: "Unlimited data for mobile" },
  { item: "Electricity", cost: 100, category: "Utilities", notes: "Home office power costs" },
  { item: "Coffee & Supplies", cost: 50, category: "Supplies", notes: "Office supplies, coffee, etc." },
  { item: "Professional Insurance", cost: 100, category: "Insurance", notes: "Liability & equipment insurance" },
  { item: "Accounting Software", cost: 30, category: "Business", notes: "QuickBooks or similar" },
  { item: "Legal/Compliance Reserve", cost: 50, category: "Business", notes: "Set aside for legal needs" },
];

// ============================================
// CALCULATIONS
// ============================================

const hardwareTotal = hardware.reduce((sum, item) => sum + item.cost, 0);
const softwareMonthly = software.reduce((sum, item) => sum + item.cost, 0);
const officeMonthly = office.reduce((sum, item) => sum + item.cost, 0);

const monthlyDebtPayment = config.totalDebt / (config.debtYears * 12);
const monthlyCarSavings = config.carGoal / (config.carYears * 12);
const monthlyEmergencySavings = config.emergencyFundGoal / (config.emergencyYears * 12);

const workingWeeks = config.weeksPerYear - config.holidayWeeks;
const workingDaysPerYear = workingWeeks * config.workDaysPerWeek;

export default function BusinessPlanPage() {
  const [livingExpenses, setLivingExpenses] = useState(2000);
  const [profitMargin, setProfitMargin] = useState(20);

  // Calculate required income
  const monthlyOperational = softwareMonthly + officeMonthly;
  const monthlyPersonal = livingExpenses + monthlyDebtPayment + monthlyCarSavings + monthlyEmergencySavings;
  const monthlyTotal = monthlyOperational + monthlyPersonal;
  const monthlyWithMargin = monthlyTotal * (1 + profitMargin / 100);

  const yearlyRequired = monthlyWithMargin * 12;
  const weeklyRequired = yearlyRequired / workingWeeks;
  const dailyRequired = yearlyRequired / workingDaysPerYear;
  const hourlyRequired = dailyRequired / 8;

  // Revenue targets
  const clientsNeeded = {
    starterPackages: Math.ceil(yearlyRequired / 500), // £500 packages
    monthlyRetainers: Math.ceil(monthlyWithMargin / 199), // £199/mo retainers
    platformLicenses: Math.ceil(yearlyRequired / 25000), // £25k licenses
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              BUSINESS PLAN
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
              What it takes to run b0ase.com
            </p>
          </div>

          {/* Quick Summary */}
          <div className="mb-12 p-6 border border-white/20 bg-white/5">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4">
              The Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold">{config.currency}{dailyRequired.toFixed(0)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Per Day</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{config.currency}{weeklyRequired.toFixed(0)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Per Week</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{config.currency}{monthlyWithMargin.toFixed(0)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Per Month</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{config.currency}{yearlyRequired.toFixed(0)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Per Year</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              This is what you need to earn to cover all costs, pay yourself {config.currency}{livingExpenses.toLocaleString()}/mo,
              pay off {config.currency}{config.totalDebt.toLocaleString()} debt in {config.debtYears} years, save for a {config.currency}{config.carGoal.toLocaleString()} car,
              and maintain a {profitMargin}% profit margin.
            </p>
          </div>

          {/* Adjustable Parameters */}
          <div className="mb-12 p-6 border border-gray-800">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              Adjust Your Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Monthly Living Expenses: {config.currency}{livingExpenses.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="100"
                  value={livingExpenses}
                  onChange={(e) => setLivingExpenses(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{config.currency}1,000</span>
                  <span>{config.currency}5,000</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Profit Margin: {profitMargin}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Investments */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Hardware Investments
            </h2>
            <p className="text-sm text-gray-500 mb-6">One-time setup costs</p>
            <div className="border border-gray-800">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
                <div className="col-span-5 text-xs text-gray-500 uppercase tracking-widest">Item</div>
                <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest">Priority</div>
                <div className="col-span-3 text-xs text-gray-500 uppercase tracking-widest">Notes</div>
                <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest text-right">Cost</div>
              </div>
              {hardware.map((item, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-3 border-b border-gray-800 last:border-b-0">
                  <div className="col-span-5 text-sm text-gray-300">{item.item}</div>
                  <div className="col-span-2">
                    <span className={`text-xs px-2 py-1 ${
                      item.priority === 'Essential' ? 'bg-white/20 text-white' :
                      item.priority === 'High' ? 'bg-gray-700 text-gray-300' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="col-span-3 text-xs text-gray-500">{item.notes}</div>
                  <div className="col-span-2 text-sm text-right">{config.currency}{item.cost.toLocaleString()}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 px-4 py-4 bg-gray-900/30">
                <div className="col-span-10 text-sm font-bold uppercase">Total Hardware</div>
                <div className="col-span-2 text-lg font-bold text-right">{config.currency}{hardwareTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Monthly Software & Services */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Software & Services
            </h2>
            <p className="text-sm text-gray-500 mb-6">Monthly recurring costs</p>
            <div className="border border-gray-800">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
                <div className="col-span-5 text-xs text-gray-500 uppercase tracking-widest">Service</div>
                <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest">Category</div>
                <div className="col-span-3 text-xs text-gray-500 uppercase tracking-widest">Notes</div>
                <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest text-right">/Month</div>
              </div>
              {software.map((item, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-3 border-b border-gray-800 last:border-b-0">
                  <div className="col-span-5 text-sm text-gray-300">{item.item}</div>
                  <div className="col-span-2 text-xs text-gray-500">{item.category}</div>
                  <div className="col-span-3 text-xs text-gray-500">{item.notes}</div>
                  <div className="col-span-2 text-sm text-right">{config.currency}{item.cost}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 px-4 py-4 bg-gray-900/30">
                <div className="col-span-10 text-sm font-bold uppercase">Total Software/Month</div>
                <div className="col-span-2 text-lg font-bold text-right">{config.currency}{softwareMonthly}</div>
              </div>
            </div>
          </div>

          {/* Monthly Office & Living */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Office & Utilities
            </h2>
            <p className="text-sm text-gray-500 mb-6">Monthly operational costs</p>
            <div className="border border-gray-800">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
                <div className="col-span-5 text-xs text-gray-500 uppercase tracking-widest">Expense</div>
                <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest">Category</div>
                <div className="col-span-3 text-xs text-gray-500 uppercase tracking-widest">Notes</div>
                <div className="col-span-2 text-xs text-gray-500 uppercase tracking-widest text-right">/Month</div>
              </div>
              {office.map((item, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-3 border-b border-gray-800 last:border-b-0">
                  <div className="col-span-5 text-sm text-gray-300">{item.item}</div>
                  <div className="col-span-2 text-xs text-gray-500">{item.category}</div>
                  <div className="col-span-3 text-xs text-gray-500">{item.notes}</div>
                  <div className="col-span-2 text-sm text-right">{config.currency}{item.cost}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 px-4 py-4 bg-gray-900/30">
                <div className="col-span-10 text-sm font-bold uppercase">Total Office/Month</div>
                <div className="col-span-2 text-lg font-bold text-right">{config.currency}{officeMonthly}</div>
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Financial Goals
            </h2>
            <p className="text-sm text-gray-500 mb-6">Debt repayment & savings targets</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Debt Repayment */}
              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Debt Repayment</div>
                <div className="text-3xl font-bold mb-1">{config.currency}{monthlyDebtPayment.toFixed(0)}</div>
                <div className="text-sm text-gray-500">/month</div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Total debt</span>
                    <span>{config.currency}{config.totalDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Timeline</span>
                    <span>{config.debtYears} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Yearly payment</span>
                    <span>{config.currency}{(monthlyDebtPayment * 12).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Car Savings */}
              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Car Fund</div>
                <div className="text-3xl font-bold mb-1">{config.currency}{monthlyCarSavings.toFixed(0)}</div>
                <div className="text-sm text-gray-500">/month</div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Target</span>
                    <span>{config.currency}{config.carGoal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Timeline</span>
                    <span>{config.carYears} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Yearly savings</span>
                    <span>{config.currency}{(monthlyCarSavings * 12).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Fund */}
              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Emergency Fund</div>
                <div className="text-3xl font-bold mb-1">{config.currency}{monthlyEmergencySavings.toFixed(0)}</div>
                <div className="text-sm text-gray-500">/month</div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Target</span>
                    <span>{config.currency}{config.emergencyFundGoal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Timeline</span>
                    <span>{config.emergencyYears} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Covers</span>
                    <span>~{Math.floor(config.emergencyFundGoal / monthlyTotal)} months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Schedule & Holidays */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Work Schedule
            </h2>
            <p className="text-sm text-gray-500 mb-6">Time allocation and holidays</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Working Time</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Days per week</span>
                    <span className="font-bold">{config.workDaysPerWeek} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Working weeks per year</span>
                    <span className="font-bold">{workingWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Working days per year</span>
                    <span className="font-bold">{workingDaysPerYear} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hours per day</span>
                    <span className="font-bold">8 hours</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-800">
                    <span className="text-gray-400">Hourly rate needed</span>
                    <span className="font-bold text-lg">{config.currency}{hourlyRequired.toFixed(0)}/hr</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Holiday Allowance</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annual holiday</span>
                    <span className="font-bold">{config.holidayWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Holiday days</span>
                    <span className="font-bold">{config.holidayWeeks * config.workDaysPerWeek} days</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-800">
                    <span className="text-gray-400">Suggested schedule</span>
                    <span className="font-bold text-sm">1 week/quarter</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-900/30 text-xs text-gray-400">
                  <strong>Recommended:</strong> Q1 (Jan), Q2 (Apr), Q3 (Jul/Aug), Q4 (Dec).
                  Plan holidays in advance and block calendar.
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Budget Summary */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Monthly Budget Summary
            </h2>
            <p className="text-sm text-gray-500 mb-6">Where the money goes</p>
            <div className="border border-gray-800">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
                <div className="col-span-8 text-xs text-gray-500 uppercase tracking-widest">Category</div>
                <div className="col-span-4 text-xs text-gray-500 uppercase tracking-widest text-right">Monthly</div>
              </div>

              <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-widest bg-gray-900/20">Business Costs</div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Software & Services</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{softwareMonthly}</div>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Office & Utilities</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{officeMonthly}</div>
              </div>

              <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-widest bg-gray-900/20">Personal</div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Living Expenses (Salary)</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{livingExpenses.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Debt Repayment</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{monthlyDebtPayment.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Car Savings</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{monthlyCarSavings.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Emergency Fund</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{monthlyEmergencySavings.toFixed(0)}</div>
              </div>

              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800 bg-gray-900/20">
                <div className="col-span-8 text-sm font-bold">Subtotal</div>
                <div className="col-span-4 text-sm font-bold text-right">{config.currency}{monthlyTotal.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-800">
                <div className="col-span-8 text-sm text-gray-300">Profit Margin ({profitMargin}%)</div>
                <div className="col-span-4 text-sm text-right">{config.currency}{(monthlyWithMargin - monthlyTotal).toFixed(0)}</div>
              </div>

              <div className="grid grid-cols-12 px-4 py-4 bg-white/5">
                <div className="col-span-8 text-sm font-bold uppercase">Required Monthly Revenue</div>
                <div className="col-span-4 text-xl font-bold text-right">{config.currency}{monthlyWithMargin.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Revenue Targets */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Revenue Targets
            </h2>
            <p className="text-sm text-gray-500 mb-6">How to hit your numbers</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Starter Packages</div>
                <div className="text-4xl font-bold mb-1">{clientsNeeded.starterPackages}</div>
                <div className="text-sm text-gray-500">packages/year @ {config.currency}500</div>
                <div className="text-xs text-gray-600 mt-2">
                  = {Math.ceil(clientsNeeded.starterPackages / 12)} per month
                </div>
              </div>
              <div className="p-6 border border-white/20 bg-white/5">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Monthly Retainers</div>
                <div className="text-4xl font-bold mb-1">{clientsNeeded.monthlyRetainers}</div>
                <div className="text-sm text-gray-500">clients @ {config.currency}199/mo</div>
                <div className="text-xs text-gray-400 mt-2">
                  Recurring revenue target
                </div>
              </div>
              <div className="p-6 border border-gray-800">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Platform Licenses</div>
                <div className="text-4xl font-bold mb-1">{clientsNeeded.platformLicenses}</div>
                <div className="text-sm text-gray-500">licenses/year @ {config.currency}25k</div>
                <div className="text-xs text-gray-600 mt-2">
                  High-ticket sales
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              <strong>Ideal mix:</strong> Build a base of {Math.ceil(clientsNeeded.monthlyRetainers * 0.6)} monthly retainer clients ({config.currency}{(Math.ceil(clientsNeeded.monthlyRetainers * 0.6) * 199).toLocaleString()}/mo recurring),
              supplement with {Math.ceil(clientsNeeded.starterPackages / 12 * 0.5)} packages/month, and land 1 platform license every {Math.ceil(12 / clientsNeeded.platformLicenses)} months.
            </p>
          </div>

          {/* 5-Year Timeline */}
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              5-Year Timeline
            </h2>
            <p className="text-sm text-gray-500 mb-6">Milestones and goals</p>
            <div className="border border-gray-800">
              {[
                { year: 1, goals: ["Set up hardware & workspace", "Build client base to 10 retainers", `Pay off ${config.currency}${(config.totalDebt / 5).toLocaleString()} debt`, "Establish daily rhythm"], debt: config.totalDebt - (config.totalDebt / 5) },
                { year: 2, goals: ["Reach 20 retainer clients", `Save ${config.currency}${config.carGoal.toLocaleString()} for car`, "Build emergency fund", "First platform license sale"], debt: config.totalDebt - (config.totalDebt / 5 * 2) },
                { year: 3, goals: ["Buy car", "30 retainer clients", "Hire first contractor", "Take 5 weeks holiday"], debt: config.totalDebt - (config.totalDebt / 5 * 3) },
                { year: 4, goals: ["40 retainer clients", "Consider office upgrade", "Build team to 2-3 people", "Increase salary 20%"], debt: config.totalDebt - (config.totalDebt / 5 * 4) },
                { year: 5, goals: ["Debt free!", "50+ retainer clients", "Stable team", "6 weeks holiday"], debt: 0 },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-4 border-b border-gray-800 last:border-b-0">
                  <div className="col-span-2">
                    <div className="text-2xl font-bold">Y{item.year}</div>
                    <div className="text-xs text-gray-500">Year {item.year}</div>
                  </div>
                  <div className="col-span-7">
                    <ul className="space-y-1">
                      {item.goals.map((goal, j) => (
                        <li key={j} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="text-gray-600">+</span> {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="text-sm text-gray-500">Remaining debt</div>
                    <div className={`text-lg font-bold ${item.debt === 0 ? 'text-green-500' : ''}`}>
                      {item.debt === 0 ? 'DEBT FREE' : `${config.currency}${item.debt.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-8 border border-gray-800 bg-gray-900/30">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4">
              Next Steps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-gray-400 mb-2">This Week</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>+ Order Mac Studio & MacBook</li>
                  <li>+ Set up NAS storage</li>
                  <li>+ Configure development environment</li>
                  <li>+ Set up business bank account</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-gray-400 mb-2">This Month</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>+ Land first 3 retainer clients</li>
                  <li>+ Set up all software subscriptions</li>
                  <li>+ Create client onboarding process</li>
                  <li>+ Block holiday weeks in calendar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              All figures are estimates. Adjust the sliders above to match your actual situation.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
