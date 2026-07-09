import { useEffect, useState } from "react"

// Modify your useTableFilter hook to support custom filter functions
export function useTableFilter(data, searchFields = ['name']) {
  const [filteredData, setFilteredData] = useState(data)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Filter data based on search term, category, and status
  const filterData = (term, category, status, customFilterFn) => {
    setSearchTerm(term || '')
    setFilterCategory(category || '')
    setFilterStatus(status || '')

    if (customFilterFn && typeof customFilterFn === 'function') {
      // Use custom filter function if provided
      setFilteredData(customFilterFn(data));
    } else {
      // Default filtering logic
      const filtered = data.filter(item => {
        // Search logic
        const matchesSearch = !term || searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes((term || '').toLowerCase())
        )
  
        // Category filter
        const matchesCategory = !category || item.category === category
  
        // Status filter
        const matchesStatus = !status || item.status === status
  
        return matchesSearch && matchesCategory && matchesStatus
      })
  
      setFilteredData(filtered)
    }
  }

  // Initial filtering
  useEffect(() => {
    filterData(searchTerm, filterCategory, filterStatus)
  }, [data]) // Only re-run when data changes

  return {
    filteredData,
    filterData,
    searchTerm,
    filterCategory,
    filterStatus
  }
}

export default useTableFilter;