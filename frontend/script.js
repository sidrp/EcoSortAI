const API_URL = "http://localhost:8000";


// GET HTML ELEMENTS

const imageInput = document.getElementById("imageInput");

const uploadBox = document.getElementById("uploadBox");

const imagePreview = document.getElementById("imagePreview");
const previewContainer = document.getElementById("previewContainer");

const removeButton = document.getElementById("removeButton");

const analyzeButton = document.getElementById("analyzeButton");

const loadingContainer = document.getElementById("loadingContainer");

const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");

const resultCard = document.getElementById("resultCard");

const resetButton = document.getElementById("resetButton");

const objectName = document.getElementById("objectName");
const categoryBadge = document.getElementById("categoryBadge");

const material = document.getElementById("material");
const confidence = document.getElementById("confidence");

const reason = document.getElementById("reason");
const instructions = document.getElementById("instructions");

const specialNotes = document.getElementById("specialNotes");
const specialNotesText = document.getElementById("specialNotesText");


// This stores the currently selected image.
let selectedFile = null;


// IMAGE SELECTION

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    handleSelectedFile(file);

});


function handleSelectedFile(file) {

    // Make sure the user selected an image.
    if (!file.type.startsWith("image/")) {

        showError("Please select an image file.");

        return;
    }

    selectedFile = file;

    // Lets the browser display the image without uploading it anywhere yet.
    const reader = new FileReader();

    reader.onload = function (event) {

        imagePreview.src = event.target.result;

        previewContainer.classList.add("visible");

        uploadBox.style.display = "none";

        analyzeButton.disabled = false;

        hideError();

    };

    reader.readAsDataURL(file);

}


// REMOVE IMAGE

removeButton.addEventListener("click", function () {

    resetApp();

});

resetButton.addEventListener("click", function () {

    resetApp();

});


// DRAG + DROP

uploadBox.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadBox.classList.add("dragover");

});


uploadBox.addEventListener("dragleave", function () {

    uploadBox.classList.remove("dragover");

});


uploadBox.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadBox.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (!file) {
        return;
    }

    handleSelectedFile(file);

});


// ANALYZE BUTTON

analyzeButton.addEventListener("click", function () {

    analyzeImage();

});


// SEND IMAGE TO PYTHON

async function analyzeImage() {

    // Make sure an image exists.
    if (!selectedFile) {

        showError("Please select an image first.");

        return;
    }


    // Reset previous states.
    hideError();
    hideResult();

    loadingContainer.classList.add("visible");

    analyzeButton.disabled = true;


    // FormData is used to send the image to your Python backend.
    const formData = new FormData();

    formData.append("file", selectedFile);


    try {

        const response = await fetch(
            `${API_URL}/analyze`,
            {
                method: "POST",
                body: formData
            }
        );


        // If Python returned an HTTP error, treat it as a failed request.
        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        // Convert Python's JSON response into a JavaScript object.
        const result = await response.json();


        // Display the AI result.
        displayResult(result);


    } catch (error) {

        console.error(error);

        showError(
            "We couldn't analyze your image. Make sure the Python backend is running."
        );

    } finally {

        loadingContainer.classList.remove("visible");

        analyzeButton.disabled = false;

    }

}


// DISPLAY RESULT

function displayResult(result) {

    objectName.textContent =
        result.object_name || "Unknown object";


    categoryBadge.textContent =
        result.category || "UNKNOWN";


    material.textContent =
        result.material || "Unknown";


    if (typeof result.confidence === "number") {

        confidence.textContent =
            `${Math.round(result.confidence * 100)}%`;

    } else {

        confidence.textContent = "Unknown";

    }


    reason.textContent =
        result.reason || "No explanation provided.";


    instructions.textContent =
        result.instructions || "No instructions provided.";


    if (result.special_notes) {

        specialNotesText.textContent =
            result.special_notes;

        specialNotes.style.display = "flex";

    } else {

        specialNotes.style.display = "none";

    }


    resultCard.classList.add("visible");

    resetButton.classList.add("visible");

}


// SHOW ERROR

function showError(message) {

    errorMessage.textContent = message;

    errorContainer.classList.add("visible");

}


// HIDE ERROR

function hideError() {

    errorContainer.classList.remove("visible");

}


// HIDE RESULT

function hideResult() {

    resultCard.classList.remove("visible");

    resetButton.classList.remove("visible");

}


// RESET EVERYTHING

function resetApp() {

    selectedFile = null;

    imageInput.value = "";

    imagePreview.src = "";

    previewContainer.classList.remove("visible");

    uploadBox.style.display = "block";

    analyzeButton.disabled = true;

    loadingContainer.classList.remove("visible");

    hideError();

    hideResult();

    specialNotes.style.display = "flex";

}