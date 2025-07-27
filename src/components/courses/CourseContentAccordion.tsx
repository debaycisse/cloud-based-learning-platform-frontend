import { useState } from "react"
import type { CourseSection } from "../../types"

interface CourseContentAccordionProps {
  sections: CourseSection[]
}

const CourseContentAccordion = ({ sections }: CourseContentAccordionProps) => {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    if (openSections.includes(sectionId)) {
      setOpenSections(openSections.filter((id) => id !== sectionId))
    } else {
      setOpenSections([...openSections, sectionId])
    }
  }

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => {
    if (a.order && b.order) {
      return a.order - b.order
    }
    return 0
  })

  return (
    <div className="space-y-2">
      {sortedSections.map((section) => {
        const isOpen = section.section_id? openSections.includes(section.section_id) : false

        // Sort subsections by order
        const sortedSubsections = [...section.sub_sections].sort((a, b) => {
          if (a.order && b.order) {
            return a.order - b.order
          }
          return 0
        })

        return (
          <div
            key={section.section_id}
            className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.section_id? section.section_id : '')}
              className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                <i className="fa-solid fa-book-open mr-2 text-primary-500"></i>
                {section.title}
              </span>
              <i
                className={`fa-solid fa-chevron-down text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              ></i>
            </button>

            {isOpen && (
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <ul className="space-y-2">
                  {sortedSubsections.map((subsection) => (
                    <li key={subsection.subsection_id} className="pl-4 border-l-2 border-primary-500">
                      <div className="flex items-center">
                        <i className="fa-solid fa-file-lines mr-2 text-secondary-500"></i>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{subsection.title}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({subsection.data.length} items)
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CourseContentAccordion
