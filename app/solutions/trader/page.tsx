'use client'

import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BoltIcon,
  ChartBarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BeakerIcon,
  DocumentChartBarIcon,
  BellAlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Trading Algorithms',
    description: 'Deploy machine learning models that analyze market patterns, predict price movements, and execute trades with 94.2% accuracy.',
    color: 'blue'
  },
  {
    icon: ClockIcon,
    title: 'Real-Time Market Data',
    description: 'Access sub-millisecond market data feeds from IEX, EPEX, PJM, and other major exchanges with automatic failover.',
    color: 'green'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Advanced Risk Management',
    description: 'Monitor portfolio exposure with 97.8% precision risk assessment and automatic position limits enforcement.',
    color: 'purple'
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Automated Order Execution',
    description: 'Execute trades across DAM, RTM, and bilateral markets with intelligent order routing and slippage control.',
    color: 'orange'
  },
  {
    icon: DocumentChartBarIcon,
    title: 'P&L Analytics Dashboard',
    description: 'Track trading performance in real-time with comprehensive P&L attribution, cost analysis, and margin tracking.',
    color: 'cyan'
  },
  {
    icon: BellAlertIcon,
    title: 'Smart Alerts & Notifications',
    description: 'Receive instant alerts on price movements, position limits, execution status, and market anomalies.',
    color: 'red'
  }
]

const metrics = [
  { value: '94.2%', label: 'Forecast Accuracy', sublabel: 'Price predictions' },
  { value: '<5ms', label: 'Execution Latency', sublabel: 'Order processing' },
  { value: '₹2.4Cr', label: 'Avg. Monthly Savings', sublabel: 'Per enterprise' },
  { value: '99.99%', label: 'Platform Uptime', sublabel: 'SLA guaranteed' }
]

const tradingCapabilities = [
  { name: 'Day-Ahead Market (DAM)', description: 'Optimize 96 time-block bids with price forecasting' },
  { name: 'Real-Time Market (RTM)', description: 'Execute 15-minute interval trades with live signals' },
  { name: 'Green Term Ahead Market (GTAM)', description: 'Trade renewable energy certificates and green power' },
  { name: 'Bilateral Contracts', description: 'Manage long-term power purchase agreements' },
  { name: 'Ancillary Services', description: 'Participate in frequency regulation and reserves' },
  { name: 'Cross-Border Trading', description: 'Access international energy exchanges' }
]

export default function TraderPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
        </div>

        {/* Animated energy lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            style={{ top: '30%' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute h-px w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            style={{ top: '60%' }}
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6">
                <BoltIcon className="h-4 w-4 mr-2 text-yellow-400" />
                For Energy Trading Professionals
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Trade Smarter with{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  AI-Powered
                </span>{' '}
                Intelligence
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Leverage advanced algorithms, real-time analytics, and automated execution
                to maximize trading profits while minimizing risk in India's dynamic energy markets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Watch Demo
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Request Trial
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Trading Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-400">Live Trading Dashboard</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">IEX DAM Price</span>
                    <span className="text-green-400 font-mono font-bold">₹4.82/kWh</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">RTM Signal</span>
                    <span className="text-cyan-400 font-mono font-bold">BUY +2.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Portfolio P&L</span>
                    <span className="text-green-400 font-mono font-bold">+₹12.4L</span>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">📈 Live Price Chart</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {metric.value}
                </div>
                <div className="text-gray-900 dark:text-white font-semibold">{metric.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{metric.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enterprise Trading Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to execute winning trades in India's fast-moving energy markets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
                    feature.color === 'green' ? 'bg-green-100 dark:bg-green-900/50' :
                      feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' :
                        feature.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/50' :
                          feature.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/50' :
                            'bg-red-100 dark:bg-red-900/50'
                  }`}>
                  <feature.icon className={`h-7 w-7 ${feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          feature.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            feature.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' :
                              'text-red-600 dark:text-red-400'
                    }`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Coverage */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Complete Market Coverage
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Trade across all major energy markets with a single unified platform.
                Our integrations ensure you never miss an opportunity.
              </p>
              <div className="space-y-4">
                {tradingCapabilities.map((capability, index) => (
                  <motion.div
                    key={capability.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{capability.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{capability.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Supported Exchanges
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['IEX', 'PXIL', 'HPX', 'EPEX', 'AEMO', 'PJM'].map((exchange) => (
                  <div
                    key={exchange}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <span className="font-bold text-gray-900 dark:text-white">{exchange}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                + 20 more regional exchanges
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading energy traders who are already seeing 23% average improvement in trading margins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              View Pricing
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              Schedule Demo
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
