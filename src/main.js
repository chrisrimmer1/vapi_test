import Vapi from '@vapi-ai/web';
import './style.css';

// Create the UI
const app = document.querySelector('#app');
app.innerHTML = `
  <div class="container">
    <h1>Vapi Test Implementation</h1>
    
    <div class="control-panel">
      <div class="input-group">
        <label for="public-key">Vapi Public Key:</label>
        <input type="text" id="public-key" placeholder="Enter your Vapi public key">
      </div>
      <div class="input-group">
        <label for="assistant-id">Assistant ID:</label>
        <input type="text" id="assistant-id" placeholder="Enter your assistant ID">
      </div>
      <button id="initialize-btn">Initialize Vapi</button>
    </div>

    <div class="control-panel">
      <button id="start-call" disabled>Start Call</button>
      <button id="stop-call" disabled>Stop Call</button>
      <button id="toggle-mute" disabled>Toggle Mute</button>
    </div>

    <div id="status-log"></div>
  </div>
`;

// Initialize variables
let vapi = null;
let isMuted = false;

// Utility function for logging
function log(message, type = 'info') {
    const statusLog = document.getElementById('status-log');
    const logEntry = document.createElement('div');
    logEntry.className = `status ${type}`;
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    statusLog.insertBefore(logEntry, statusLog.firstChild);
}

// Initialize Vapi
document.getElementById('initialize-btn').addEventListener('click', () => {
    const publicKey = document.getElementById('public-key').value.trim();
    
    if (!publicKey) {
        log('Please enter a valid public key', 'error');
        return;
    }

    try {
        vapi = new Vapi(publicKey);
        log('Vapi initialized successfully', 'success');
        
        // Enable buttons
        document.getElementById('start-call').disabled = false;
        document.getElementById('initialize-btn').disabled = true;

        // Set up event listeners
        setupVapiEventListeners();
    } catch (error) {
        log(`Failed to initialize Vapi: ${error.message}`, 'error');
    }
});

// Setup Vapi event listeners
function setupVapiEventListeners() {
    vapi.on('call-start', () => {
        log('Call started', 'success');
        document.getElementById('stop-call').disabled = false;
        document.getElementById('toggle-mute').disabled = false;
        document.getElementById('start-call').disabled = true;
    });

    vapi.on('call-end', () => {
        log('Call ended', 'info');
        document.getElementById('stop-call').disabled = true;
        document.getElementById('toggle-mute').disabled = true;
        document.getElementById('start-call').disabled = false;
    });

    vapi.on('error', (error) => {
        log(`Error: ${error.message}`, 'error');
    });

    vapi.on('speech-start', () => {
        log('Assistant started speaking', 'info');
    });

    vapi.on('speech-end', () => {
        log('Assistant stopped speaking', 'info');
    });

    vapi.on('message', (message) => {
        log(`Message received: ${JSON.stringify(message)}`, 'info');
    });

    vapi.on('volume-level', (volume) => {
        // Only log significant volume changes to avoid spam
        if (volume > 0.5) {
            log(`High volume detected: ${volume}`, 'info');
        }
    });
}

// Start call button
document.getElementById('start-call').addEventListener('click', async () => {
    try {
        const assistantId = document.getElementById('assistant-id').value.trim();
        if (!assistantId) {
            log('Please enter an assistant ID', 'error');
            return;
        }
        
        log(`Starting call with assistant ${assistantId}...`, 'info');
        await vapi.start(assistantId, {
            // Optional overrides can be added here
            // variableValues: {
            //     name: 'John',
            // },
            // recordingEnabled: false,
        });
    } catch (error) {
        log(`Failed to start call: ${error.message}`, 'error');
    }
});

// Stop call button
document.getElementById('stop-call').addEventListener('click', () => {
    try {
        vapi.stop();
        log('Call stop requested', 'info');
    } catch (error) {
        log(`Failed to stop call: ${error.message}`, 'error');
    }
});

// Toggle mute button
document.getElementById('toggle-mute').addEventListener('click', () => {
    try {
        isMuted = !isMuted;
        vapi.setMuted(isMuted);
        log(`Microphone ${isMuted ? 'muted' : 'unmuted'}`, 'info');
        document.getElementById('toggle-mute').textContent = isMuted ? 'Unmute' : 'Mute';
    } catch (error) {
        log(`Failed to toggle mute: ${error.message}`, 'error');
    }
});

// Check for required browser features
window.addEventListener('load', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        log('Your browser does not support audio input. Please use a modern browser.', 'error');
        document.getElementById('initialize-btn').disabled = true;
    }
});