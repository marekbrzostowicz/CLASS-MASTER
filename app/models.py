from app import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    classes = db.relationship('Class', backref='user', lazy=True)
    pfd = db.relationship('PDF', backref='pdf', lazy=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "password": self.password,
            "firstName": self.first_name
        }
    

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    icon = db.Column(db.String(50))
    students = db.relationship('Student', backref='class', lazy=True, cascade="all, delete-orphan")
    assesments = db.relationship('Assesments', backref='class', lazy=True, cascade="all, delete-orphan")
    


    def to_dict(self):
        return{
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "icon": self.icon
        }
        
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'))
    grades = db.relationship('Grades', backref='student', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {

            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "class_id": self.class_id,
            "grades": [grade.to_dict() for grade in self.grades]

        }
    

class Assesments(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    column_name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Integer, nullable=False, default=1)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'))
    grades = db.relationship('Grades', backref='assesments', lazy=True, cascade="all, delete-orphan")

    
    def to_dict(self):
        return {
            "id": self.id,
            "column_name": self.column_name,
            "weight": self.weight,
            "class_id": self.class_id
        }
    
class Grades(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    grade = db.Column(db.Integer, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    assesments_id = db.Column(db.Integer, db.ForeignKey('assesments.id'))


    def __str__(self):
        return f"Grade: {self.grade}, Student ID: {self.student_id}"


    def to_dict(self):
        return {
            "id": self.id,
            "grade": self.grade,
            "student_id": self.student_id,
            "assesments_id": self.assesments_id
        }
    

class PDF(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False)
    filepath = db.Column(db.String(300), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "filepath": self.filepath,
            "user_id": self.user_id
        }
