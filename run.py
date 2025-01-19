from app import create_app, create_database

app = create_app()
create_database(app)

if __name__ == "__main__":
    app.run(debug=True)