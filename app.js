const { exec } = require('child_process');
const axios = require('axios');
const express = require('express');
const path = require('path');
const app = express();

// Function to check if the Flask server is up
function checkFlaskServer() {
    return axios.get('http://127.0.0.1:5000/api/voices')
        .then(response => {
            console.log('Flask server is up and running!');
            return true;  // Flask server is ready
        })
        .catch(error => {
            console.error('Flask server is not available yet:', error);
            return false;  // Flask server is not ready
        });
}

// Start the Flask server
exec('python app.py', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing Python script: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`Python script output: ${stdout}`);
    
    // After starting the Flask server, check if it's up and running
    let serverReady = false;
    const checkInterval = setInterval(async () => {
        serverReady = await checkFlaskServer();
        if (serverReady) {
            clearInterval(checkInterval);  // Stop checking once the server is ready
            proceedWithAxiosCalls();       // Proceed with API calls
        }
    }, 2000);  // Check every 2 seconds if the Flask server is up
});

// Function to proceed with API calls after the server is up
function proceedWithAxiosCalls() {
    axios.get('http://127.0.0.1:5000/api/voices')
        .then(response => {
            console.log('Voices:', response.data);
        })
        .catch(error => {
            console.error('Error fetching voices:', error);
        });

    axios.post('http://127.0.0.1:5000/api/text-to-speech', {
        text: 'Hello',
        voice_id: 'exampleVoiceId'
    })
        .then(response => {
            console.log('Audio data:', response.data);
        })
        .catch(error => {
            console.error('Error converting text to speech:', error);
        });
}

// Serve static files for frontend
app.use(express.static(path.join(__dirname, 'public')));

// Start frontend server (port 3000)
app.listen(3000, () => {
    console.log('Frontend is available at http://localhost:3000');
});
