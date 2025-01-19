from flask import Blueprint, render_template, jsonify, send_from_directory, current_app, request
from app.models import PDF, Student, Grades
from flask_login import login_required, current_user
import os
from app import db
from flask import  send_file
from .charts import generate_bar_chart
from .pdf import create_pdf
from sqlalchemy.orm import joinedload
from .average import weighted_average
from sqlalchemy import func



utils_bp = Blueprint('utils', __name__)


@utils_bp.route('/pdf', methods=['GET'])
@login_required
def pdf():
    return render_template("pdf.html", user=current_user)


@utils_bp.route('/api/generate_pdf', methods=['POST'])
@login_required
def generate_pdf():
    try:
        data = request.json
        title = data.get("title", "Brak tytułu")
        questions_data = data.get("questions_data", {})

        uploads_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(uploads_folder, exist_ok=True)

        output_filename = f"{title}.pdf"

        relative_path = os.path.join('uploads', output_filename)
        
        output_path = os.path.join(uploads_folder, output_filename)

        create_pdf(title, questions_data, output_filename=output_path)

        new_pdf = PDF(filename=output_filename, filepath=relative_path, user_id=current_user.id)
        db.session.add(new_pdf)
        db.session.commit()
        

        return send_file(output_path, as_attachment=False, mimetype='application/pdf')

    except Exception as e:
        db.session.rollback()
        print("Error in generate_pdf endpoint:", str(e))
        return jsonify({"error": str(e)}), 500



###TYMACZASOWE PDF W JSON
@utils_bp.route('/api/get_all_pdf', methods=['GET'])
@login_required
def get_all_pdf():
    try:
        pfds = PDF.query.filter_by(user_id=current_user.id).all()
        return jsonify([pdf.to_dict() for pdf in pfds])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@utils_bp.route('/uploads/<path:filename>')
@login_required
def serve_pdf(filename):
    uploads_folder = current_app.config['UPLOAD_FOLDER']

    return send_from_directory(uploads_folder, filename)



#WYKRESY--------------------------------------------------------------------
@utils_bp.route('/api/charts', methods=['POST'])
@login_required

def add_data():
    global proccessed_result
    global test

    if request.method == 'POST':
        data = request.json
        grades_list = data.get('grades', [])
        name = data.get('name')
        new_objects = []

        for grade_data in grades_list:
            grade = grade_data.get('grade')
            new_objects.append(grade)
            
        end_grades = [int(grade) for grade in new_objects]
        
        test = name
        proccessed_result = end_grades

        chart_image = generate_bar_chart(proccessed_result, test)
        return send_file(chart_image, mimetype='image/png', as_attachment=False)
    

#OBLICZANIE SREDNIEJ-----------------------
@utils_bp.route('/api/averages', methods=['GET'])
@login_required
def calculate_average():
    class_id = request.args.get('classId', type=int)

    students = (
        db.session.query(Student)
        .filter(Student.class_id == class_id)
        .options(joinedload(Student.grades).joinedload(Grades.assesments))
        .order_by(func.lower(Student.last_name).asc())
        .all()
    )
  
    results = []

    for student in students:
       
        grades_with_weights = [
            (float(grade.grade), grade.assesments.weight)
            for grade in student.grades
            if grade.grade and grade.assesments.weight
        ]
        

        grades = [grade for grade, _ in grades_with_weights]
        weights = [weight for _, weight in grades_with_weights]

        try:
           
            if grades and weights:
                avg = weighted_average(grades, weights)
                results.append(avg)
            else:
                
                results.append('-')
        except ValueError as e:
        
            print(f"Error calculating weighted average for student {student.id}: {e}")
            results.append(None)

    return jsonify(results), 200

