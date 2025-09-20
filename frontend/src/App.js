import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://<your-heroku-app-name>.herokuapp.com/students/";

function App() {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState({ name: "", age: "", grade: "" });
  const [editStudent, setEditStudent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setStudents(data);
  };

  const handleCreate = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(student),
    });
    if (response.ok) {
      setMessage("Student added successfully!");
      fetchStudents();
    }
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setStudent({ name: student.name, age: student.age, grade: student.grade });
  };

  const handleUpdate = async () => {
    const response = await fetch(`${API_URL}${editStudent.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(student),
    });
    if (response.ok) {
      setMessage("Student updated successfully!");
      fetchStudents();
      setEditStudent(null);
      setStudent({ name: "", age: "", grade: "" });
    }
  };

  const handleDelete = async (id) => {
    const response = await fetch(`${API_URL}${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setMessage("Student deleted successfully!");
      fetchStudents();
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h1>{editStudent ? "Edit Student" : "Add New Student"}</h1>
        <input
          type="text"
          placeholder="Name"
          value={student.name}
          onChange={(e) => setStudent({ ...student, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Age"
          value={student.age}
          onChange={(e) => setStudent({ ...student, age: e.target.value })}
        />
        <input
          type="text"
          placeholder="Grade"
          value={student.grade}
          onChange={(e) => setStudent({ ...student, grade: e.target.value })}
        />
        <button onClick={editStudent ? handleUpdate : handleCreate}>
          {editStudent ? "Update" : "Add Student"}
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="students-list">
        <h2>All Students</h2>
        <ul>
          {students.map((student) => (
            <li key={student.id}>
              <div>
                <h3>{student.name}</h3>
                <p>Age: {student.age}</p>
                <p>Grade: {student.grade}</p>
              </div>
              <div className="actions">
                <button onClick={() => handleEdit(student)}>Edit</button>
                <button onClick={() => handleDelete(student.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
