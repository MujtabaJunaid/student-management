from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
from typing import Optional
import os
import certifi
from bson import json_util
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mujtabajunaid.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("mongodb_url")
if not MONGO_URL:
    raise ValueError("mongodb_url environment variable not set.")

client = MongoClient(MONGO_URL, tlsCAFile=certifi.where())
db = client["student_db"]
students_collection = db["students"]

class Student(BaseModel):
    name: str
    email: str
    age: int
    department: Optional[str] = None
    cgpa: float

@app.get("/students/")
def get_students():
    students = list(students_collection.find({}))
    return json.loads(json_util.dumps(students))

@app.post("/students/")
def create_student(student: Student):
    if students_collection.find_one({"email": student.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    student_data = student.dict()
    student_data["id"] = str(uuid4())
    student_data["created_at"] = datetime.utcnow().isoformat()
    students_collection.insert_one(student_data)
    return {"message": "Student added successfully", "student": student_data}

@app.get("/students/{student_id}")
def get_student(student_id: str):
    student = students_collection.find_one({"id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return json.loads(json_util.dumps(student))

@app.delete("/students/{student_id}")
def delete_student(student_id: str):
    result = students_collection.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}
