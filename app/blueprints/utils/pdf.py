from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

font_path = os.path.join(os.path.dirname(__file__), '..', '..', 'static', 'fonts', 'OpenSans-Regular.ttf')
font_path_bold = os.path.join(os.path.dirname(__file__), '..', '..', 'static', 'fonts', 'OpenSans-Bold.ttf')

pdfmetrics.registerFont(TTFont('OpenSans-Regular', font_path))
pdfmetrics.registerFont(TTFont('OpenSans-Bold', font_path_bold))

def draw_wrapped_text(canvas, text, x, y, max_width, font_name="OpenSans-Regular", font_size=12):
    canvas.setFont(font_name, font_size)
    words = text.split()
    line = ""
    
    for word in words:
        test_line = f"{line} {word}".strip()
        if canvas.stringWidth(test_line, font_name, font_size) <= max_width:
            line = test_line
        else:
            canvas.drawString(x, y, line)
            line = word
            y -= 15  
    if line:
        canvas.drawString(x, y, line)
        y -= 15  
    return y

def create_pdf(title, data_dict, output_filename="generated_test.pdf"):
    c = canvas.Canvas(output_filename)
    width, height = c._pagesize
    name = "Imię i nazwisko: ____________________"
    date = 'Data: __________'
    font_name = "OpenSans-Regular"
    font_name_bold = "OpenSans-Bold"
    
    max_points = 0


    c.setFont(font_name_bold, 18)
    text_width = c.stringWidth(title.upper(), font_name_bold, 18)
    x_pos = (width - text_width) / 2
    c.drawString(x_pos, 760, title.upper())

 
    c.setFont(font_name, 12)
    c.drawString(23, 805, name)
    c.drawString(250, 805, date)
    c.drawString(120, 750, ('_' * 53))


    all_questions = []
    for q_type, questions in data_dict.items():
        for q in questions:
            all_questions.append({"type": q_type, "data": q})
    
    all_questions.sort(key=lambda q: q["data"]["order"])


    z = 730
    count = 1
    letters = ['A', 'B', 'C', 'D', 'E', 'F']

    for question in all_questions:
        q_type = question["type"]
        q_data = question["data"]

        if z < 50:  
            c.showPage()
            z = 805
            c.setFont(font_name, 12)
            c.drawString(23, 805, name)
            c.drawString(250, 805, date)

        if q_type == "o":
            z -= 25
            z = draw_wrapped_text(c, f'{count}. {q_data["question"]}', 35, z, 500, font_name_bold, 12)
            c.setFont(font_name, 12)
            c.drawString(540, z + 15, f'_ / {q_data["points"]}')
            max_points += int(q_data["points"])
            for _ in range(int(q_data["lines"])):
                z -= 15
                c.drawString(40, z, ('.' * 155))
            count += 1

        elif q_type == "a":
            z -= 25
            z = draw_wrapped_text(c, f'{count}. {q_data["question"]}', 35, z, 500, font_name_bold, 12)
            c.setFont(font_name, 12)
            c.drawString(540, z + 15, f'_ / {q_data["points"]}')
            max_points += int(q_data["points"])
            for idx, option in enumerate(q_data["options"]):
                if idx % 2 == 0:
                    z -= 15
                    c.drawString(130, z, f'{letters[idx]}: {option}')
                else:
                    c.drawString(375, z, f'{letters[idx]}: {option}')
            count += 1

        elif q_type == "t":
            z -= 25
            z = draw_wrapped_text(c, f'{count}. {q_data["question"]}', 35, z, 500, font_name_bold, 12)
            c.setFont(font_name, 12)
            c.drawString(540, z + 15, f'_ / {q_data["points"]}')
            max_points += int(q_data["points"])
            z -= 15
            c.rect(65, z, 8, 8, stroke=1, fill=0)
            c.drawString(78, z, 'Prawda')
            c.rect(130, z, 8, 8, stroke=1, fill=0)
            c.drawString(143, z, 'Fałsz')
            count += 1

    c.drawString(500, 805, f'Wynik: __ / {max_points}')
    c.save()
    return output_filename