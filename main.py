from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
import os

# FastAPI app
app = FastAPI()

# ✅ CORS setup: only allow your GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mujtabajunaid.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ MongoDB Atlas connection (set in Heroku config vars)
MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/student_db?retryWrites=true&w=majority"
)
client = MongoClient(MONGO_URL)
db = client["student_db"]
students_collection = db["students"]

# ✅ Pydantic model
class Student(BaseModel):
    name: str
    email: str
    age: int
    department: str | None = None
    cgpa: float

# ✅ Routes
@app.get("/students/")
def get_students():
    students = list(students_collection.find({}, {"_id": 0}))
    return students

@app.post("/students/")
def create_student(student: Student):
    # ensure email is unique
    if students_collection.find_one({"email": student.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    student_data = student.dict()
    student_data["id"] = str(uuid4())
    student_data["created_at"] = datetime.utcnow().isoformat()

    students_collection.insert_one(student_data)
    return {"message": "Student added successfully", "student": student_data}

@app.get("/students/{student_id}")
def get_student(student_id: str):
    student = students_collection.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.delete("/students/{student_id}")
def delete_student(student_id: str):
    result = students_collection.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}
