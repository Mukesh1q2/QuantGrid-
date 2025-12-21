'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Battery100Icon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  BellAlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: ArrowPathIcon,
    title: 'Intelligent Dispatch',
    description: 'AI-optimized charge/discharge scheduling that maximizes arbitrage revenue while maintaining battery health.',
    color: 'green'
  },
  {
    icon: ClockIcon,
    title: 'Multi-Market Stacking',
    description: 'Participate in energy arbitrage, frequency regulation, capacity markets, and ancillary services simultaneously.',
    color: 'blue'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Revenue Optimization',
    description: 'Dynamic bid optimization across all revenue streams with real-time price forecasting and market analysis.',
    color: 'yellow'
  },
  {
    icon: ChartBarIcon,
    title: 'State of Health Monitoring',
    description: 'Track battery degradation, thermal performance, and cycle life with predictive maintenance alerts.',
    color: 'purple'
  },
  {
    icon: DocumentChartBarIcon,
    title: 'Performance Analytics',
    description: 'Comprehensive dashboards for round-trip efficiency, revenue attribution, and ROI tracking.',
    color: 'cyan'
  },
  {
    icon: BellAlertIcon,
    title: 'Warranty Protection',
    description: 'Automated compliance with manufacturer warranty requirements to protect your investment.',
    color: 'orange'
  }
]

const metrics = [
  { value: '32%', label: 'Revenue Increase', sublabel: 'vs. manual dispatch' },
  { value: '2.8GWh', label: 'Storage Managed', sublabel: 'Total capacity' },
  { value: '95%', label: 'Round-Trip Efficiency', sublabel: 'Maintained' },
  { value: '<2min', label: 'Response Time', sublabel: 'To price signals' }
]

const useCases = [
  { name: '⚡ Energy Arbitrage', description: 'Buy low, sell high across time-of-use periods' },
  { name: '🔄 Frequency Regulation', description: 'Fast-response grid stability services' },
  { name: '🏭 Peak Shaving', description: 'Reduce demand charges for C&I customers' },
  { name: '☀️ Solar Shifting', description: 'Store solar generation for evening peaks' },
  { name: '🔌 Backup Power', description: 'Ensure reliability during outages' },
  { name: '📊 Capacity Markets', description: 'Generate revenue from availability' }
]

export default function StoragePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Animated battery charging effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-green-400/30 blur-3xl"
            style={{ bottom: '20%', left: '20%' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl"
            style={{ top: '30%', right: '15%' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
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
                <Battery100Icon className="h-4 w-4 mr-2 text-green-300" />
                For Battery Storage Operators
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Unlock Your{' '}
                <span className="bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent">
                  Storage
                </span>{' '}
                Revenue Potential
              </h1>
              <p className="text-xl text-teal-100 mb-8">
                Optimize battery dispatch, stack multiple revenue streams, and protect
                your investment with AI-powered energy storage management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  See Demo
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Talk to Expert
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Storage Dashboard */}
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
                  <span className="text-xs text-gray-400">BESS Control Panel</span>
                </div>
                <div className="space-y-4">
                  {/* Battery visualization */}
                  <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '72%' }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">72% SoC</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Power</div>
                      <div className="text-green-400 font-mono font-bold">+125 MW</div>
                      <div className="text-xs text-gray-500">Discharging</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Revenue Today</div>
                      <div className="text-cyan-400 font-mono font-bold">₹18.4L</div>
                      <div className="text-xs text-green-500">+12% vs target</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Next Action</span>
                      <span className="text-yellow-400">Charge @ 18:30</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Market Signal</span>
                      <span className="text-green-400">High price window</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics */}
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {metric.value}
                </div>
                <div className="text-gray-900 dark:text-white font-semibold">{metric.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{metric.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Storage Optimization
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Maximize returns from your battery assets with intelligent automation
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
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.color === 'green' ? 'bg-green-100 dark:bg-green-900/50' :
                    feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
                      feature.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                        feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' :
                          feature.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/50' :
                            'bg-orange-100 dark:bg-orange-900/50'
                  }`}>
                  <feature.icon className={`h-7 w-7 ${feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        feature.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                          feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            feature.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' :
                              'text-orange-600 dark:text-orange-400'
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

      {/* Use Cases */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Multiple Revenue Streams
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Stack value from every opportunity in the energy market
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{useCase.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Maximize Storage ROI?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join storage operators achieving 32% higher revenue with OptiBid optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg"
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
