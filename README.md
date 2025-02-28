# SCHOOL MANAGEMENT SYSTEM

## Description

This is a web application designed for educators, providing a comprehensive toolset to manage educational content and assessments. Built using Flask, HTML, CSS, and JavaScript, it enables teachers to:

- **Create and Name Classes**: Easily set up and label classes for different groups of students.
- **Add Students**: Add students manually, or import them efficiently via Excel or CSV files.
- **Record and Manage Grades**: Track and save student grades, ensuring accurate and organized assessment data.
- **Generate Grade Charts**: Create visual charts to analyze and present grade distributions effectively.
- **Generate Custom PDFs**: Produce customizable PDF tests based on question parameters, including open-ended questions, multiple-choice (ABC) questions, and true/false questions. Users can set titles, points, and question types, and download ready-to-print PDFs.

The interface is responsive and user-friendly, featuring a clean design with a left panel for settings, a middle section for questions and grade management, and a right panel for listing generated PDFs. It uses a professional color scheme (#49536e for the settings panel and #ede7e3 for the background), ensuring usability across desktops and mobile devices.

## Screenshot

### Adding Class  

![image](https://github.com/user-attachments/assets/3dbc92a5-04a2-4a12-a977-fbe6e0bdec93)  

### Delete or Change Class Parameters  

![image](https://github.com/user-attachments/assets/c15f131e-1f8d-42be-b1d2-0a38de51702f)  

### Adding Student  

![image](https://github.com/user-attachments/assets/d696f430-afc1-4171-aac7-d0e0840a5761)  

### Entering Grades  

![image](https://github.com/user-attachments/assets/9c6ec729-96e5-4f54-ae47-fe85e708e42a)  

### Options for Columns  

![image](https://github.com/user-attachments/assets/7544d276-7ee1-402c-a210-95b90b4e843c)  

### Charts Can Be Generated for Individual Students or Columns  

![image](https://github.com/user-attachments/assets/ddc50335-6dec-48e6-b230-5294317231f2)  

### Searching Students  

![image](https://github.com/user-attachments/assets/759e1e46-e704-4f5d-ba33-ca7f4784daf2)  

### Generating PDF  

![image](https://github.com/user-attachments/assets/205e05b4-9cbb-490d-a85d-388d54e1c47d)  

![image](https://github.com/user-attachments/assets/82360f60-1cef-4ace-a480-94e0137c5135)  

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/marekbrzostowicz/SCHOOL-MANAGEMENT-SYSTEM

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   cd SCHOOL-MANAGEMENT-SYSTEM
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
4. Run the application
   ```bash
   python run.py
