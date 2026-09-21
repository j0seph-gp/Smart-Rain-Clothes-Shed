let port;
let reader;

let sensorValue = 0;
let rainStatus = "WAITING";
let shedStatus = "---";
let clothesStatus = "---";
let systemStatus = "---";

const connectButton = document.getElementById("connectButton");

const connectionStatus =
    document.getElementById("connectionStatus");

const sensorDisplay =
    document.getElementById("sensorValue");

const rainDisplay =
    document.getElementById("rainStatus");

const shedDisplay =
    document.getElementById("shedStatus");

const clothesDisplay =
    document.getElementById("clothesStatus");

const systemDisplay =
    document.getElementById("systemStatus");


/* ==========================================
   CONNECT TO ARDUINO
========================================== */

connectButton.addEventListener("click", async () => {

    try {

        // Ask Chrome for a serial port
        port = await navigator.serial.requestPort();

        // Open Arduino serial connection
        await port.open({
            baudRate: 9600
        });

        // Update connection status
        connectionStatus.textContent =
            "🟢 Arduino Connected";

        connectionStatus.classList.remove("disconnected");
        connectionStatus.classList.add("connected");

        connectButton.textContent =
            "🟢 Arduino Connected";

        // Start reading Arduino
        readSerial();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to Arduino.\n\n" +
            "Make sure the Serial Monitor is CLOSED."
        );
    }

});


/* ==========================================
   READ SERIAL DATA
========================================== */

async function readSerial() {

    const decoder = new TextDecoderStream();

    const inputDone = port.readable.pipeTo(decoder.writable);

    reader = decoder.readable.getReader();

    let buffer = "";

    try {

        while (true) {

            const { value, done } =
                await reader.read();

            if (done) {
                break;
            }

            buffer += value;

            let lines = buffer.split("\n");

            buffer = lines.pop();

            for (let line of lines) {

                line = line.trim();

                if (line.length > 0) {

                    processArduinoData(line);

                }

            }

        }

    }

    catch (error) {

        console.error(
            "Serial reading error:",
            error
        );

    }

}


/* ==========================================
   PROCESS ARDUINO DATA
========================================== */

function processArduinoData(data) {

    console.log("Arduino:", data);


    // SENSOR

    if (data.startsWith("SENSOR:")) {

        sensorValue =
            parseInt(
                data.replace("SENSOR:", "")
            );

        sensorDisplay.textContent =
            "Sensor Value: " + sensorValue;
    }


    // RAIN

    else if (data.startsWith("RAIN:")) {

        let value =
            data.replace("RAIN:", "");

        if (value === "YES") {

            rainStatus = "RAIN DETECTED";

            rainDisplay.textContent =
                "🌧️ RAIN DETECTED";

        }

        else {

            rainStatus = "DRY";

            rainDisplay.textContent =
                "☀️ DRY";

        }

    }


    // SHED

    else if (data.startsWith("SHED:")) {

        shedStatus =
            data.replace("SHED:", "");

        shedDisplay.textContent =
            shedStatus;

    }


    // CLOTHES

    else if (data.startsWith("CLOTHES:")) {

        clothesStatus =
            data.replace("CLOTHES:", "");

        clothesDisplay.textContent =
            clothesStatus;

    }


    // SYSTEM

    else if (data.startsWith("SYSTEM:")) {

        systemStatus =
            data.replace("SYSTEM:", "");

        systemDisplay.textContent =
            systemStatus;

    }

}