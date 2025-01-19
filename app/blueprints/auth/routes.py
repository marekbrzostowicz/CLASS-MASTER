from flask import Blueprint, request, render_template, jsonify, url_for
from app.models import User, Class, Student, Assesments, Grades
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from flask_login import login_user, login_required, logout_user, current_user
from sqlalchemy import func



auth_bp = Blueprint('auth', __name__)


proccessed_result = None
test = None


#LOGOWANIE------------------------------------------------
@auth_bp.route('/login', methods=['GET', 'POST'])
def auth_login():
    if request.method == 'POST':
        
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            
            return jsonify({"error": "Invalid email or password"}), 401
        
        login_user(user, remember=True)

        return jsonify({"redirect": url_for('auth.home')}), 200

    return render_template("login.html", user=current_user)


#WYLOGOWANIE----------------------------------------------
@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"redirect": url_for('auth.auth_login')}), 200
   

#HOME------------------------------------------
@auth_bp.route('/home', methods=['GET'])
@login_required 
def home():
    return render_template("home.html", user=current_user)





#REJESTRACJA------------------------------------------------
@auth_bp.route('/register', methods=['GET'])
def register_page():
    return render_template("register.html")


#REJESTRACJA API------------------------------------------
@auth_bp.route('/api/register', methods=['POST', 'GET'])
def auth_register():
    if request.method == 'POST':
        try:
            data = request.json

            email = data.get("email")
            first_name = data.get("first_name")
            password = data.get("password")

            new_user = User(email=email, 
                            first_name=first_name, 
                            password=generate_password_hash(password, method='pbkdf2:sha256'))
            
            db.session.add(new_user)
            db.session.commit()
        
        except Exception as error:
            db.session.rollback()
            print(f"Error: {error}")
            return jsonify({"message": "Failed to create new user"})
        
        
        return jsonify({"message": "User created"}), 201

    elif request.method == 'GET':
        user_data = User.query.all()
        result = [user.to_dict() for user in user_data]
        return jsonify(result)
        




#API STUDENTS ----------------------------------------------------------
@auth_bp.route('/api/students', methods=['POST'])
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

            # <-- DODAJ TEN RETURN W PRZYPADKU SUKCESU
            return jsonify({
                "message": "Student added",
                "student": new_student.to_dict()
            }), 201

        except Exception as e:
            # Dobrze też zrobić rollback w razie błędu
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
        
@auth_bp.route('/api/students/<int:class_id>', methods=['GET'])
@login_required
def get_student_by_class_id(class_id):

    cls = Class.query.filter_by(id=class_id, user_id=current_user.id).first()
    if not cls:
        return jsonify({"error": "Class not found"}), 404
    
    students = Student.query.filter_by(class_id=class_id).order_by(func.lower(Student.last_name).asc()).all()
    
    if not students:
        return jsonify({"message": "No students found for this class"}), 404
    
    return jsonify([student.to_dict() for student in students])


@auth_bp.route('/api/students', methods=['GET'])
@login_required
def get_student():
    search_query = request.args.get('search', '').strip()
    class_id = request.args.get('class_id')  # Pobierz `class_id` z zapytania

    if not search_query:
        return jsonify({"error": "Search query is empty"}), 400

    if not class_id:
        return jsonify({"error": "Class ID is required"}), 400

    # Sprawdzenie, czy klasa należy do aktualnego użytkownika
    cls = Class.query.filter_by(id=class_id, user_id=current_user.id).first()
    if not cls:
        return jsonify({"error": "Class not found or does not belong to user"}), 404

    # Rozdziel query na słowa
    search_terms = search_query.split()

    # Przygotuj filtrację dla każdej części zapytania
    filters = []
    for term in search_terms:
        filters.append(
            (Student.first_name.ilike(f"%{term}%")) | 
            (Student.last_name.ilike(f"%{term}%"))
        )

    # Filtruj uczniów według `class_id` oraz warunków wyszukiwania
    query = Student.query.filter(Student.class_id == class_id, *filters)
    students = query.all()

    if not students:
        return jsonify({"message": "No students found"}), 404

    return jsonify([student.to_dict() for student in students]), 200







    


    



    

        




        

#OCENY-----------------------------------------------------------------------
# @auth_bp.route('/api/grades', methods=['GET', 'POST'])
# @login_required

# def add_grades():
#     if request.method == 'GET':
#         user_classes = Class.query.filter_by(user_id = current_user.id).all()
#         class_ids = [cls.id for cls in user_classes]

#         students = Student.query.filter(Student.class_id.in_(class_ids)).all()
#         student_ids = [cls.id for cls in students]

#         grades = Grades.query.filter(Grades.student_id.in_(student_ids)).all()


#         return jsonify([grade.to_dict() for grade in grades])
        
#     elif request.method == 'POST':
#         try:
#             data = request.json
#             grades_list = data.get('grades', [])
#             new_objects = []

#             for grade_data in grades_list:
#                 grade_val = grade_data.get('grade')
#                 student_id = grade_data.get('student_id')
#                 assesments_id = grade_data.get('assesments_id')

#                 existing_grade = Grades.query.filter_by(
#                     student_id=student_id,
#                     assesments_id=assesments_id
#                 ).first()

#                 if existing_grade:
#                     existing_grade.grade = grade_val
#                     new_objects.append(existing_grade)
#                 else:
#                     new_grade = Grades(
#                         grade=grade_val,
#                         student_id=student_id,
#                         assesments_id=assesments_id
#                     )
#                     db.session.add(new_grade)
#                     new_objects.append(new_grade)

#             db.session.commit()


#             return jsonify({
#                 "message": "Grades added",
#                 "grades": [obj.to_dict() for obj in new_objects]
                
#             }), 201

#         except Exception as e:
#             db.session.rollback()
#             return jsonify({"error": str(e)}), 500


        





















































































# ULEPSZONER ZAPYTANIE SQL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# @auth_bp.route('/api/assesments', methods=['GET', 'POST'])
# @login_required
# def add_column():
#     if request.method == 'GET':
#         # Pobierz wszystkie kolumny ocen powiązane z klasami użytkownika
#         columns = Assesments.query.join(Class, Assesments.class_id == Class.id)\
#                                   .filter(Class.user_id == current_user.id).all()
#         return jsonify([column.to_dict() for column in columns]), 200
