from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os
import requests

app = Flask(__name__)
CORS(app)

# Set your API key
os.environ['API_KEY'] = 'api_key'

def generate_d3_code(csv_data, question):
    # Convert CSV data to a string format for the prompt
    csv_preview = csv_data.head().to_string()
    columns = csv_data.columns.tolist()
    
    prompt = f"""
    Generate d3 svg components to be embedded into a div with the class name "d3-Graphs" using d3 js based on the following data and question.

    CSV Data Preview:
    {csv_preview}

    Available Columns: {columns}

    Question: {question}

    IMPORTANT:
    1. Use d3.csv("loan_data_set.csv") to load the actual CSV file data
    2. DO NOT create sample data arrays - the data must be loaded from the CSV file
    3. Process the loaded CSV data to answer the specific question
    4. Create appropriate visualizations based on the processed data
    5. As the functions of d3 are casesensitive, use correct camelCase (e.g., d3.scaleLinear, d3.scaleBand)
    6. Include proper scales, axes, labels, and tooltips
    7. Make the visualization responsive
    8. Handle data type conversions (string to number) where needed
    9. Include error handling for the data loading

    The code must be wrapped in an immediately invoked function expression and use d3.csv() to load the data:

    (()=>{{
        // Select the target div
        const svg = d3.select('.d3-Graphs')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Load and process the actual CSV file
        d3.csv("loan_data_set.csv").then(data => {{
            // Process data and create visualization here
        }}).catch(error => {{
            console.error("Error loading the CSV file:", error);
        }});
    }})()

    Generate only the complete D3.js code with highest possible dynamic visualization and proper display of data on hovering on it having text color as black  without any explanations.
    **Do not include ```javascript at the beginning of the code and ``` at the end of the code**
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
        # Get CSV data and question from request
        file = request.files['csv']
        question = request.form['question']
        
        # Read CSV data
        df = pd.read_csv(file)
        
        # Generate D3.js code using Straive LLM API
        d3_code = generate_d3_code(df, question)
        
        # Write the generated code to script.js
        with open('script1.js', 'w') as js_file:
            js_file.write(d3_code)
        
        return jsonify({
            'success': True,
            'code': d3_code
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
