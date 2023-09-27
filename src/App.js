import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

function App() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', course_code: '', description: '' });
  const [instances, setInstances] = useState([]);
  const [newInstance, setNewInstance] = useState({ course: '', year: '', semester: '' });
  // eslint-disable-next-line
  const [filteredInstances, setFilteredInstances] = useState([]);
  // eslint-disable-next-line
  const [searchResult, setSearchResult] = useState(null);
  // eslint-disable-next-line
  const [searchResultInstance, setSearchResultInstance] = useState(null);

  useEffect(() => {
    fetchData('/api/courses/', setCourses);
    fetchData('/api/instances/', setInstances);
  }, []);

  const fetchData = (url, setData) => {
    api.get(url)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const listCourseInstances = () => {
    const filtered = instances.filter(instance => (
      instance.year === newInstance.year &&
      instance.semester === newInstance.semester
    ));

    setFilteredInstances([...filtered]);
  };

  const addCourse = () => {
    api.post('/api/courses/create/', newCourse)
      .then(response => {
        setNewCourse({ title: '', course_code: '', description: '' });
        setCourses([...courses, response.data]);
      })
      .catch(error => {
        console.error('Error adding a course:', error);
      });
  };

  const addCourseInstance = () => {
    api.post('/api/instances/create/', newInstance)
      .then(response => {
        api.get(`/api/courses/${newInstance.course}`)
          .then(courseResponse => {
            const newCourseInstance = {
              ...response.data,
              course: courseResponse.data,
            };
            setNewInstance({ course: '', year: '', semester: '' });
            setInstances([...instances, newCourseInstance]);
          })
          .catch(error => {
            console.error('Error fetching course data for the instance:', error);
          });
      })
      .catch(error => {
        console.error('Error adding a course instance:', error);
      });
  };

  const deleteCourse = (courseId) => {
    api.delete(`/api/courses/delete/${courseId}`)
      .then(() => {
        setCourses(courses.filter(course => course.id !== courseId));
      })
      .catch(error => {
        console.error('Error deleting a course:', error);
      });
  };

  const deleteInstance = (instanceId) => {
    api.delete(`/api/instances/delete/${instanceId}`)
      .then(() => {
        setInstances(instances.filter(instance => instance.id !== instanceId));
      })
      .catch(error => {
        console.error('Error deleting a course instance:', error);
      });
  };

  const handleSearch = (courseId) => {
    const searchResult = courses.find(course => course.id === courseId);
    setSearchResult(searchResult);
  };

  const handleSearchInstance = (instanceId) => {
    const searchResult = instances.find(instance => instance.id === instanceId);
    setSearchResultInstance(searchResult);
  };

  const getUniqueSemesters = () => {
    return [...new Set(instances.map((instance) => instance.semester))];
  };

  const getUniqueYears = () => {
    return [...new Set(instances.map((instance) => instance.year))];
  };
  
  return (
    <div className="App">
      <div className="container">
        <h1>Course Management</h1>

        <section className="section">
          <h2>Add a New Course</h2>
          <input
            type="text"
            className="input-field"
            placeholder="Course Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse(prevState => ({ ...prevState, title: e.target.value }))}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Course Code"
            value={newCourse.course_code}
            onChange={(e) => setNewCourse(prevState => ({ ...prevState, course_code: e.target.value }))}
          />
          <textarea
            className="input-field"
            placeholder="Course Description"
            value={newCourse.description}
            onChange={(e) => setNewCourse(prevState => ({ ...prevState, description: e.target.value }))}
          />
          <button className="button" onClick={addCourse}>
            Add Course
          </button>
        </section>

        <section className="section">
          <h2>List of Courses</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.course_code}</td>
                  <td>
                    <button className="search-button" onClick={() => handleSearch(course.id)}>
                      Search
                    </button>
                    <button className="delete-button" onClick={() => deleteCourse(course.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section">
          <h2>Add a New Course Instance</h2>
          <select
            className="input-field"
            value={newInstance.course}
            onChange={(e) => setNewInstance(prevState => ({ ...prevState, course: e.target.value }))}
          >
            <option value="">Select a Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="input-field"
            placeholder="Year"
            value={newInstance.year}
            onChange={(e) => setNewInstance(prevState => ({ ...prevState, year: e.target.value }))}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Semester"
            value={newInstance.semester}
            onChange={(e) => setNewInstance(prevState => ({ ...prevState, semester: e.target.value }))}
          />
          <button className="button" onClick={addCourseInstance}>
            Add Instance
          </button>
        </section>

        <section className="section">
          <h2>List of Course Instances</h2>
          <div className="filter-container">
            <select
              className="input-field"
              value={newInstance.year}
              onChange={(e) => setNewInstance(prevState => ({ ...prevState, year: e.target.value }))}
            >
              <option value="">Select Year</option>
              {getUniqueYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              className="input-field"
              value={newInstance.semester}
              onChange={(e) => setNewInstance(prevState => ({ ...prevState, semester: e.target.value }))}
            >
              <option value="">Select Semester</option>
              {getUniqueSemesters().map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
            <button className="list-instances-button" onClick={listCourseInstances}>
              List Instances
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Year-Sem</th>
                <th>Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((instance) => (
                <tr key={instance.id}>
                  <td>{instance.course ? instance.course.title : 'N/A'}</td>
                  <td>{`${instance.year}-${instance.semester}`}</td>
                  <td>{instance.course ? instance.course.course_code : 'N/A'}</td>
                  <td>
                    <button className="search-button" onClick={() => handleSearchInstance(instance.id)}>
                      Search
                    </button>
                    <button className="delete-button" onClick={() => deleteInstance(instance.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;