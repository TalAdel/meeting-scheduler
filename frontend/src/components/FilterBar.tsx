import { useEffect, useState, useRef } from 'react'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'
import { Filter, ChevronDown, Calendar, User, X, Check } from 'lucide-react'
import type { AttendingStatus } from '../types/meeting.types'



type FilterAttendingStatus = Exclude<AttendingStatus, 'attended'>

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  statuses: FilterAttendingStatus[]
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  customDateRange?: {
    start: string
    end: string
  }
  myMeetingsOnly: boolean
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    dateRange: 'all',
    myMeetingsOnly: false,
  })

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')

  const statusRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  const statusOptions: {
    value: FilterAttendingStatus
    label: string
  }[] = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'declined', label: 'Declined' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ] as const

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const toggleStatus = (status: FilterAttendingStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }))
  }

  const setDateRange = (range: FilterState['dateRange']) => {
    if (range === 'custom') {
      const today = new Date().toISOString().split('T')[0]
      setTempStartDate(filters.customDateRange?.start || today)
      setTempEndDate(filters.customDateRange?.end || today)
      setFilters((prev) => ({
        ...prev,
        dateRange: 'custom',
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        dateRange: range,
        customDateRange: undefined,
      }))
      setShowDateDropdown(false)
    }
  }

  const applyCustomDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setFilters((prev) => ({
        ...prev,
        dateRange: 'custom',
        customDateRange: {
          start: tempStartDate,
          end: tempEndDate,
        },
      }))
      setShowDateDropdown(false)
    }
  }

  const toggleMyMeetings = () => {
    setFilters((prev) => ({
      ...prev,
      myMeetingsOnly: !prev.myMeetingsOnly,
    }))
  }

  const clearFilters = () => {
    setFilters({
      statuses: [],
      dateRange: 'all',
      myMeetingsOnly: false,
    })
    setTempStartDate('')
    setTempEndDate('')
  }

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.dateRange !== 'all' ||
    filters.myMeetingsOnly

  const activeFilterCount =
    filters.statuses.length +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.myMeetingsOnly ? 1 : 0)

  const getDateRangeLabel = () => {
    if (filters.dateRange === 'custom' && filters.customDateRange) {
      const start = new Date(filters.customDateRange.start).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
      )
      const end = new Date(filters.customDateRange.end).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
      )
      return `${start} - ${end}`
    }
    return (
      dateOptions.find((d) => d.value === filters.dateRange)?.label ||
      'All Time'
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="relative" ref={statusRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={cn(
              'relative',
              filters.statuses.length > 0 &&
                'border-indigo-300 bg-indigo-50 text-indigo-700',
            )}
          >
            Status
            {filters.statuses.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-medium">
                {filters.statuses.length}
              </span>
            )}
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 ml-1.5 transition-transform',
                showStatusDropdown && 'rotate-180',
              )}
            />
          </Button>

          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Filter by Status
              </div>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                      filters.statuses.includes(option.value)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300',
                    )}
                  >
                    {filters.statuses.includes(option.value) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative" ref={dateRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className={cn(
              'max-w-[200px]',
              filters.dateRange !== 'all' &&
                'border-indigo-300 bg-indigo-50 text-indigo-700',
            )}
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{getDateRangeLabel()}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 ml-1.5 flex-shrink-0 transition-transform',
                showDateDropdown && 'rotate-180',
              )}
            />
          </Button>

          {showDateDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Date Range
              </div>

              {/* Preset Options */}
              {dateOptions
                .filter((opt) => opt.value !== 'custom')
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors',
                      filters.dateRange === option.value &&
                        'bg-indigo-50 text-indigo-700 font-medium',
                    )}
                  >
                    {option.label}
                    {filters.dateRange === option.value && (
                      <Check className="w-4 h-4 inline ml-2 text-indigo-600" />
                    )}
                  </button>
                ))}

              {/* Custom Range Section */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => setDateRange('custom')}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors font-medium',
                    filters.dateRange === 'custom' &&
                      'bg-indigo-50 text-indigo-700',
                  )}
                >
                  Custom Range
                  {filters.dateRange === 'custom' && (
                    <Check className="w-4 h-4 inline ml-2 text-indigo-600" />
                  )}
                </button>

                {filters.dateRange === 'custom' && (
                  <div className="px-4 py-3 space-y-3 bg-gray-50 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        min={tempStartDate}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={applyCustomDateRange}
                      disabled={!tempStartDate || !tempEndDate}
                      className="w-full"
                    >
                      Apply Date Range
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* My Meetings Toggle */}
        <Button
          variant={filters.myMeetingsOnly ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleMyMeetings}
          className={cn(
            filters.myMeetingsOnly &&
              'border-indigo-300 bg-indigo-100 text-indigo-700',
          )}
        >
          <User className="w-3.5 h-3.5 mr-1.5" />
          My Meetings
          {filters.myMeetingsOnly && <Check className="w-3.5 h-3.5 ml-1.5" />}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all ({activeFilterCount})
            </button>
          </>
        )}
      </div>
    </div>
  )
}

