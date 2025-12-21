'use client'

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    ReactNode,
    memo,
    lazy,
    Suspense,
    ComponentType
} from 'react'

// ========================
// Performance Metrics Types
// ========================
export interface PerformanceMetrics {
    fps: number
    memory: {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
    } | null
    renderTime: number
    widgetCount: number
    dataPointsProcessed: number
    lastUpdate: Date
}

export interface ComponentRenderMetrics {
    component: string
    renders: number
    avgRenderTime: number
    lastRenderTime: number
}

// ========================
// FPS Counter Hook
// ========================
export function useFPS() {
    const [fps, setFPS] = useState(60)
    const frameCountRef = useRef(0)
    const lastTimeRef = useRef(performance.now())
    const rafRef = useRef<number>()

    useEffect(() => {
        const measureFPS = () => {
            frameCountRef.current++
            const now = performance.now()
            const elapsed = now - lastTimeRef.current

            if (elapsed >= 1000) {
                setFPS(Math.round((frameCountRef.current * 1000) / elapsed))
                frameCountRef.current = 0
                lastTimeRef.current = now
            }

            rafRef.current = requestAnimationFrame(measureFPS)
        }

        rafRef.current = requestAnimationFrame(measureFPS)

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [])

    return fps
}

// ========================
// Memory Usage Hook
// ========================
export function useMemoryUsage() {
    const [memory, setMemory] = useState<PerformanceMetrics['memory']>(null)

    useEffect(() => {
        const updateMemory = () => {
            if ('memory' in performance) {
                const mem = (performance as any).memory
                setMemory({
                    usedJSHeapSize: mem.usedJSHeapSize,
                    totalJSHeapSize: mem.totalJSHeapSize,
                    jsHeapSizeLimit: mem.jsHeapSizeLimit
                })
            }
        }

        updateMemory()
        const interval = setInterval(updateMemory, 2000)

        return () => clearInterval(interval)
    }, [])

    return memory
}

// ========================
// Render Time Tracker
// ========================
const renderMetrics = new Map<string, ComponentRenderMetrics>()

export function useRenderTracker(componentName: string) {
    const startTimeRef = useRef<number>(0)

    useEffect(() => {
        const endTime = performance.now()
        const renderTime = endTime - startTimeRef.current

        const existing = renderMetrics.get(componentName) || {
            component: componentName,
            renders: 0,
            avgRenderTime: 0,
            lastRenderTime: 0
        }

        const newRenders = existing.renders + 1
        const newAvg = (existing.avgRenderTime * existing.renders + renderTime) / newRenders

        renderMetrics.set(componentName, {
            component: componentName,
            renders: newRenders,
            avgRenderTime: newAvg,
            lastRenderTime: renderTime
        })
    })

    startTimeRef.current = performance.now()
}

export function getRenderMetrics(): ComponentRenderMetrics[] {
    return Array.from(renderMetrics.values())
}

// ========================
// Debounced Value Hook
// ========================
export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

// ========================
// Throttled Callback Hook
// ========================
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const lastCallRef = useRef(0)
    const timeoutRef = useRef<NodeJS.Timeout>()

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now()
        const elapsed = now - lastCallRef.current

        if (elapsed >= delay) {
            lastCallRef.current = now
            callback(...args)
        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                lastCallRef.current = Date.now()
                callback(...args)
            }, delay - elapsed)
        }
    }, [callback, delay]) as T
}

// ========================
// Intersection Observer Hook (Lazy Loading)
// ========================
export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options?: IntersectionObserverInit
) {
    const [isIntersecting, setIsIntersecting] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting)
        }, options)

        observer.observe(element)

        return () => observer.disconnect()
    }, [ref, options])

    return isIntersecting
}

// ========================
// Virtual List Hook
// ========================
export function useVirtualList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 3
) {
    const [scrollTop, setScrollTop] = useState(0)

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = items.slice(startIndex, endIndex)
    const totalHeight = items.length * itemHeight
    const offsetY = startIndex * itemHeight

    const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }, [])

    return {
        visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        startIndex,
        endIndex
    }
}

