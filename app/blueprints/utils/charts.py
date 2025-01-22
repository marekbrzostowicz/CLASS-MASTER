from collections import Counter
import matplotlib.pyplot as plt
import io

def generate_bar_chart(grades, name):
    if not grades:
        raise ValueError("Grades list is empty.")

    grade_counts = Counter(grades)
    
    all_grades = [1, 2, 3, 4, 5]
    frequencies = [grade_counts.get(grade, 0) for grade in all_grades]
    percentage = [
        round(grade_counts.get(grade, 0) / len(grades) * 100, 1)
        for grade in all_grades
    ]
    colors = ['#a50026', '#f98e52', '#f5ffbe', '#84ca66', '#006837']

    plt.figure(figsize=(8, 6))
    bars = plt.bar(all_grades, frequencies, color=colors)

    for idx, bar in enumerate(bars):
        if frequencies[idx] > 0:  
            plt.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.2,
                f'{percentage[idx]}%',
                ha='center'
            )
    
    plt.xlabel('GRADE')
    plt.ylabel('FREQUENCY')
    plt.title(name)

    plt.xticks(all_grades)
    plt.yticks(range(0, max(frequencies) + 2))

  
    img = io.BytesIO()
    plt.savefig(img, format='png')
    plt.close()
    img.seek(0)

    return img
