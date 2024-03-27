// Enable WebMidi API and handle any errors if it fails to enable.
// This is necessary to work with MIDI devices in the web browser.
await WebMidi.enable();

// Initialize variables to store the first MIDI input and output devices detected.
// These devices can be used to send or receive MIDI messages.
let myInput = WebMidi.inputs[0];
let myOutput = WebMidi.outputs[0];

let echoTime = 100;
let transpose = -4;
//echo control slider
const echoControl = document.getElementById("echoSlider");
// Get the dropdown elements from the HTML document by their IDs.
// These dropdowns will be used to display the MIDI input and output devices available.
let dropIns = document.getElementById("dropdown-ins");
let dropOuts = document.getElementById("dropdown-outs");

// For each MIDI input device detected, add an option to the input devices dropdown.
// This loop iterates over all detected input devices, adding them to the dropdown.
WebMidi.inputs.forEach(function (input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

// Similarly, for each MIDI output device detected, add an option to the output devices dropdown.
// This loop iterates over all detected output devices, adding them to the dropdown.
WebMidi.outputs.forEach(function (output, num) {
  dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
});

// Add an event listener for the 'change' event on the input devices dropdown.
// This allows the script to react when the user selects a different MIDI input device.

dropIns.addEventListener("change", function () {
  // Before changing the input device, remove any existing event listeners
  // to prevent them from being called after the device has been changed.
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  // Change the input device based on the user's selection in the dropdown.
  myInput = WebMidi.inputs[dropIns.value];

  // Add event listeners for 'noteon' and 'noteoff' events.
  myInput.addListener("noteon", function (event) {
    console.log(event);

    for (let delayNum = 0; delayNum < 16; delayNum++) {
      myOutput.channels[delayNum + 1].sendNoteOn(
        event.note.number + transpose * delayNum,
        {
          time: WebMidi.time + delayNum * echoTime,
          rawAttack: event.note.rawAttack - 8 * delayNum,
        }
      );
    }
  });

  myInput.addListener("noteoff", function (event) {
    for (let delayNum = 0; delayNum < 16; delayNum++) {
      myOutput.channels[delayNum + 1].sendNoteOff(
        event.note.number + transpose * delayNum,
        {
          time: WebMidi.time + delayNum * echoTime,
        }
      );
    }
  });
});
// Define the function to update the ECHO based on the slider's value.
const updateEcho = function () {
  // Resume the AudioContext in case it was suspended.
  myAudio.resume();

  // Get the current value of the gain slider, convert it to a floating-point number.
  let sliderVal = parseFloat(echoControl.value);

  // Display the current slider value in dBFS (Decibels relative to Full Scale).
  document.getElementById("echoDisplay").innerText = `${sliderVal} `;

  // Convert the dBFS value to linear amplitude and set it as the gain node's value.
  let linAmp = 10 ** (sliderVal / 20);
  echoControlNode.gain.setValueAtTime(linAmp, myAudio.currentTime);
};

// Add an event listener for the 'change' event on the output devices dropdown.
// This allows the script to react when the user selects a different MIDI output device.
dropOuts.addEventListener("change", function () {
  // Change the output device based on the user's selection in the dropdown.
  // The '.channels[1]' specifies that the script should use the first channel of the selected output device.
  // MIDI channels are often used to separate messages for different instruments or sounds.
  myOutput = WebMidi.outputs[dropOuts.value];
});
