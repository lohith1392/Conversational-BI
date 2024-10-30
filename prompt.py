from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os
import requests
import io

app = Flask(__name__)
CORS(app)

# Set your API key
os.environ['API_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpamF5YWRpdHlhLnJhcGFrYUBzdHJhaXZlLmNvbSJ9.v8M1AYJM-nvheNafM6PndjYuIClOaK5uHgvi-2iAHqQ'

def convert_and_save_xlsx_to_csv(xlsx_file):
    """Convert Excel file to CSV format and save it"""
    # Get the original filename without extension
    base_filename = os.path.splitext(xlsx_file.filename)[0]
    csv_filename = f"{base_filename}.csv"
    
    # Read Excel file
    df = pd.read_excel(xlsx_file)
    
    # Save as CSV in the same directory
    csv_path = os.path.join(os.path.dirname(xlsx_file.filename), csv_filename)
    df.to_csv(csv_path, index=False)
    
    return df, csv_filename

def generate_d3_code(filename,file_type,csv_data, question):
    # Convert CSV data to a string format for the prompt
    csv_preview = csv_data.head().to_string()
    columns = csv_data.columns.tolist()

    # Modify filename for Excel files
    if file_type == 'xlsx':
        filename = filename.rsplit('.', 1)[0] + '.csv'
    
    prompt = f"""
    **Do not include ```javascript at the beginning of the code and ``` at the end of the code**
    Generate D3 SVG components to be embedded into a div with the class name "d3-Graphs" using D3.js, based on the provided data and question.

    Data Overview:
    - File Name:{filename}
    - Data Type: {file_type}
    - CSV/JSON Data Preview: {csv_preview}
    - Available Columns: {columns}

    Question: {question}

    IMPORTANT:
    1. Use **d3.csv()** if the file is in CSV format, and **d3.json()** if it is a JSON file. Handle both scenarios correctly.
    2. DO NOT create sample data arrays - the data must be loaded from the CSV file
    3. Process the loaded CSV data to answer the specific question
    4. Create appropriate visualizations based on the processed data
    5. As the functions of d3 are casesensitive, use correct camelCase (e.g., d3.scaleLinear, d3.scaleBand)
    6. Include proper scales, axes, labels, and tooltips
    7. Make the visualization responsive
    8. Handle data type conversions (string to number) where needed
    9. Include error handling for the data loading
    10. For JSON data:
        - Check if the data is an array using Array.isArray(data)
        - If it's not an array, handle nested structures appropriately
        - Use Object.entries() or Object.values() if needed to convert object data to arrays

    (()=>{{
        // Select the target div
        const svg = d3.select('.d3-Graphs')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Load and process the data based on file type
        if ('{file_type}' === 'csv') {{
            d3.csv("{filename}.csv")
                .then(data => {{
                    // Process data and create visualization here
                }})
                .catch(error => {{
                    console.error("Error loading the CSV file:", error);
                }});
        }} else {{
            d3.json('{filename}.json')
                .then(data => {{
                    // Handle different JSON structures
                    const processedData = Array.isArray(data) 
                        ? data 
                        : Array.isArray(data.data) 
                            ? data.data 
                            : Object.values(data);
                    
                    // Now processedData is guaranteed to be an array
                    // Process data and create visualization here
                }})
                .catch(error => {{
                    console.error("Error loading the JSON file:", error);
                }});
        }}
    }})()


    Generate only the latest D3.js version code with highest possible dynamic visualization and proper display of data on hovering on it having text color as black  without any explanations.
    
    """
    
    response = requests.post(
        "https://llmfoundry.straive.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ['API_KEY']}:my-test-project"
        },
        json={
            "model": "gpt-4o",
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    
    if response.status_code == 200:
        response_json = response.json()
        return response_json['choices'][0]['message']['content'].strip()
    else:
        raise Exception(f"API request failed: {response.text}")

@app.route('/generate-visualization', methods=['POST'])
def generate_visualization():
    try:
        file = request.files['data']
        question = request.form['question']
        file_type = request.form['fileType'].lower()

        # Create a directory to save files if it doesn't exist
        save_dir = os.path.dirname(os.path.abspath(__file__))
        
        if file_type == 'csv':
            # For CSV files, save the uploaded file directly
            filename = file.filename
            file_path = os.path.join(save_dir, filename)
            file.save(file_path)
            df = pd.read_csv(file_path)
        elif file_type == 'json':
            # For JSON files, save the uploaded file directly
            filename = file.filename
            file_path = os.path.join(save_dir, filename)
            file.save(file_path)
            df = pd.read_json(file_path)
        elif file_type == 'xlsx':
            # For Excel files, convert and save as CSV
            df, filename = convert_and_save_xlsx_to_csv(file)
            # Save the Excel file too if needed
            excel_path = os.path.join(save_dir, file.filename)
            file.save(excel_path)
        else:
            raise ValueError("Unsupported file type. Please upload a CSV, JSON, or Excel file.")

        def clean_js_code(js_code):
            # Remove ```javascript and ``` if present
            cleaned_code = js_code.strip()
            if cleaned_code.startswith("```javascript"):
                cleaned_code = cleaned_code[len("```javascript"):].strip()
            if cleaned_code.startswith("```"):
                cleaned_code = cleaned_code[len("```"):].strip()
            if cleaned_code.endswith("```"):
                cleaned_code = cleaned_code[:-3].strip()
            return cleaned_code

        d3_code = generate_d3_code(filename, file_type, df, question)
        cleaned_code = clean_js_code(d3_code)

        # Write the cleaned code to the file
        with open('script1.js', 'w') as js_file:
            js_file.write(cleaned_code)

        return jsonify({'success': True, 'code': d3_code})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)