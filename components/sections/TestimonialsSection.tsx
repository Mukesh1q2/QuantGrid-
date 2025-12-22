'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const testimonials = [
    {
        id: 1,
        quote: "QuantGrid reduced our energy procurement costs by 23% in the first quarter. The AI forecasting is incredibly accurate.",
        author: "David Morrison",
        role: "VP of Operations",
        company: "Nexus Energy Partners",
        industry: "Energy Trading",
        rating: 5,
        savings: "$2.4M",
        color: "from-blue-500 to-cyan-400"
    },
    {
        id: 2,
        quote: "The real-time IEX India integration transformed how we manage our renewable portfolio. Outstanding platform.",
        author: "Priya Patel",
        role: "Chief Trading Officer",
        company: "GreenWave Power",
        industry: "Renewable Energy",
        rating: 5,
        savings: "18% efficiency gain",
        color: "from-green-500 to-emerald-400"
    },
    {
        id: 3,
        quote: "Enterprise-grade security and 99.9% uptime. QuantGrid handles our $500M+ annual trading volume flawlessly.",
        author: "James Chen",
        role: "Director of Energy Trading",
        company: "Pacific Grid Solutions",
        industry: "Utilities",
        rating: 5,
        savings: "$8.2M annually",
        color: "from-purple-500 to-indigo-400"
    },
    {
        id: 4,
        quote: "The visual knowledge graphs give us insights we never had before. It's like having a team of analysts 24/7.",
        author: "Sarah Williams",
        role: "Head of Analytics",
        company: "EnergyCore Industries",
        industry: "Industrial",
        rating: 5,
        savings: "35% faster decisions",
        color: "from-orange-500 to-amber-400"
    }
]

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-rotate testimonials
    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const goToPrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const currentTestimonial = testimonials[currentIndex]

    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                        Trusted by Energy Leaders
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        See how companies are transforming their energy operations with QuantGrid
                    </p>
                </div>

                {/* Main Testimonial Card */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTestimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12"
                        >
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Quote Section */}
                                <div className="flex-1">
                                    {/* Rating Stars */}
                                    <div className="flex mb-4">
                                        {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                                            <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <blockquote className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-medium leading-relaxed mb-6">
                                        "{currentTestimonial.quote}"
                                    </blockquote>

                                    {/* Author Info */}
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentTestimonial.color} flex items-center justify-center mr-4`}>
                                            <span className="text-white font-bold text-lg">
                                                {currentTestimonial.author.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {currentTestimonial.author}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {currentTestimonial.role} at {currentTestimonial.company}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Card */}
                                <div className="md:w-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white flex flex-col justify-center">
                                    <div className="text-sm uppercase tracking-wider opacity-80 mb-2">
                                        Results Achieved
                                    </div>
                                    <div className="text-3xl font-bold mb-2">
                                        {currentTestimonial.savings}
                                    </div>
                                    <div className="text-sm opacity-80">
                                        {currentTestimonial.industry}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsAutoPlaying(false)
                                setCurrentIndex(index)
                            }}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-blue-600 w-8'
                                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Company Logos Row */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Powering energy operations for industry leaders
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${i === currentIndex
                                    ? 'bg-blue-100 dark:bg-blue-900/30 scale-110'
                                    : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center mr-2 inline-block`}>
                                    <span className="text-white text-xs font-bold">
                                        {t.company.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t.company}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
