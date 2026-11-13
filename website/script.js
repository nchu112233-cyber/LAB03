
// =====================================
// 1. KET NOI MQTT BROKER
// =====================================

const broker = "wss://broker.emqx.io:8084/mqtt";

const sensorTopic = "runner/lab3/sensor";
const controlTopic = "runner/lab3/control";

const client = mqtt.connect(broker, {
    clientId: "Runner_Web_" + Math.random().toString(16).slice(2, 10),
    clean: true,
    connectTimeout: 10000,
    reconnectPeriod: 3000
});

// =====================================
// 2. TRANG THAI KET NOI
// =====================================

client.on("connect", function () {

    document.getElementById("connection").innerText =
        "MQTT: CONNECTED";

    document.getElementById("status").innerText =
        "Đã kết nối MQTT Broker!";

    console.log("MQTT Connected!");

    client.subscribe(sensorTopic, function (err) {
        if (err) {
            console.log("Subscribe error:", err);
        } else {
            console.log("Subscribed:", sensorTopic);
        }
    });
});
// NHAN DU LIEU TU MQTT
client.on("message", function (topic, message) {

    if (topic === sensorTopic) {

        try {
            const data = JSON.parse(message.toString());

            console.log("Du lieu nhan duoc:", data);

            // Cap nhat nhiet do
            document.getElementById("temperature").innerText =
                data.temperature.toFixed(2) + " °C";

            // Cap nhat ap suat
            document.getElementById("pressure").innerText =
                data.pressure.toFixed(2) + " hPa";

            // Cap nhat do cao
            document.getElementById("altitude").innerText =
                data.altitude.toFixed(2) + " m";

        } catch (error) {
            console.log("Loi doc du lieu:", error);
        }
    }
});
client.on("error", function (error) {
    console.log("MQTT Error:", error);
});

client.on("close", function () {
    document.getElementById("connection").innerText =
        "MQTT: DISCONNECTED";
});

// =====================================
// 3. TAO BIEU DO NHIET DO
// =====================================

const tempChart = new Chart(
    document.getElementById("tempChart"),
    {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Temperature (°C)",
                data: [],
                borderColor: "red",
                backgroundColor: "rgba(255,0,0,0.1)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }
);

// =====================================
// 4. TAO BIEU DO DO CAO
// =====================================

const altChart = new Chart(
    document.getElementById("altChart"),
    {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Altitude (m)",
                data: [],
                borderColor: "blue",
                backgroundColor: "rgba(0,0,255,0.1)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }
);

// =====================================
// 5. NHAN DU LIEU TU ESP32
// =====================================

client.on("message", function (topic, message) {

    if (topic !== sensorTopic) return;

    try {

        const data = JSON.parse(message.toString());

        // Kiem tra du lieu
        if (
            typeof data.temperature !== "number" ||
            typeof data.pressure !== "number" ||
            typeof data.altitude !== "number"
        ) {
            console.log("Invalid sensor data");
            return;
        }

        // Cap nhat cac the HTML
        document.getElementById("temperature").innerText =
            data.temperature.toFixed(2) + " °C";

        document.getElementById("pressure").innerText =
            data.pressure.toFixed(2) + " hPa";

        document.getElementById("altitude").innerText =
            data.altitude.toFixed(2) + " m";

        const time = new Date().toLocaleTimeString();

        // Cap nhat bieu do nhiet do
        tempChart.data.labels.push(time);
        tempChart.data.datasets[0].data.push(data.temperature);

        // Cap nhat bieu do do cao
        altChart.data.labels.push(time);
        altChart.data.datasets[0].data.push(data.altitude);

        // Giu toi da 30 diem du lieu
        if (tempChart.data.labels.length > 30) {
            tempChart.data.labels.shift();
            tempChart.data.datasets[0].data.shift();
        }

        if (altChart.data.labels.length > 30) {
            altChart.data.labels.shift();
            altChart.data.datasets[0].data.shift();
        }

        tempChart.update();
        altChart.update();

        document.getElementById("status").innerText =
            "Đã cập nhật dữ liệu cảm biến!";

        console.log("Sensor data:", data);

    } catch (error) {

        console.log("JSON Error:", error);

    }
});

// =====================================
// 6. GUI LENH DIEU KHIEN
// =====================================

function controlDevice(device, state) {

    if (!client.connected) {
        alert("MQTT chưa kết nối!");
        return;
    }

    const command = {
        mode: "manual",
        device: device,
        state: state
    };

    client.publish(
        controlTopic,
        JSON.stringify(command)
    );

    console.log("Sent command:", command);
}

// =====================================
// 7. CHUYEN SANG CHE DO AUTO
// =====================================

function setAuto() {

    if (!client.connected) {
        alert("MQTT chưa kết nối!");
        return;
    }

    const command = {
        mode: "auto"
    };

    client.publish(
        controlTopic,
        JSON.stringify(command)
    );

    console.log("AUTO MODE");
}


// Điều khiển LED và Buzzer
function controlDevice(device, state) {
    if (!client || !client.connected) {
        alert("MQTT chưa kết nối!");
        return;
    }

    const command = {
        mode: "manual",
        device: device,
        state: state
    };

    client.publish(controlTopic, JSON.stringify(command));

    console.log("Đã gửi lệnh:", command);
}

// Chuyển sang chế độ tự động
function setAuto() {
    if (!client || !client.connected) {
        alert("MQTT chưa kết nối!");
        return;
    }

    const command = {
        mode: "auto"
    };

    client.publish(controlTopic, JSON.stringify(command));

    console.log("Đã chuyển sang AUTO MODE");
}