// ========================
// Skeleton Loader Component
// ========================
export function WidgetSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
                <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                    </div>
                    <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            </div>
            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
        </div>
    )
}

// ========================
// Lazy Widget Wrapper
// ========================
interface LazyWidgetProps {
    loader: () => Promise<{ default: ComponentType<any> }>
    fallback?: ReactNode
    [key: string]: any
}

export function LazyWidget({ loader, fallback, ...props }: LazyWidgetProps) {
    const LazyComponent = lazy(loader)

    return (
        <Suspense fallback={fallback || <WidgetSkeleton />}>
            <LazyComponent {...props} />
        </Suspense>
    )
}

// ========================
// Performance Context
// ========================
interface PerformanceContextValue {
    metrics: PerformanceMetrics
    isProfiling: boolean
    startProfiling: () => void
    stopProfiling: () => void
    getComponentMetrics: () => ComponentRenderMetrics[]
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null)

export function PerformanceProvider({ children }: { children: ReactNode }) {
    const fps = useFPS()
    const memory = useMemoryUsage()
    const [isProfiling, setIsProfiling] = useState(false)
    const [widgetCount, setWidgetCount] = useState(0)
    const [dataPointsProcessed, setDataPointsProcessed] = useState(0)

    const metrics: PerformanceMetrics = {
        fps,
        memory,
        renderTime: 0,
        widgetCount,
        dataPointsProcessed,
        lastUpdate: new Date()
    }

    const startProfiling = useCallback(() => {
        setIsProfiling(true)
        renderMetrics.clear()
    }, [])

    const stopProfiling = useCallback(() => {
        setIsProfiling(false)
    }, [])

    const getComponentMetrics = useCallback(() => {
        return getRenderMetrics()
    }, [])

    // Track widget count
    useEffect(() => {
        const updateMetrics = () => {
            const widgets = document.querySelectorAll('[data-widget]')
            setWidgetCount(widgets.length)
        }

        updateMetrics()
        const observer = new MutationObserver(updateMetrics)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [])

    return (
        <PerformanceContext.Provider value={{
            metrics,
            isProfiling,
            startProfiling,
            stopProfiling,
            getComponentMetrics
        }}>
            {children}
        </PerformanceContext.Provider>
    )
}

export function usePerformance() {
    const context = useContext(PerformanceContext)
    if (!context) {
        throw new Error('usePerformance must be used within PerformanceProvider')
    }
    return context
}

// ========================
// Optimized Widget HOC
// ========================
export function withOptimization<P extends object>(
    WrappedComponent: ComponentType<P>,
    displayName?: string
) {
    const OptimizedComponent = memo(function OptimizedWidget(props: P) {
        useRenderTracker(displayName || WrappedComponent.displayName || 'Widget')
        return <WrappedComponent {...props} />
    })

    OptimizedComponent.displayName = `Optimized(${displayName || WrappedComponent.displayName || 'Component'})`

    return OptimizedComponent
}

// ========================
// Data Memoization Hook
// ========================
export function useMemoizedData<T>(
    data: T,
    deps: any[],
    compareFn?: (a: T, b: T) => boolean
): T {
    const ref = useRef<T>(data)

    const hasChanged = compareFn
        ? !compareFn(ref.current, data)
        : JSON.stringify(ref.current) !== JSON.stringify(data)

    if (hasChanged) {
        ref.current = data
    }

    return ref.current
}

// ========================
// Batch Updates Hook
// ========================
export function useBatchedUpdates<T>(
    callback: (items: T[]) => void,
    delay: number = 100
) {
    const batchRef = useRef<T[]>([])
    const timeoutRef = useRef<NodeJS.Timeout>()

    const addItem = useCallback((item: T) => {
        batchRef.current.push(item)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            if (batchRef.current.length > 0) {
                callback(batchRef.current)
                batchRef.current = []
            }
        }, delay)
    }, [callback, delay])

    return addItem
}
