from flask import Blueprint, render_template, jsonify, send_from_directory, current_app, request, send_file
from app.models import PDF, Student, Grades
from flask_login import login_required, current_user
from app import db
from .charts import generate_bar_chart
from .pdf import create_pdf
from sqlalchemy.orm import joinedload
from .average import weighted_average
from sqlalchemy import func
from .files import transform
import os

utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/pdf', methods=['GET'])
@login_required
def pdf():
    return render_template("pdf.html", user=current_user)

@utils_bp.route('/api/generate_pdf', methods=['POST'])
@login_required
def generate_pdf():
    try:
        data = request.get_json()
        title = data.get("title")
        questions_data = data.get("questions_data")

        if not title or not questions_data:
            return jsonify({"error": "Brak tytułu lub pytań"}), 400

        uploads_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(uploads_folder, exist_ok=True)


        output_filename = f"{title.replace(' ', '_')}.pdf"
        relative_path = os.path.join('uploads', output_filename)
        output_path = os.path.join(uploads_folder, output_filename)

        create_pdf(title, questions_data, output_filename=output_path)

        new_pdf = PDF(filename=output_filename, filepath=relative_path, user_id=current_user.id)
        db.session.add(new_pdf)
        db.session.commit()

 
        return jsonify({"success": "PDF wygenerowany", "filename": output_filename}), 200

    except Exception as e:
        db.session.rollback()
        print("Error in generate_pdf endpoint:", str(e))
        return jsonify({"error": str(e)}), 500

@utils_bp.route('/api/get_all_pdf', methods=['GET'])
@login_required
def get_all_pdf():
    try:
        pdfs = PDF.query.filter_by(user_id=current_user.id).all()
        return jsonify([pdf.to_dict() for pdf in pdfs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@utils_bp.route('/api/delete_pdf/<filename>', methods=['DELETE'])
@login_required
def delete_pdf(filename):
    try:
        pdf = PDF.query.filter_by(filename=filename, user_id=current_user.id).first()
        if not pdf:
            return jsonify({"error": "PDF nie znaleziony lub brak uprawnień"}), 404

        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], pdf.filename)
        if os.path.exists(filepath):
            os.remove(filepath)

        db.session.delete(pdf)
        db.session.commit()
        return jsonify({"success": "PDF usunięty"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error in delete_pdf endpoint:", str(e))
        return jsonify({"error": str(e)}), 500

@utils_bp.route('/uploads/<path:filename>')
@login_required
def serve_pdf(filename):
    uploads_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(uploads_folder, filename)

# WYKRESY
@utils_bp.route('/api/charts', methods=['POST'])
@login_required
def add_data():
    global proccessed_result, test
    data = request.json
    grades_list = data.get('grades', [])
    name = data.get('name')

    if not grades_list or not name:
        return jsonify({"error": "Brak danych ocen lub nazwy"}), 400

    end_grades = [int(grade.get('grade')) for grade in grades_list]
    test = name
    proccessed_result = end_grades

    chart_image = generate_bar_chart(proccessed_result, test)
    return send_file(chart_image, mimetype='image/png', as_attachment=False)

# OBLICZANIE ŚREDNIEJ
@utils_bp.route('/api/averages', methods=['GET'])
@login_required
def calculate_average():
    class_id = request.args.get('classId', type=int)
    if not class_id:
        return jsonify({"error": "Brak ID klasy"}), 400

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

# PRZETWARZANIE PLIKÓW
@utils_bp.route('/api/files', methods=['POST'])
@login_required
def get_file():
    try:
        file = request.files.get('file')
        class_id = request.form.get('classId')

        if not file or not class_id:
            return jsonify({"error": "Brak pliku lub ID klasy"}), 400
        
        data = transform(file)
        new_students = [
            Student(first_name=data[0][i], last_name=data[1][i], email=data[2][i], class_id=class_id)
            for i in range(len(data[0]))
        ]
        
        db.session.add_all(new_students)
        db.session.commit()
        return jsonify({"message": "Plik przetworzony", "filename": file.filename}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Błąd podczas przetwarzania pliku: {str(e)}"}), 500