// Wait for the HTML document to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get references to the necessary HTML elements
  const languageSelect = document.getElementById("languageSelect");
  const convertButton = document.getElementById("convertButton");
  const outputDiv = document.getElementById("outputDiv");

  // Add an event listener to the button for the 'click' event
  convertButton.addEventListener("click", function () {
    // Get the value of the currently selected option in the dropdown
    const selectedLanguage = languageSelect.value;

    // Update the text content of the outputDiv
    // You could also add more descriptive text if needed, like:
    // outputDiv.textContent = `Selected Language: ${selectedLanguage}`;
    outputDiv.textContent = selectedLanguage;
  });
});
