from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from flask_login import LoginManager
from config import Config




db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)

    from app.blueprints.auth.routes import auth_bp
    from app.blueprints.utils.routes import utils_bp
    from app.blueprints.classes.routes import classes_bp
    from app.blueprints.grades.routes import grades_bp
    from app.blueprints.assesments.routes import assessments_bp


    from .models import User
    app.register_blueprint(auth_bp)
    app.register_blueprint(utils_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(grades_bp)
    app.register_blueprint(assessments_bp)


    return app


def create_database(app):
    if not os.path.exists(f"instance/{DB_NAME}"):
        with app.app_context():
            db.create_all()
        print("Database created")

    from .models import User
    login_manager = LoginManager()
    login_manager.login_view = 'auth.auth_login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))


