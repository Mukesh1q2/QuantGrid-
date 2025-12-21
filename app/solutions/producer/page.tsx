'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  SunIcon,
  BoltIcon,
  ChartBarIcon,
  CloudIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  DocumentChartBarIcon,
  BellAlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  Battery100Icon,
  SignalIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: SunIcon,
    title: 'Generation Forecasting',
    description: 'AI-powered predictions for solar and wind output with 96% accuracy using weather data, satellite imagery, and historical patterns.',
    color: 'yellow'
  },
  {
    icon: CloudIcon,
    title: 'Weather Integration',
    description: 'Real-time weather data from 50+ sources integrated with irradiance and wind speed modeling for precise generation estimates.',
    color: 'blue'
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Revenue Optimization',
    description: 'Maximize revenue by automatically scheduling generation during peak price periods and optimizing market participation.',
    color: 'green'
  },
  {
    icon: CogIcon,
    title: 'Plant Performance Monitoring',
    description: 'Track inverter efficiency, panel degradation, and O&M metrics with predictive maintenance alerts.',
    color: 'purple'
  },
  {
    icon: DocumentChartBarIcon,
    title: 'Regulatory Compliance',
    description: 'Automated reporting for CERC, SERCs, and RPO obligations with audit-ready documentation.',
    color: 'orange'
  },
  {
    icon: Battery100Icon,
    title: 'Storage Integration',
    description: 'Seamlessly coordinate generation with battery storage for arbitrage and grid services revenue.',
    color: 'cyan'
  }
]

const metrics = [
  { value: '96%', label: 'Forecast Accuracy', sublabel: 'Generation predictions' },
  { value: '18%', label: 'Revenue Increase', sublabel: 'vs. manual scheduling' },
  { value: '12GW', label: 'Capacity Managed', sublabel: 'Across India' },
  { value: '₹850Cr', label: 'Value Generated', sublabel: 'For producers' }
]

const plantTypes = [
  { name: 'Solar PV', icon: '☀️', capacity: '500+ MW typical' },
  { name: 'Wind Farms', icon: '🌬️', capacity: '200+ MW typical' },
  { name: 'Hybrid Plants', icon: '⚡', capacity: 'Solar + Wind + Storage' },
  { name: 'Rooftop Solar', icon: '🏢', capacity: 'Commercial & Industrial' },
  { name: 'Floating Solar', icon: '🌊', capacity: 'Reservoir installations' },
  { name: 'Small Hydro', icon: '💧', capacity: 'Run-of-river projects' }
]

export default function ProducerPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 0L100 50L50 100L0 50Z" fill="%23ffffff" fill-opacity="0.05"/%3E%3C/svg%3E")',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Animated sun rays */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-yellow-400/20 blur-3xl"
            style={{ top: '-10%', right: '10%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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
                <SunIcon className="h-4 w-4 mr-2 text-yellow-300" />
                For Renewable Energy Producers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Maximize Your{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Clean Energy
                </span>{' '}
                Revenue
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Optimize generation scheduling, improve forecasting accuracy, and unlock
                new revenue streams with AI-powered plant optimization for solar, wind, and hybrid assets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  See It In Action
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Get Started
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Generation Dashboard Preview */}
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
                  <span className="text-xs text-gray-400">Plant Dashboard - Live</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300 flex items-center">
                      <SunIcon className="h-4 w-4 mr-2 text-yellow-400" />
                      Current Output
                    </span>
                    <span className="text-green-400 font-mono font-bold">847 MW</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300 flex items-center">
                      <SignalIcon className="h-4 w-4 mr-2 text-blue-400" />
                      Forecast vs Actual
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">+2.1% ↑</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300 flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-400" />
                      Today's Revenue
                    </span>
                    <span className="text-green-400 font-mono font-bold">₹2.4Cr</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                      <div className="text-yellow-400 font-bold">92%</div>
                      <div className="text-xs text-gray-400">PLF</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3 text-center">
                      <div className="text-green-400 font-bold">99.1%</div>
                      <div className="text-xs text-gray-400">Availability</div>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-blue-400 font-bold">Low</div>
                      <div className="text-xs text-gray-400">Deviation</div>
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-2">
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
              Complete Producer Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From forecasting to compliance, manage your entire renewable portfolio in one place
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
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                    feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
                      feature.color === 'green' ? 'bg-green-100 dark:bg-green-900/50' :
                        feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' :
                          feature.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/50' :
                            'bg-cyan-100 dark:bg-cyan-900/50'
                  }`}>
                  <feature.icon className={`h-7 w-7 ${feature.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            feature.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                              'text-cyan-600 dark:text-cyan-400'
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

      {/* Supported Plant Types */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Renewable Asset Types
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Purpose-built for India's diverse renewable energy landscape
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {plantTypes.map((plant, index) => (
              <motion.div
                key={plant.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 text-center border border-green-200 dark:border-green-800"
              >
                <div className="text-4xl mb-3">{plant.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plant.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{plant.capacity}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Assets?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join 150+ renewable energy producers who trust OptiBid to maximize their generation revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all shadow-lg"
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
