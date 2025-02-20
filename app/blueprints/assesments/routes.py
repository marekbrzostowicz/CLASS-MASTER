from flask import Blueprint, request, jsonify, send_file
from app.models import Class, Assesments, Grades
from app import db
from flask_login import login_required, current_user
# from utils.charts import generate_bar_chart
from ...blueprints.utils.charts import generate_bar_chart



assessments_bp = Blueprint('assessments', __name__)


#ZMIENIANIE WAG--------------------------------------------------
@assessments_bp.route('/api/assesments', methods=['PATCH'])
@login_required

def update_weight():

    try:
        weight = request.args.get('weight',type=int)
        column_id = request.args.get('column_id', type=int)

        if not weight or not column_id:
            return jsonify({"error": "missing weight or column ID"}), 404
        
        column = Assesments.query.join(Class).filter(
            Class.user_id == current_user.id,
            Assesments.id == column_id
        ).first()

        if not column:
            return jsonify({"error": "Column not founded"}), 404
        
        column.weight = weight
        db.session.commit()

        return jsonify({"message": "Weight updated succesfully"}), 200
    
    except Exception as e:
        return jsonify({"error": f"An error occured ${str(e)}"})
    

#DODAWANIE KOLUMN Z OCENAMI----------------------------------------------
@assessments_bp.route('/api/assesments', methods=['GET', 'POST'])
@login_required

def add_column():
    if request.method == 'GET':
        user_classes = Class.query.filter_by(user_id=current_user.id).all()
        class_ids = [cls.id for cls in user_classes]

        columns = Assesments.query.filter(Assesments.class_id.in_(class_ids)).all()
        return jsonify([column.to_dict() for column in columns])
    
    
    elif request.method == 'POST':
        try:
            data = request.json

            column_name = data.get("column_name")
            class_id = data.get("class_id")

            new_column = Assesments(column_name=column_name,class_id=class_id)
            db.session.add(new_column)
            db.session.commit()

            return jsonify({
                "message": "column added",
                "column": new_column.to_dict()
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
  
#USUWANIE KOLUMN--------------------------------------------
@assessments_bp.route('/api/students', methods=['DELETE'])
@login_required
def delete_column():
    try:
        column_id = request.args.get('column_id', type=int)

        if not column_id:
            return jsonify({"error": "Not such column ID"})
        
        grades_to_delete = Grades.query.filter_by(assesments_id=column_id).all()
        for grade in grades_to_delete:
            db.session.delete(grade)
            db.session.commit()
    
        column_to_delete = Assesments.query.filter_by(id=column_id).first()

        if not column_to_delete:
            return jsonify({"error": "Not such column ID"})
        
        db.session.delete(column_to_delete)
        db.session.commit()
        
        return jsonify({"message": "column deleted"}), 200

    except Exception as e:
        return jsonify({"error": f"error occurred {str(e)}"}), 500
    


@assessments_bp.route('/api/assesments/img', methods=["GET"])
@login_required
def generate_column_chart():
    try:
        column_id = request.args.get('colId', type=int)

        if not column_id:
            return jsonify({"error": "No such column ID provided"}), 404

        column = Assesments.query.options(db.joinedload(Assesments.grades)).get(column_id)
        if not column:
            return jsonify({"error": "No such column ID found"}), 404

        all_grades = column.grades
        grades_ = [
            int(grade.grade)
            for grade in all_grades
            if isinstance(grade.grade, str) and grade.grade.strip().isdigit() or isinstance(grade.grade, int)
        ]

        if not grades_:
            return jsonify({"error": "No valid grades available for this column."}), 404

        image = generate_bar_chart(grades_, column.column_name)
        return send_file(image, mimetype='image/png', as_attachment=False)

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": f"Error occurred: {str(e)}"}), 500


