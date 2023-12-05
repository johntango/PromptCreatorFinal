// Description: This file contains the javascript for the popup.html page

const url= "https://localhost:3031/test-prompt";

function sendPositive() {
  sendRequest('positive');
}

function sendNegative() {
  sendRequest('negative');
}

function sendRequest(sentiment) {
  const prompt = document.getElementById('prompt').value;
  const data = { prompt, sentiment };
 
    console.log("data: " + JSON.stringify(data));
    fetch('/test-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      mode: 'cors'
    }).then(response => response.text()) // Parse the response as plain text
      .then(text => {
        console.log(text); // Should print
        document.getElementById("response").innerHTML = text;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
}

