from flask import Blueprint, request, jsonify
from app.models import Class, Student, Grades

from app import db
from flask_login import  login_required, current_user


grades_bp = Blueprint('grades', __name__)

#OCENY-----------------------------------------------------------------------
@grades_bp.route('/api/grades', methods=['GET', 'POST'])
@login_required

def add_grades():
    if request.method == 'GET':
        user_classes = Class.query.filter_by(user_id = current_user.id).all()
        class_ids = [cls.id for cls in user_classes]

        students = Student.query.filter(Student.class_id.in_(class_ids)).all()
        student_ids = [cls.id for cls in students]

        grades = Grades.query.filter(Grades.student_id.in_(student_ids)).all()


        return jsonify([grade.to_dict() for grade in grades])
        
    elif request.method == 'POST':
        try:
            data = request.json
            grades_list = data.get('grades', [])
            new_objects = []

            for grade_data in grades_list:
                grade_val = grade_data.get('grade')
                student_id = grade_data.get('student_id')
                assesments_id = grade_data.get('assesments_id')

                existing_grade = Grades.query.filter_by(
                    student_id=student_id,
                    assesments_id=assesments_id
                ).first()

                if existing_grade:
                    existing_grade.grade = grade_val
                    new_objects.append(existing_grade)
                else:
                    new_grade = Grades(
                        grade=grade_val,
                        student_id=student_id,
                        assesments_id=assesments_id
                    )
                    db.session.add(new_grade)
                    new_objects.append(new_grade)

            db.session.commit()


            return jsonify({
                "message": "Grades added",
                "grades": [obj.to_dict() for obj in new_objects]
                
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
