import React from 'react';
import { Button, Typography } from '@material-tailwind/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TablePagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  showPageNumbers = true,
  showItemInfo = true
}) => {
  // Calculate the range of items being shown
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show page numbers with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Don't render if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  return (
    <div className="md:flex items-center  justify-between border-t border-blue-gray-50 p-4">
      {/* Items info */}
      {showItemInfo && (
        <div className="flex items-center gap-2 md:mb-0 mb-2">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Showing {startItem} to {endItem} of {totalItems} results
          </Typography>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="text"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "filled" : "text"}
                    size="sm"
                    onClick={() => onPageChange && onPageChange(page)}
                    className={`min-w-[2rem] ${
                      currentPage === page
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Next button */}
        <Button
          variant="text"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;