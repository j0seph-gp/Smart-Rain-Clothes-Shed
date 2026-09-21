// ============================================
// SMART RAIN CLOTHES SHED
// Arduino UNO + Web Serial Dashboard
// ============================================

let port = null;
let reader = null;

let sensorValue = 0;
let rainStatus = "WAITING";
let shedStatus = "---";
let clothesStatus = "---";
let systemStatus = "---";

// ============================================
// HTML ELEMENTS
// ============================================

const connectButton =
    document.getElementById("connectButton");

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


// ============================================
// CHECK BROWSER SUPPORT
// ============================================

if (!("serial" in navigator)) {

    alert(
        "Web Serial is not supported in this browser.\n\n" +
        "Please use the latest Google Chrome or Microsoft Edge."
    );

    connectButton.disabled = true;

}


// ============================================
// CONNECT ARDUINO
// ============================================

connectButton.addEventListener("click", async () => {

    try {

        // Ask Chrome to select a serial device
        port = await navigator.serial.requestPort();

        // Open serial connection
        await port.open({
            baudRate: 9600
        });

        // Update connection UI
        connectionStatus.textContent =
            "🟢 Arduino Connected";

        connectionStatus.classList.remove(
            "disconnected"
        );

        connectionStatus.classList.add(
            "connected"
        );

        connectButton.textContent =
            "🟢 Arduino Connected";

        connectButton.disabled = true;

        // Start reading Arduino
        readSerial();

    }

    catch (error) {

        console.error(
            "Arduino connection error:",
            error
        );

        alert(
            "Could not connect to Arduino.\n\n" +
            "Make sure:\n" +
            "1. Arduino is connected by USB\n" +
            "2. Serial Monitor is CLOSED\n" +
            "3. You select the correct COM port"
        );

    }

});


// ============================================
// READ SERIAL DATA
// ============================================

async function readSerial() {

    if (!port || !port.readable) {

        return;

    }

    const decoder =
        new TextDecoderStream();

    const inputDone =
        port.readable.pipeTo(
            decoder.writable
        );

    reader =
        decoder.readable.getReader();

    let buffer = "";

    try {

        while (true) {

            const { value, done } =
                await reader.read();

            if (done) {

                break;

            }

            if (value) {

                buffer += value;

                // Split Arduino messages by newline
                const lines =
                    buffer.split("\n");

                // Keep incomplete line
                buffer =
                    lines.pop();

                // Process completed lines
                for (let line of lines) {

                    line =
                        line.trim();

                    if (line.length > 0) {

                        processArduinoData(line);

                    }

                }

            }

        }

    }

    catch (error) {

        console.error(
            "Serial reading error:",
            error
        );

        showDisconnected();

    }

}


// ============================================
// PROCESS ARDUINO DATA
// ============================================

function processArduinoData(data) {

    console.log(
        "Arduino:",
        data
    );


    // ========================================
    // SENSOR VALUE
    // ========================================

    if (data.startsWith("SENSOR:")) {

        sensorValue =
            parseInt(
                data.substring(7)
            );

        if (!isNaN(sensorValue)) {

            sensorDisplay.textContent =
                "Sensor Value: " +
                sensorValue;

        }

    }


    // ========================================
    // RAIN STATUS
    // ========================================

    else if (data.startsWith("RAIN:")) {

        const value =
            data.substring(5);


        if (value === "YES") {

            rainStatus =
                "RAIN DETECTED";

            rainDisplay.textContent =
                "🌧️ RAIN DETECTED";

            rainDisplay.style.color =
                "#f87171";

        }

        else {

            rainStatus =
                "DRY";

            rainDisplay.textContent =
                "☀️ DRY";

            rainDisplay.style.color =
                "#4ade80";

        }

    }


    // ========================================
    // SHED STATUS
    // ========================================

    else if (data.startsWith("SHED:")) {

        shedStatus =
            data.substring(5);

        shedDisplay.textContent =
            shedStatus;


        if (shedStatus === "CLOSED") {

            shedDisplay.style.color =
                "#60a5fa";

        }

        else {

            shedDisplay.style.color =
                "#4ade80";

        }

    }


    // ========================================
    // CLOTHES STATUS
    // ========================================

    else if (data.startsWith("CLOTHES:")) {

        clothesStatus =
            data.substring(8);

        clothesDisplay.textContent =
            clothesStatus;


        if (clothesStatus === "INSIDE") {

            clothesDisplay.style.color =
                "#60a5fa";

        }

        else {

            clothesDisplay.style.color =
                "#4ade80";

        }

    }


    // ========================================
    // SYSTEM STATUS
    // ========================================

    else if (data.startsWith("SYSTEM:")) {

        systemStatus =
            data.substring(7);

        systemDisplay.textContent =
            formatSystemStatus(
                systemStatus
            );

    }

}


// ============================================
// FORMAT SYSTEM STATUS
// ============================================

function formatSystemStatus(status) {

    switch (status) {

        case "NORMAL":
            return "🟢 NORMAL";

        case "CLOSING_SHED":
            return "🔵 CLOSING SHED";

        case "MOVING_CLOTHES_INSIDE":
            return "🔵 MOVING CLOTHES INSIDE";

        case "RAIN_PROTECTION":
            return "🌧️ RAIN PROTECTION";

        case "OPENING_SHED":
            return "🔵 OPENING SHED";

        case "MOVING_CLOTHES_OUTSIDE":
            return "🔵 MOVING CLOTHES OUTSIDE";

        default:
            return status;

    }

}


// ============================================
// DISCONNECTED STATE
// ============================================

function showDisconnected() {

    connectionStatus.textContent =
        "🔴 Arduino Disconnected";

    connectionStatus.classList.remove(
        "connected"
    );

    connectionStatus.classList.add(
        "disconnected"
    );

    connectButton.textContent =
        "🔌 Connect Arduino";

    connectButton.disabled = false;

}
