import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about OptiBid Energy and our mission to transform energy trading with AI-powered optimization.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              About OptiBid Energy
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Transforming energy trading with AI-powered optimization
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                OptiBid Energy is revolutionizing the energy trading landscape with cutting-edge AI technology,
                real-time analytics, and enterprise-grade solutions. We empower energy professionals to make
                data-driven decisions and optimize their trading strategies.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We address critical challenges in energy markets: price volatility, grid stability,
                renewable integration, and the global transition to net-zero carbon emissions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                To become the world's leading energy trading platform, enabling sustainable energy markets
                through advanced technology, transparency, and innovation.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span> Carbon-neutral operations by 2025
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span> 50+ country expansion by 2026
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <span className="text-green-500 mr-2">✓</span> 1GW renewable capacity optimized
                </div>
              </div>
            </div>
          </div>

          {/* Leadership Team */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[
                { name: 'Sarah Chen', role: 'CEO & Co-Founder', icon: '👩‍💼', bg: 'from-blue-500 to-cyan-400' },
                { name: 'Michael Roberts', role: 'CTO', icon: '👨‍💻', bg: 'from-purple-500 to-indigo-400' },
                { name: 'Dr. Priya Sharma', role: 'Chief AI Officer', icon: '👩‍🔬', bg: 'from-green-500 to-emerald-400' },
                { name: 'James Wilson', role: 'VP Engineering', icon: '👨‍🔧', bg: 'from-orange-500 to-amber-400' },
              ].map((member, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${member.bg} flex items-center justify-center mb-4`}>
                    <span className="text-3xl">{member.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Choose Us</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">94.2%</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Forecast Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monitoring</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">&lt;5ms</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Latency</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">200+</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Clients</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-1">15+</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Countries</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-1">$2B+</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Energy Traded</p>
              </div>
            </div>
          </div>

          {/* Company History */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 dark:bg-blue-800"></div>
              <div className="space-y-8">
                {[
                  { year: '2020', title: 'Company Founded', desc: 'Started with a vision to democratize energy trading' },
                  { year: '2021', title: 'Series A Funding', desc: '$15M raised to expand AI capabilities' },
                  { year: '2022', title: 'India Market Entry', desc: 'Launched IEX integration for Indian energy markets' },
                  { year: '2023', title: 'Enterprise Launch', desc: 'Released enterprise platform with SSO and compliance' },
                  { year: '2024', title: 'Global Expansion', desc: 'Expanded to 15+ countries with multi-language support' },
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-5/12 ${idx % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg inline-block">
                        <div className="text-sm font-bold text-blue-600 mb-1">{item.year}</div>
                        <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
                      </div>
                    </div>
                    <div className="w-2/12 flex justify-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 shadow"></div>
                    </div>
                    <div className="w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
