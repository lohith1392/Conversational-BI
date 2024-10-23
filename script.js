let chatHistory = [];
let currentFile = null;

function handleFileSelect() {
    const fileInput = document.getElementById('csvFile');
    const fileNameSpan = document.getElementById('fileName');
    const chatMessages = document.getElementById('chatMessages');
            
    if (fileInput.files[0]) {
        currentFile = fileInput.files[0];
        fileNameSpan.textContent = currentFile.name;
                
        // Add system message about file upload
        const fileMessage = document.createElement('div');
        fileMessage.className = 'message system-message';
        fileMessage.textContent = `File loaded: ${currentFile.name}`;
        chatMessages.appendChild(fileMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function clearFile() {
    const fileInput = document.getElementById('csvFile');
    const fileNameSpan = document.getElementById('fileName');
    const chatMessages = document.getElementById('chatMessages');
    const visualizationDiv = document.getElementById('visualization');
            
    // Clear file input and filename display
    fileInput.value = '';
    fileNameSpan.textContent = '';
    currentFile = null;
            
    // Clear chat history
    chatHistory = [];
    chatMessages.innerHTML = `
        <div class="message system-message">
        Welcome! Please upload a CSV file and ask questions about your data.
        </div>
    `;
            
    // Clear visualization
        visualizationDiv.innerHTML = '<div class="d3-Graphs"></div>';
    }

async function processData() {
    const fileInput = document.getElementById('csvFile');
    const questionInput = document.getElementById('question');
    const visualizationDiv = document.getElementById('visualization');

    if (!fileInput.files[0]) {
        alert('Please select a CSV file');
        return;
    }

    if (!questionInput.value.trim()) {
        alert('Please enter a question about the data');
        return;
    }

    // Create form data for the request
    const formData = new FormData();
    formData.append('csv', fileInput.files[0]);
    formData.append('question', questionInput.value);

    try {
        // Clear previous visualization
        visualizationDiv.innerHTML = 'Loading...';

        // Send request to backend
        const response = await fetch('http://localhost:5000/generate-visualization', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        // Clear the visualization div
        visualizationDiv.innerHTML = '';

        // Store the data globally
        window.data = result.data;

        // Create a script element with the generated D3 code
        const scriptElement = document.createElement('script');
        scriptElement.textContent = result.code;
        document.body.appendChild(scriptElement);

    } catch (error) {
        visualizationDiv.innerHTML = `Error: ${error.message}`;
        console.error('Error:', error);
    }
}

// Helper function to handle visualization errors
function handleVisualizationError(error) {
    const visualizationDiv = document.getElementById('visualization');
    visualizationDiv.innerHTML = `Error creating visualization: ${error.message}`;
    console.error('Visualization Error:', error);
}

// Add error handling for the global scope
window.onerror = function(msg, url, lineNo, columnNo, error) {
    handleVisualizationError(error || new Error(msg));
    return false;
};