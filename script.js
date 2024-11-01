let chatHistory = [];
let currentFile = null;
let fileType = ''; // Track file type

function handleFileSelect() {
    const fileInput = document.getElementById('dataFile');
    const fileNameSpan = document.getElementById('fileName');
    const chatMessages = document.getElementById('chatMessages');

    if (fileInput.files[0]) {
        const file = fileInput.files[0];
        fileType = file.name.split('.').pop().toLowerCase(); // Get file extension
        
        // Check if file type is supported
        if (!['csv', 'json', 'xlsx'].includes(fileType)) {
            alert('Please upload a CSV, JSON, or Excel (.xlsx) file');
            fileInput.value = '';
            return;
        }
        
        currentFile = file;
        fileNameSpan.textContent = file.name;

        const fileMessage = document.createElement('div');
        fileMessage.className = 'message system-message';
        fileMessage.textContent = `File loaded: ${currentFile.name}`;
        chatMessages.appendChild(fileMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function clearFile() {
    const fileInput = document.getElementById('dataFile');
    const fileNameSpan = document.getElementById('fileName');
    const chatMessages = document.getElementById('chatMessages');
    const visualizationDiv = document.getElementById('visualization');

    fileInput.value = '';
    fileNameSpan.textContent = '';
    currentFile = null;
    chatHistory = [];
    chatMessages.innerHTML = `
        <div class="message system-message">
        Welcome! Please upload a CSV, JSON, or Excel file and ask questions about your data.
        </div>
    `;
    visualizationDiv.innerHTML = '<div class="d3-Graphs"></div>';
}

async function processData() {
    const questionInput = document.getElementById('question');
    const visualizationDiv = document.getElementById('visualization');

    if (!currentFile) {
        alert('Please select a CSV, JSON, or Excel file');
        return;
    }

    if (!questionInput.value.trim()) {
        alert('Please enter a question about the data');
        return;
    }

    const formData = new FormData();
    formData.append('data', currentFile);
    formData.append('question', questionInput.value);
    formData.append('fileType', fileType); // Send file type to backend

    try {
        visualizationDiv.innerHTML = 'Loading...';

        const response = await fetch('http://localhost:5000/generate-visualization', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        visualizationDiv.innerHTML = '';
        const scriptElement = document.createElement('script');
        scriptElement.textContent = result.code;
        document.body.appendChild(scriptElement);

    } catch (error) {
        visualizationDiv.innerHTML = `Error: ${error.message}`;
        console.error('Error:', error);
    }
}