import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://student-management-ceb1eefc5dce.herokuapp.com/students/";

function App() {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState({ 
    name: "", 
    email: "", 
    age: "", 
    cgpa: "", 
    department: "" 
  });
  const [editStudent, setEditStudent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setMessage("Failed to load students");
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...student,
          age: parseInt(student.age),
          cgpa: parseFloat(student.cgpa)
        }),
      });

      if (response.ok) {
        setMessage("Student added successfully!");
        setStudent({ name: "", email: "", age: "", cgpa: "", department: "" });
        fetchStudents();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail || "Failed to add student."}`);
      }
    } catch (error) {
      console.error("Error adding student:", error);
      setMessage("An error occurred while adding the student.");
    }
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setStudent({ 
      name: student.name, 
      email: student.email, 
      age: student.age.toString(), 
      cgpa: student.cgpa.toString(), 
      department: student.department || "" 
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}${editStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...student,
          age: parseInt(student.age),
          cgpa: parseFloat(student.cgpa)
        }),
      });
      
      if (response.ok) {
        setMessage("Student updated successfully!");
        fetchStudents();
        setEditStudent(null);
        setStudent({ name: "", email: "", age: "", cgpa: "", department: "" });
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail || "Failed to update student."}`);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage("An error occurred while updating the student.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setMessage("Student deleted successfully!");
        fetchStudents();
      } else {
        setMessage("Failed to delete student.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setMessage("An error occurred while deleting the student.");
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
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={student.email}
          onChange={(e) => setStudent({ ...student, email: e.target.value })}
          required
        />
        
        <input
          type="number"
          placeholder="Age"
          value={student.age}
          onChange={(e) => setStudent({ ...student, age: e.target.value })}
          required
          min="1"
        />
        
        <input
          type="number"
          placeholder="CGPA"
          value={student.cgpa}
          onChange={(e) => setStudent({ ...student, cgpa: e.target.value })}
          required
          step="0.01"
          min="0"
          max="4.0"
        />
        
        <input
          type="text"
          placeholder="Department (Optional)"
          value={student.department}
          onChange={(e) => setStudent({ ...student, department: e.target.value })}
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
                <p>Email: {student.email}</p>
                <p>Age: {student.age}</p>
                <p>CGPA: {student.cgpa}</p>
                {student.department && <p>Department: {student.department}</p>}
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
