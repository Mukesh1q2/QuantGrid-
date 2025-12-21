'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChartBarSquareIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  CalendarDaysIcon,
  CloudArrowDownIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: PresentationChartLineIcon,
    title: 'Market Intelligence',
    description: 'Real-time dashboards with price trends, volume analysis, and market sentiment indicators across all Indian exchanges.',
    color: 'blue'
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Price Forecasting',
    description: 'AI-powered price predictions for DAM, RTM, and bilateral markets with 94% accuracy up to 7 days ahead.',
    color: 'green'
  },
  {
    icon: TableCellsIcon,
    title: 'Custom Reports',
    description: 'Build and schedule custom reports with drag-and-drop builder. Export to Excel, PDF, or integrate via API.',
    color: 'purple'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Portfolio Analysis',
    description: 'Analyze trading performance, cost attribution, and risk exposure across your entire energy portfolio.',
    color: 'orange'
  },
  {
    icon: LightBulbIcon,
    title: 'AI Insights',
    description: 'Get automated insights on market anomalies, trading opportunities, and portfolio optimization recommendations.',
    color: 'cyan'
  },
  {
    icon: CloudArrowDownIcon,
    title: 'Data Export & APIs',
    description: 'Full API access to historical data, real-time feeds, and analytics. Power BI and Tableau integrations.',
    color: 'indigo'
  }
]

const metrics = [
  { value: '10TB+', label: 'Historical Data', sublabel: 'Market records' },
  { value: '94%', label: 'Forecast Accuracy', sublabel: 'Price predictions' },
  { value: '50+', label: 'Data Sources', sublabel: 'Integrated feeds' },
  { value: '1M+', label: 'Reports Generated', sublabel: 'Monthly' }
]

const dataCategories = [
  { name: 'Market Prices', items: ['DAM, RTM, GTAM', 'Bilateral contracts', 'Ancillary services'] },
  { name: 'Supply & Demand', items: ['Generation mix', 'Load forecasts', 'Outage data'] },
  { name: 'Weather', items: ['Solar irradiance', 'Wind speeds', 'Temperature'] },
  { name: 'Regulatory', items: ['Policy updates', 'Tariff changes', 'Compliance alerts'] }
]

export default function AnalystPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Animated chart elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-2 bg-gradient-to-t from-transparent to-pink-400/50 rounded-full"
            style={{ height: '100px', bottom: '20%', left: '15%' }}
            animate={{ height: ['80px', '120px', '80px'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-2 bg-gradient-to-t from-transparent to-purple-400/50 rounded-full"
            style={{ height: '140px', bottom: '20%', left: '20%' }}
            animate={{ height: ['120px', '160px', '120px'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-2 bg-gradient-to-t from-transparent to-indigo-400/50 rounded-full"
            style={{ height: '100px', bottom: '20%', left: '25%' }}
            animate={{ height: ['100px', '80px', '100px'] }}
            transition={{ duration: 1.8, repeat: Infinity }}
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
                <ChartBarSquareIcon className="h-4 w-4 mr-2 text-pink-300" />
                For Energy Market Analysts
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Data-Driven{' '}
                <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                  Insights
                </span>{' '}
                for Energy Markets
              </h1>
              <p className="text-xl text-purple-100 mb-8">
                Access comprehensive market data, advanced analytics, and AI-powered
                forecasts to make better energy trading and procurement decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Explore Analytics
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

            {/* Analytics Dashboard Preview */}
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
                  <span className="text-xs text-gray-400">Analytics Dashboard</span>
                </div>
                <div className="space-y-4">
                  {/* Mini chart */}
                  <div className="h-28 bg-gray-800/50 rounded-lg p-3 flex items-end justify-between">
                    {[65, 80, 45, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-4 bg-gradient-to-t from-purple-500 to-pink-400 rounded-sm"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Avg. MCP Today</div>
                      <div className="text-purple-400 font-mono font-bold text-lg">₹4.82/kWh</div>
                      <div className="text-xs text-green-400">+3.2% ↑</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Tomorrow Forecast</div>
                      <div className="text-pink-400 font-mono font-bold text-lg">₹5.14/kWh</div>
                      <div className="text-xs text-gray-500">94% confidence</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <LightBulbIcon className="h-4 w-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-gray-300">AI Insight: Evening peak expected 15% higher than average</span>
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
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
              Comprehensive Analytics Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything analysts need to understand and predict energy markets
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
                            'bg-indigo-100 dark:bg-indigo-900/50'
                  }`}>
                  <feature.icon className={`h-7 w-7 ${feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          feature.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            feature.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' :
                              'text-indigo-600 dark:text-indigo-400'
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

      {/* Data Categories */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Data Coverage
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Access all the data you need in one unified platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{category.name}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircleIcon className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Analysis?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join analysts at leading energy companies who trust OptiBid for market intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg"
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
