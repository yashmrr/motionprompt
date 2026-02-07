// Detect payment success
const params = new URLSearchParams(window.location.search);

if (params.get("payment") === "success") {
  localStorage.setItem("premium", "true");
  alert("✅ Premium Activated!");
}

// Hide unlock button if premium
document.addEventListener("DOMContentLoaded", () => {
  const unlockLink = document.getElementById("unlockLink");

  if (localStorage.getItem("premium") === "true") {
    if (unlockLink) {
      unlockLink.style.display = "none";
    }
  }
});


const fileInput = document.getElementById('videoInput');
const dropZone = document.getElementById('dropZone');
const videoPreview = document.getElementById('videoPreview');
const generateBtn = document.getElementById('generateBtn');
const outputPrompt = document.getElementById('outputPrompt');
const resultArea = document.getElementById('resultArea');

let selectedFile = null;

// Upload Handling
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

function handleFile(file) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
        alert("File too large. Keep it under 20MB.");
        return;
    }
    selectedFile = file;

    const url = URL.createObjectURL(file);
    videoPreview.src = url;
    videoPreview.style.display = 'block';
    dropZone.style.display = 'none';
}

// MAIN LOGIC
generateBtn.addEventListener('click', async () => {
    if (!selectedFile) return alert("Please upload a video first.");

    setLoading(true);

    try {
        const base64Data = await fileToBase64(selectedFile);

        const response = await fetch('/api/process-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video: base64Data })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        outputPrompt.value = data.prompt;
        resultArea.classList.remove('hidden');

    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        setLoading(false);
    }
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function setLoading(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.innerText = "Analyzing Motion...";
        outputPrompt.value = "Thinking...";
    } else {
        generateBtn.disabled = false;
        generateBtn.innerText = "Generate Prompt";
    }
}

document.getElementById('copyBtn').addEventListener('click', () => {
    outputPrompt.select();
    document.execCommand('copy');
    alert("Copied to clipboard!");
});
