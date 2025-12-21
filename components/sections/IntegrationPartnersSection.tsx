'use client'

import { motion } from 'framer-motion'

// Integration partner data organized by category
const integrationPartners = {
    cloudPlatforms: {
        title: 'Cloud Platforms',
        partners: [
            { name: 'AWS', icon: '☁️', color: 'from-orange-400 to-orange-600', description: 'S3, Lambda, RDS' },
            { name: 'Azure', icon: '⚡', color: 'from-blue-400 to-blue-600', description: 'Blob, Functions, SQL' },
            { name: 'Google Cloud', icon: '🌐', color: 'from-red-400 to-yellow-500', description: 'BigQuery, Cloud Run' },
        ]
    },
    energyMarkets: {
        title: 'Energy Markets',
        partners: [
            { name: 'IEX India', icon: '🇮🇳', color: 'from-green-500 to-emerald-600', description: 'DAM, RTM, GTAM' },
            { name: 'EPEX SPOT', icon: '🇪🇺', color: 'from-blue-500 to-indigo-600', description: 'European Markets' },
            { name: 'AEMO', icon: '🇦🇺', color: 'from-yellow-500 to-amber-600', description: 'Australia/NZ' },
            { name: 'PJM', icon: '🇺🇸', color: 'from-red-500 to-blue-600', description: 'US East Coast' },
        ]
    },
    erp: {
        title: 'ERP & CRM',
        partners: [
            { name: 'SAP', icon: '💼', color: 'from-blue-600 to-cyan-500', description: 'S/4HANA, ECC' },
            { name: 'Salesforce', icon: '☁️', color: 'from-blue-400 to-blue-600', description: 'CRM, Marketing' },
            { name: 'Oracle', icon: '🔴', color: 'from-red-500 to-red-700', description: 'NetSuite, EPM' },
        ]
    },
    dataAnalytics: {
        title: 'Data & Analytics',
        partners: [
            { name: 'Snowflake', icon: '❄️', color: 'from-cyan-400 to-blue-500', description: 'Data Warehouse' },
            { name: 'Databricks', icon: '🧱', color: 'from-red-500 to-orange-500', description: 'Lakehouse, ML' },
            { name: 'Tableau', icon: '📊', color: 'from-blue-500 to-purple-500', description: 'Visualization' },
            { name: 'Power BI', icon: '📈', color: 'from-yellow-400 to-yellow-600', description: 'Microsoft BI' },
        ]
    },
    iot: {
        title: 'IoT & SCADA',
        partners: [
            { name: 'Siemens', icon: '⚙️', color: 'from-teal-500 to-cyan-600', description: 'MindSphere' },
            { name: 'GE Digital', icon: '🏭', color: 'from-blue-600 to-blue-800', description: 'Predix, Historian' },
            { name: 'OSIsoft', icon: '📡', color: 'from-green-500 to-green-700', description: 'PI System' },
        ]
    }
}

export function IntegrationPartnersSection() {
    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 mb-4">
                            🔗 Seamless Integrations
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                            Connect With Your Existing Tools
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            OptiBid integrates with leading platforms across cloud, energy markets, ERP systems, and IoT devices
                        </p>
                    </motion.div>
                </div>

                {/* Integration Categories */}
                <div className="space-y-12">
                    {Object.entries(integrationPartners).map(([key, category], categoryIndex) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded mr-3"></span>
                                {category.title}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {category.partners.map((partner, index) => (
                                    <motion.div
                                        key={partner.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        {/* Partner Icon */}
                                        <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${partner.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <span className="text-2xl">{partner.icon}</span>
                                        </div>

                                        {/* Partner Name */}
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {partner.name}
                                        </h4>

                                        {/* Partner Description */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {partner.description}
                                        </p>

                                        {/* Connected Badge */}
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="sr-only">Available</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* API & Custom Integrations CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white"
                >
                    <h3 className="text-2xl font-bold mb-4">Need a Custom Integration?</h3>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Our REST API and webhook support enables integration with virtually any system.
                        Enterprise customers get dedicated integration support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/docs/api"
                            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            📚 View API Docs
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                        >
                            💬 Contact Integration Team
                        </a>
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Certified integrations and security compliance
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">SOC 2 Type II</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">ISO 27001</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">GDPR Compliant</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">99.9% SLA</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
