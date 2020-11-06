let map, src = "https://data.montgomerycountymd.gov/resource/ms8i-8ux3.json?date_of_stop=";
let openInfoWindow;
let markersArray = [];
let attributesChecked = {
    // bool
    "dui": null,
    "accident": null,
    // M, F
    "gender": null,
    // bool
    "fatal": null,
    // WHITE", "ASIAN", "BLACK", "OTHER", "None"
    // Yes, why not feed the racists Yiyi
    "race": null,
    // Citation, Warning
    "violation_type": null
};

function resetAttributes() {
    document.getElementById("accidentNo").checked = false;
    document.getElementById("accidentYes").checked = false;
    document.getElementById("duiNo").checked = false;
    document.getElementById("duiYes").checked = false;
    document.getElementById("genderMale").checked = false;
    document.getElementById("genderFemale").checked = false;
    document.getElementById("fatalYes").checked = false;
    document.getElementById("fatalNo").checked = false;
    document.getElementById("raceWhite").checked = false;
    document.getElementById("raceBlack").checked = false;
    document.getElementById("raceAsian").checked = false;
    document.getElementById("raceOther").checked = false;
    document.getElementById("vioWarning").checked = false;
    document.getElementById("vioCitation").checked = false;

    // Reset all attributes
    for (let attr in attributesChecked) {
        attributesChecked[attr] = null;
    }

}


function setOnMap() {
    markersArray.forEach(marker => {
        let check = true;
        for (let attr in attributesChecked) {
            if (attributesChecked[attr] != null && attributesChecked[attr] != marker[attr]) {
                check = false;
            }
        }
        if (check) {
            marker.setMap(map);
        } else {
            marker.setMap(null);
        }
    });
}

function initListeners() {
    document.getElementById("accidentYes").addEventListener("click", function () {
        attributesChecked.accident = true;
        setOnMap();
    });
    document.getElementById("accidentNo").addEventListener("click", function () {
        attributesChecked.accident = false;
        setOnMap();
    });
    document.getElementById("duiYes").addEventListener("click", function () {
        attributesChecked.dui = true;
        setOnMap();
    });
    document.getElementById("duiNo").addEventListener("click", function () {
        attributesChecked.dui = false;
        setOnMap();
    });
    document.getElementById("genderMale").addEventListener("click", function () {
        attributesChecked.gender = 'M';
        setOnMap();
    });
    document.getElementById("genderFemale").addEventListener("click", function () {
        attributesChecked.gender = 'F';
        setOnMap();
    });
    document.getElementById("fatalYes").addEventListener("click", function () {
        attributesChecked.fatal = true;
        setOnMap();
    });
    document.getElementById("fatalNo").addEventListener("click", function () {
        attributesChecked.fatal = false;
        setOnMap();
    });
    document.getElementById("raceWhite").addEventListener("click", function () {
        attributesChecked.race = "WHITE";
        setOnMap();
    });
    document.getElementById("raceAsian").addEventListener("click", function () {
        attributesChecked.race = "ASIAN";
        setOnMap();
    });
    document.getElementById("raceBlack").addEventListener("click", function () {
        attributesChecked.race = "BLACK";
        setOnMap();
    });
    document.getElementById("raceOther").addEventListener("click", function () {
        attributesChecked.race = "OTHER";
        setOnMap();
    });
    document.getElementById("vioCitation").addEventListener("click", function () {
        attributesChecked.violation_type = "Citation";
        setOnMap();
    });
    document.getElementById("vioWarning").addEventListener("click", function () {
        attributesChecked.violation_type = "Warning";
        setOnMap();
    });
    document.getElementById("showAll").addEventListener("click", function () {
        resetAttributes();
        setOnMap();
    });
    grabData();
}

function initMap() {
    let myLatlng = new google.maps.LatLng(39.1547, -77.2405);
    let mapOptions = {
        zoom: 11,
        center: myLatlng
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    initListeners();
}

function getEasternTime() {
    return moment().tz("America/New_York");
}

function grabData() {
    let date = getEasternTime(); // CAUTION: returns moment.js object, not native Date()
    // Data from yesterday only available if it's after 10 AM
    if (date.hours() >= 10) {
        date.subtract(1, "day");
    } else {
        date.subtract(2, "day");
    }
    document.getElementById("updated").innerHTML = "Showing data for " + (date.month() + 1) + "/" + date.date();
    src += date.format("YYYY") + "-" + date.format("MM") + "-" + date.format("DD") + "T00:00:00.000";
    getTrafficData(src);
}

function getTrafficData(src) {
    $.getJSON(src, function (data) {
        data.forEach(dp => {
            let description = "<p>"
                + dp.description
                + "</br></br> This driver is from: "
                + dp.driver_city + " "
                + dp.driver_state
                + "</br></br>car: "
                + dp.color + " " + dp.make + " " + dp.model
                + "</p> ";
            let infowindow = new google.maps.InfoWindow({
                content: description
            });
            let lat = dp.latitude;
            let long = dp.longitude;
            if (lat && long) {
                let myLatln = new google.maps.LatLng(lat, long);
                let marker = new google.maps.Marker({
                    position: myLatln,
                    title: "",
                    info: description
                });
                marker.accident = dp.contributed_to_accident == "True";
                marker.gender = dp.gender;
                marker.fatal = dp.fatal == "Yes";
                marker.race = dp.race;
                marker.violation_type = dp.violation_type;
                marker.dui = dp.alcohol == "Yes";

                markersArray.push(marker);

                marker.setMap(map);
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(this.info);
                    infowindow.open(map, this);
                    if(openInfoWindow) openInfoWindow.close();
                    openInfoWindow = infowindow;
                });
            }
        });
    });
}
