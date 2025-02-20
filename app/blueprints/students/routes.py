from flask import Blueprint, request,  jsonify
from app.models import  Class, Student, Assesments, Grades
from app import db
from flask_login import  login_required,  current_user
from sqlalchemy import func

student_bp = Blueprint('student', __name__)


#API STUDENTS ----------------------------------------------------------
@student_bp.route('/api/students', methods=['POST'])
@login_required
def add_student():
        try:
            data = request.json

            first_name = data.get("first_name")
            last_name = data.get("last_name")
            email = data.get("email")
            class_id = data.get("class_id")
        
            new_student = Student(first_name=first_name,
                                  last_name=last_name,
                                  email=email,
                                  class_id=class_id)
            db.session.add(new_student)
            db.session.commit()

            return jsonify({
                "message": "Student added",
                "student": new_student.to_dict()
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
        
@student_bp.route('/api/students/<int:class_id>', methods=['GET'])
@login_required
def get_student_by_class_id(class_id):

    cls = Class.query.filter_by(id=class_id, user_id=current_user.id).first()
    if not cls:
        return jsonify({"error": "Class not found"}), 404
    
    students = Student.query.filter_by(class_id=class_id).order_by(func.lower(Student.last_name).asc()).all()
    
    if not students:
        return jsonify({"message": "No students found for this class"}), 404
    
    return jsonify([student.to_dict() for student in students])


@student_bp.route('/api/students', methods=['GET'])
@login_required
def get_student():
    search_query = request.args.get('search', '').strip()
    class_id = request.args.get('class_id') 

    if not search_query:
        return jsonify({"error": "Search query is empty"}), 400

    if not class_id:
        return jsonify({"error": "Class ID is required"}), 400

    cls = Class.query.filter_by(id=class_id, user_id=current_user.id).first()
    if not cls:
        return jsonify({"error": "Class not found or does not belong to user"}), 404


    search_terms = search_query.split()


    filters = []
    for term in search_terms:
        filters.append(
            (Student.first_name.ilike(f"%{term}%")) | 
            (Student.last_name.ilike(f"%{term}%"))
        )


    query = Student.query.filter(Student.class_id == class_id, *filters)
    students = query.all()

    if not students:
        return jsonify({"message": "No students found"}), 404
    return jsonify([student.to_dict() for student in students]), 200



@student_bp.route('/api/student/full/<int:student_id>', methods=['GET'])
@login_required
def get_full_student(student_id):

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404


    cls = Class.query.get(student.class_id)
    if not cls or cls.user_id != current_user.id:
        return jsonify({"error": "Student does not belong to your class"}), 403


    student_data = student.to_dict()


    full_grades = []
    for grade in student.grades:
        grade_data = grade.to_dict()

        assessment = Assesments.query.get(grade.assesments_id)
        if assessment:
            grade_data['assessment'] = assessment.to_dict()
        full_grades.append(grade_data)


    student_data['grades'] = full_grades

    return jsonify(student_data), 200



@student_bp.route('/api/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    try:
        student = Student.query.get(student_id)
        
        if not student:
            return jsonify({"error": "Student not found"}), 404


        cls = Class.query.get(student.class_id)
        if not cls or cls.user_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403


        Grades.query.filter_by(student_id=student.id).delete()
        

        db.session.delete(student)
        db.session.commit()

        return jsonify({"message": "Student and related grades deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
