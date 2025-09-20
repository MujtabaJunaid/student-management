import os
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mujtabajunaid.github.io/student-management/"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Student(BaseModel):
    name: str
    age: int
    grade: str

class StudentInDB(Student):
    id: str

class StudentCreate(Student):
    pass

class StudentUpdate(Student):
    pass

client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
db = client.student_db
collection = db.students

def student_helper(student) -> dict:
    return {
        "id": str(student["_id"]),
        "name": student["name"],
        "age": student["age"],
        "grade": student["grade"]
    }

@app.post("/students/", response_model=StudentInDB)
async def create_student(student: StudentCreate):
    student_data = jsonable_encoder(student)
    result = await collection.insert_one(student_data)
    new_student = await collection.find_one({"_id": result.inserted_id})
    return student_helper(new_student)

@app.get("/students/{student_id}", response_model=StudentInDB)
async def get_student(student_id: str):
    try:
        oid = ObjectId(student_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    student = await collection.find_one({"_id": oid})
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student_helper(student)

@app.get("/students/", response_model=List[StudentInDB])
async def get_students(skip: int = 0, limit: int = 10):
    students = []
    async for student in collection.find().skip(skip).limit(limit):
        students.append(student_helper(student))
    return students

@app.put("/students/{student_id}", response_model=StudentInDB)
async def update_student(student_id: str, student: StudentUpdate):
    student_data = {key: value for key, value in student.dict().items() if value is not None}
    try:
        oid = ObjectId(student_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    result = await collection.update_one(
        {"_id": oid}, {"$set": student_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    updated_student = await collection.find_one({"_id": oid})
    return student_helper(updated_student)

@app.delete("/students/{student_id}", response_model=StudentInDB)
async def delete_student(student_id: str):
    try:
        oid = ObjectId(student_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    student = await collection.find_one({"_id": oid})
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    await collection.delete_one({"_id": oid})
    return student_helper(student)
