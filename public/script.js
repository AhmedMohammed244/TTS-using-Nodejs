// Fetch voices and populate combo box
async function fetchVoices() {
    const voiceSelect = document.getElementById("voiceSelect");

    try {
        const response = await fetch("http://127.0.0.1:5000/api/voices");  // URL to backend
        const voices = await response.json();

        voiceSelect.innerHTML = '<option value="" disabled selected>Select a voice</option>';
        voices.forEach(voice => {
            const option = document.createElement("option");
            option.value = voice.voice_id;
            option.textContent = voice.name;
            voiceSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching voices:", error);
        voiceSelect.innerHTML = '<option disabled>Error loading voices</option>';
    }
}

// Convert text to speech
async function convertTextToSpeech() {
    const text = document.getElementById("text").value;
    const voiceId = document.getElementById("voiceSelect").value;
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.querySelector(".progress-container");
    const progressText = document.getElementById("progressText");
    const audioPlayer = document.getElementById("audioPlayer");

    if (!text || !voiceId) {
        alert("Please enter text and select a voice.");
        return;
    }

    progressContainer.style.display = "flex";
    progressBar.value = 0;
    progressText.textContent = "0%";

    // Simulate progress bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
        if (progress >= 90) {
            clearInterval(interval); // Stop the progress once 90% is reached
        }
    }, 500);

    try {
        const response = await fetch("http://127.0.0.1:5000/api/text-to-speech", {  // Ensure the URL is correct
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice_id: voiceId })
        });
        console.log("Backend Response:", response);  // Log the response for debugging

        if (response.ok) {
            const audioBlob = await response.blob();  // Get the audio blob from response
            const audioUrl = URL.createObjectURL(audioBlob);  // Create a URL for the audio blob

            audioPlayer.src = audioUrl;  // Set the source of the audio player to the URL
            audioPlayer.style.display = "block";  // Make sure the audio player is visible
            progressBar.value = 100;  // Update the progress bar to 100%
            progressText.textContent = "100%";  // Update the progress text to 100%

            clearInterval(interval);  // Clear the progress interval once done+
        } else {
            console.error("Error in backend response:", await response.text());  // Log error if response is not OK
            alert("Failed to convert text to speech.");
        }
    } catch (error) {
        console.error("Error converting text:", error);
        alert("An error occurred. Check the console for details.");
        clearInterval(interval);  // Ensure the progress bar stops on error
    }
}



// Event Listeners
document.addEventListener("DOMContentLoaded", fetchVoices);
document.getElementById("convertButton").addEventListener("click", convertTextToSpeech);  
