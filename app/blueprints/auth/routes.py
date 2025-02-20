from flask import Blueprint, request, render_template, jsonify, url_for
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from flask_login import login_user, login_required, logout_user, current_user
from sqlalchemy import func

auth_bp = Blueprint('auth', __name__)

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
   
#HOME----------------------------------------------------
@auth_bp.route('/home', methods=['GET'])
@login_required 
def home():
    return render_template("home.html", user=current_user)

#REJESTRACJA----------------------------------------------
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


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    return render_template('register.html')