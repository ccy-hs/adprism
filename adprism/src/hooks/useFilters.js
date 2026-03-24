import { useState } from 'react'

const DEFAULT_FILTERS = {
  industries:    [],
  campaignTypes: [],
  regions:       [],
  dateFrom:      null,
  dateTo:        null,
  sortBy:        'latest',
  search:        '',
}

export function useFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const toggle = (key, value) => {
    setFilters(prev => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      }
    })
  }

  const setSort   = (sortBy)     => setFilters(prev => ({ ...prev, sortBy }))
  const setSearch = (search)     => setFilters(prev => ({ ...prev, search }))
  const setDates  = (from, to)   => setFilters(prev => ({ ...prev, dateFrom: from, dateTo: to }))
  const clearFilter = (key)      => setFilters(prev => ({ ...prev, [key]: [] }))
  const reset     = ()           => setFilters(DEFAULT_FILTERS)

  return { filters, toggle, setSort, setSearch, setDates, clearFilter, reset }
}
