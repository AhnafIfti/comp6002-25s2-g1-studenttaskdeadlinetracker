import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Course.css'; // Import CSS file
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface Course {
  _id: string;
  name: string;
  code: string;
}

const Course: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', code: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Control delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null); // ID of the course to delete
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5; // Number of courses per page

  const navigate = useNavigate()

  // Fetch courses from the backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view courses.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch courses.');
      }
    };

    fetchCourses();
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(term) || course.code.toLowerCase().includes(term)
    );
    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to the first page when searching
  };

  // Handle input changes in the modal form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Show toast message


  // Handle adding a new course
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      toast.error('Course Title is required.');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Course Code is required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to add a course.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/courses/add',
        { name: formData.title, code: formData.code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      
      toast.success('Course added successfully.');
      setCourses((prevCourses) => [...prevCourses, response.data.course]);
      setFilteredCourses((prevCourses) => [...prevCourses, response.data.course]);
      setFormData({ title: '', code: '' });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    }
  };

  // Handle deleting a course
  const handleDeleteCourse = async () => {
    if (!deleteId) return;

    
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to delete a course.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/courses/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Course deleted successfully.'); // Toast for successful deletion
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== deleteId));
      setFilteredCourses((prevCourses) => prevCourses.filter((course) => course._id !== deleteId));
      setShowDeleteConfirm(false); // Close delete confirmation modal
      setDeleteId(null); // Reset delete ID
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred.'); // Toast for error
    }
  };

  // Handle editing a course
  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    
    if (!formData.title.trim()) {
      setError('Course Title cannot be empty.');
      return;
    }
    if (!formData.code.trim()) {
      setError('Course Code cannot be empty.');
      return;
    }

    const isDuplicateCode = courses.some(
      (course) => course.code === formData.code && course._id !== editId
    );
    if (isDuplicateCode) {
      setError('Course Code already exists.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit a course.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/courses/${editId}`,
        { name: formData.title, code: formData.code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Course updated successfully.'); // Toast for successful update
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === editId ? response.data.course : course
        )
      );
      setFilteredCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === editId ? response.data.course : course
        )
      );
      setFormData({ title: '', code: '' });
      setShowForm(false);
      setEditId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred.'); // Toast for error
    }
  };

  // Handle course click to navigate to Tasks page
  const handleCourseClick = (courseCode: string) => {
    navigate(`/tasks?course=${courseCode}`);
  };

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className="courses-container">
      <ToastContainer />
      {/* Toast Message */}
      {toastMessage && (
        <div className="toast">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}>✖</button>
        </div>
      )}

      <header className="courses-header">
        <h1>Courses</h1>
        <button
          className="add-course"
          onClick={() => {
            setEditId(null);
            setFormData({ title: '', code: '' });
            setShowForm(true);
          }}
        >
          Add Course
        </button>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search your courses..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>


      <div className="courses-list">
        {currentCourses.map((course) => (
          <div
            key={course._id}
            className="course-item"
            onClick={() => handleCourseClick(course.code)}
          >
            <div className="course-details">
              <p className="course-code">{course.code}</p>
              <p className="course-name">{course.name}</p>
              <p className="course-status">Open | Multiple Instructors</p>
            </div>
            <div className="course-actions">
              <button
                className="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditId(course._id);
                  setFormData({ title: course.name, code: course.code });
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(course._id);
                  setShowDeleteConfirm(true); // Open delete confirmation modal
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Modal for Add/Edit Course */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editId ? 'Edit Course' : 'Add New Course'}</h2>
            <form onSubmit={editId ? handleEditCourse : handleAddCourse}>
              {error && <p className="message-error-edit">{error}</p>}
              <div className="form-group">
                <label htmlFor="title">Course Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  
                />
              </div>
              <div className="form-group">
                <label htmlFor="code">Course Code:</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="save">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this course?</p>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm"
                onClick={handleDeleteCourse}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;