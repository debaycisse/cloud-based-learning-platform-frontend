import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getConcepts, deleteConcept } from "../../services/conceptService";
import type { Concept } from "../../types";

const ConceptsPage = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalConcepts, setTotalConcepts] = useState(0);
  const conceptsPerPage = 10;

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        setIsLoading(true);
        const skip = (currentPage - 1) * conceptsPerPage;
        // Update your getConcepts to accept limit and skip if not already
        const { concepts: fetchedConcepts, count } = await getConcepts(conceptsPerPage, skip);
        setConcepts(fetchedConcepts);
        setTotalConcepts(count);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch concepts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConcepts();
  }, [currentPage]);

  const handleDelete = async (conceptId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this concept? This action cannot be undone.");
    if (!confirmDelete) return;
    try {
      setIsLoading(true);
      await deleteConcept(conceptId);
      setConcepts((prev) => prev.filter((concept) => concept._id !== conceptId));
      // If we delete the last concept on a page, go to previous page (unless we're on page 1)
      if (concepts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Refresh the current page
        const skip = (currentPage - 1) * conceptsPerPage;
        const { concepts: fetchedConcepts, count } = await getConcepts(conceptsPerPage, skip);
        setConcepts(fetchedConcepts);
        setTotalConcepts(count);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete the concept. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalConcepts / conceptsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Concepts</h1>
        <Link
          to="/admin/concept/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Create Concept
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {isLoading ? (
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-primary-500 text-2xl"></i>
          <p className="text-gray-600 mt-2">Loading concepts...</p>
        </div>
      ) : concepts.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 border border-gray-200 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-4 border-b text-left">Concepts</th>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-left">Links</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {concepts.map((concept) => (
                  <tr key={concept._id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-2 px-4 border-b">
                      <ul>
                        {concept.concepts.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 px-4 border-b">{concept.description}</td>
                    <td className="py-2 px-4 border-b">
                      <ul>
                        {concept.links.map((link, idx) => (
                          <li key={idx}>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <Link to={`/admin/concept/${concept._id}/edit`} className="text-blue-500 hover:underline mr-2">
                        Edit
                      </Link>
                      <button className="text-red-500 hover:underline" onClick={() => handleDelete(concept._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md mr-2 bg-gray-200 text-primary-600 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md mx-1 ${
                      currentPage === page ? "bg-primary-600 text-white" : "bg-gray-200 text-primary-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-gray-200 text-primary-600 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600">No concepts found.</p>
      )}
    </div>
  );
};

export default ConceptsPage;























// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { getConcepts, deleteConcept } from "../../services/conceptService";
// import type { Concept } from "../../types";

// const ConceptsPage = () => {
//   const [concepts, setConcepts] = useState<Concept[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchConcepts = async () => {
//       try {
//         setIsLoading(true);
//         const { concepts: fetchedConcepts } = await getConcepts();
//         setConcepts(fetchedConcepts);
//       } catch (err: any) {
//         setError(err.response?.data?.error || "Failed to fetch concepts. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchConcepts();
//   }, []);

//   const handleDelete = async (conceptId: string) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this concept? This action cannot be undone.");
//     if (!confirmDelete) return;
//     try {
//       setIsLoading(true);
//       await deleteConcept(conceptId);
//       setConcepts((prev) => prev.filter((concept) => concept._id !== conceptId));
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Failed to delete the concept. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Manage Concepts</h1>
//         <Link
//           to="/admin/concept/create"
//           className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
//         >
//           <i className="fa-solid fa-plus mr-2"></i>
//           Create Concept
//         </Link>
//       </div>
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
//           <p className="text-red-700">{error}</p>
//         </div>
//       )}
//       {isLoading ? (
//         <div className="text-center">
//           <i className="fa-solid fa-circle-notch fa-spin text-primary-500 text-2xl"></i>
//           <p className="text-gray-600 mt-2">Loading concepts...</p>
//         </div>
//       ) : concepts.length > 0 ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-gray-50 border border-gray-200 rounded-lg shadow">
//             <thead>
//               <tr className="bg-gray-100 dark:bg-gray-700">
//                 <th className="py-2 px-4 border-b text-left">Concepts</th>
//                 <th className="py-2 px-4 border-b text-left">Description</th>
//                 <th className="py-2 px-4 border-b text-left">Links</th>
//                 <th className="py-2 px-4 border-b text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {concepts.map((concept) => (
//                 <tr key={concept._id} className="hover:bg-gray-50 dark:bg-gray-800">
//                   <td className="py-2 px-4 border-b">
//                     <ul>
//                       {concept.concepts.map((c, idx) => (
//                         <li key={idx}>{c}</li>
//                       ))}
//                     </ul>
//                   </td>
//                   <td className="py-2 px-4 border-b">{concept.description}</td>
//                   <td className="py-2 px-4 border-b">
//                     <ul>
//                       {concept.links.map((link, idx) => (
//                         <li key={idx}>
//                           <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
//                             {link}
//                           </a>
//                         </li>
//                       ))}
//                     </ul>
//                   </td>
//                   <td className="py-2 px-4 border-b text-center">
//                     <Link to={`/admin/concept/${concept._id}/edit`} className="text-blue-500 hover:underline mr-2">
//                       Edit
//                     </Link>
//                     <button className="text-red-500 hover:underline" onClick={() => handleDelete(concept._id)}>
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-gray-600">No concepts found.</p>
//       )}
//     </div>
//   );
// };

// export default ConceptsPage;
