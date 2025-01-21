import pandas
import os
import mimetypes


def transform(file):
    mime_type, _ = mimetypes.guess_type(file.filename)

    if mime_type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        
        df = pandas.read_excel(file)
        name = list(df['imie'])
        last_name = list(df['nazwisko'])
        email = list(df['email'])
        return name, last_name, email
    
    if mime_type == 'text/csv':
        df = pandas.read_csv(file)
        name = list(df['imie'])
        last_name = list(df['nazwisko'])
        email = list(df['email'])
        return name, last_name, email


