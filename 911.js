const API_BASE = "https://data.montgomerycountymd.gov/resource/ms8i-8ux3.json";
const API_LIMIT = 5000;

let map;
let openInfoWindow;
let markersArray = [];
let attributesChecked = {
    dui: null,
    accident: null,
    gender: null,
    fatal: null,
    race: null,
    violation_type: null
};

function resetAttributes() {
    document.querySelectorAll('#choices input[type="radio"]').forEach(r => r.checked = false);
    for (const attr in attributesChecked) {
        attributesChecked[attr] = null;
    }
}

function setOnMap() {
    if (openInfoWindow) openInfoWindow.close();
    markersArray.forEach(marker => {
        let visible = true;
        for (const attr in attributesChecked) {
            if (attributesChecked[attr] != null && attributesChecked[attr] !== marker[attr]) {
                visible = false;
                break;
            }
        }
        marker.setMap(visible ? map : null);
    });
}

function clearMarkers() {
    markersArray.forEach(m => m.setMap(null));
    markersArray = [];
    if (openInfoWindow) {
        openInfoWindow.close();
        openInfoWindow = null;
    }
}

function formatDateParam(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function loadDate(date) {
    clearMarkers();
    resetAttributes();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    document.getElementById("updated").textContent = `Showing data for ${month}/${day}`;
    const url = `${API_BASE}?date_of_stop=${formatDateParam(date)}T00:00:00.000&$limit=${API_LIMIT}`;
    getTrafficData(url);
}

function initListeners() {
    const filters = {
        accidentYes:  () => attributesChecked.accident = true,
        accidentNo:   () => attributesChecked.accident = false,
        duiYes:       () => attributesChecked.dui = true,
        duiNo:        () => attributesChecked.dui = false,
        genderMale:   () => attributesChecked.gender = "M",
        genderFemale: () => attributesChecked.gender = "F",
        fatalYes:     () => attributesChecked.fatal = true,
        fatalNo:      () => attributesChecked.fatal = false,
        raceWhite:    () => attributesChecked.race = "WHITE",
        raceBlack:    () => attributesChecked.race = "BLACK",
        raceAsian:    () => attributesChecked.race = "ASIAN",
        raceOther:    () => attributesChecked.race = "OTHER",
        vioCitation:  () => attributesChecked.violation_type = "Citation",
        vioWarning:   () => attributesChecked.violation_type = "Warning",
    };

    for (const [id, setter] of Object.entries(filters)) {
        document.getElementById(id).addEventListener("click", () => {
            setter();
            setOnMap();
        });
    }

    document.getElementById("showAll").addEventListener("click", () => {
        resetAttributes();
        setOnMap();
    });

    const picker = document.getElementById("datePicker");
    const prevBtn = document.getElementById("prevDay");
    const nextBtn = document.getElementById("nextDay");
    const defaultDate = getTargetDate();
    const maxDate = formatDateParam(defaultDate);
    picker.value = maxDate;
    picker.max = maxDate;

    function navigateToDate(dateStr) {
        picker.value = dateStr;
        nextBtn.disabled = dateStr >= maxDate;
        const parts = dateStr.split("-");
        loadDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    }

    function shiftDay(offset) {
        const parts = picker.value.split("-");
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + offset);
        const newVal = formatDateParam(d);
        if (newVal > maxDate) return;
        navigateToDate(newVal);
    }

    picker.addEventListener("change", () => navigateToDate(picker.value));
    prevBtn.addEventListener("click", () => shiftDay(-1));
    nextBtn.addEventListener("click", () => shiftDay(1));
    nextBtn.disabled = true;

    loadDate(defaultDate);
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 11,
        center: { lat: 39.1547, lng: -77.2405 }
    });
    initListeners();
}

function getTargetDate() {
    // Use Intl to get the current Eastern Time hour
    const now = new Date();
    const etHour = parseInt(
        new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }).format(now),
        10
    );
    // Data from yesterday only available after 10 AM ET
    const daysBack = etHour >= 10 ? 1 : 2;
    const target = new Date(now);
    target.setDate(target.getDate() - daysBack);
    return target;
}


async function getTrafficData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();

        data.forEach(dp => {
            const lat = parseFloat(dp.latitude);
            const lng = parseFloat(dp.longitude);
            if (isNaN(lat) || isNaN(lng)) return;

            const desc = dp.description
                ? dp.description[0] + dp.description.slice(1).toLowerCase()
                : "Unknown violation";

            const city = dp.driver_city || "Unknown";
            const state = dp.driver_state || "";
            const color = dp.color || "";
            const make = dp.make || "";
            const model = dp.model || "";

            const content = `<p><strong>${desc}</strong><br><br>
                Hometown: ${city}, ${state}<br><br>
                Vehicle: ${color} ${make} ${model}</p>`;

            const infowindow = new google.maps.InfoWindow({ content });

            const marker = new google.maps.Marker({
                position: { lat, lng },
                info: content
            });

            marker.accident = dp.contributed_to_accident === "True";
            marker.gender = dp.gender;
            marker.fatal = dp.fatal === "Yes";
            marker.race = dp.race;
            marker.violation_type = dp.violation_type;
            marker.dui = dp.alcohol === "Yes";

            markersArray.push(marker);
            marker.setMap(map);

            marker.addListener("click", () => {
                infowindow.setContent(marker.info);
                infowindow.open(map, marker);
                if (openInfoWindow) openInfoWindow.close();
                openInfoWindow = infowindow;
            });
        });
    } catch (err) {
        console.error("Failed to load traffic data:", err);
        document.getElementById("updated").textContent = "Error loading data";
    }
}
