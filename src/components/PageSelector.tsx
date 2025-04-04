import { useState } from "react";

interface Page {
  id: string;
  title: string;
  src: string;
}

interface PageSelectorProps {
  pages: Page[];
  currentPageId: string;
  onPageChange: (pageId: string) => void;
}

const PageSelector = ({
  pages,
  currentPageId,
  onPageChange,
}: PageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentPage =
    pages.find((page) => page.id === currentPageId) || pages[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePageSelect = (pageId: string) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-6">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-4 py-3 bg-white text-left text-gray-800 font-medium rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <span>{currentPage.title}</span>
        <svg
          className={`ml-2 w-5 h-5 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {pages.map((page) => (
              <li key={page.id}>
                <button
                  onClick={() => handlePageSelect(page.id)}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                    page.id === currentPageId ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  {page.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PageSelector;
