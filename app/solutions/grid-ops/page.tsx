'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ServerStackIcon,
  BoltIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  CogIcon,
  ArrowPathIcon,
  SignalIcon,
  MapIcon,
  ClockIcon,
  BellAlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: SignalIcon,
    title: 'Real-Time Grid Monitoring',
    description: 'Monitor frequency, voltage, and power flow across the grid with sub-second latency for instant situational awareness.',
    color: 'blue'
  },
  {
    icon: ArrowPathIcon,
    title: 'Load Balancing Optimization',
    description: 'AI-driven algorithms automatically balance load across transmission lines to prevent congestion and maximize efficiency.',
    color: 'green'
  },
  {
    icon: ShieldExclamationIcon,
    title: 'Outage Management',
    description: 'Predict potential failures, manage restoration workflows, and minimize customer impact with automated response protocols.',
    color: 'red'
  },
  {
    icon: CpuChipIcon,
    title: 'Demand Forecasting',
    description: 'Accurate 15-minute to 7-day demand forecasts using weather, calendar, and historical consumption patterns.',
    color: 'purple'
  },
  {
    icon: MapIcon,
    title: 'Network Visualization',
    description: 'Interactive grid maps showing real-time asset status, power flows, and constraint visualization.',
    color: 'cyan'
  },
  {
    icon: BellAlertIcon,
    title: 'Alert Management',
    description: 'Intelligent alert prioritization and escalation with configurable thresholds and notification channels.',
    color: 'orange'
  }
]

const metrics = [
  { value: '99.97%', label: 'Grid Reliability', sublabel: 'Uptime achieved' },
  { value: '45%', label: 'Faster Response', sublabel: 'To grid events' },
  { value: '₹180Cr', label: 'Loss Reduction', sublabel: 'Annual savings' },
  { value: '500+', label: 'Substations', sublabel: 'Monitored' }
]

const capabilities = [
  { name: 'SCADA Integration', description: 'Connect to existing SCADA systems for unified monitoring' },
  { name: 'Frequency Regulation', description: 'Automatic generation control and primary response' },
  { name: 'Voltage Management', description: 'Reactive power optimization and VAR control' },
  { name: 'Contingency Analysis', description: 'N-1 and N-2 security assessment in real-time' },
  { name: 'Renewable Integration', description: 'Manage variability from solar and wind resources' },
  { name: 'State Estimation', description: 'Real-time network topology and power flow analysis' }
]

export default function GridOpsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-blue-800 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px), repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)'
          }}></div>
        </div>

        {/* Animated grid lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"
            style={{ left: '25%' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"
            style={{ left: '75%' }}
            animate={{ opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
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
                <ServerStackIcon className="h-4 w-4 mr-2 text-cyan-400" />
                For Grid Operators & DISCOMs
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Operate Smarter{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Grids
                </span>{' '}
                with AI
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Ensure grid stability, prevent outages, and optimize power flows with
                intelligent monitoring and automated response systems for modern grid operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  See Live Demo
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Contact Sales
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Grid Control Dashboard */}
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
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs text-gray-400">Grid Control Center</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-500/20 rounded-lg p-3 text-center">
                      <div className="text-green-400 font-bold text-lg">50.02</div>
                      <div className="text-xs text-gray-400">Frequency (Hz)</div>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-blue-400 font-bold text-lg">412kV</div>
                      <div className="text-xs text-gray-400">Voltage</div>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                      <div className="text-purple-400 font-bold text-lg">15.2GW</div>
                      <div className="text-xs text-gray-400">Load</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-2">Network Status</div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Northern Region</span>
                      <span className="text-green-400">● Normal</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-300">Southern Region</span>
                      <span className="text-green-400">● Normal</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-300">Western Region</span>
                      <span className="text-yellow-400">● Alert</span>
                    </div>
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
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
              Complete Grid Operations Suite
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage modern power grids efficiently and reliably
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
                      feature.color === 'red' ? 'bg-red-100 dark:bg-red-900/50' :
                        feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' :
                          feature.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/50' :
                            'bg-orange-100 dark:bg-orange-900/50'
                  }`}>
                  <feature.icon className={`h-7 w-7 ${feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        feature.color === 'red' ? 'text-red-600 dark:text-red-400' :
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

      {/* Capabilities */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Advanced Grid Capabilities
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Integrate with your existing infrastructure and unlock new levels of grid intelligence.
              </p>
              <div className="space-y-4">
                {capabilities.map((capability, index) => (
                  <motion.div
                    key={capability.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{capability.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{capability.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800/50 dark:to-blue-900/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by Leading Utilities
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our platform is deployed across major power utilities managing critical infrastructure.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Utilities</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100GW</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Managed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Modernize Your Grid?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            See how OptiBid can help you achieve 99.97% grid reliability and reduce operational costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              View Pricing
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              Contact Us
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
