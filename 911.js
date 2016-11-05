var map, src = "https://data.montgomerycountymd.gov/resource/ms8i-8ux3.json?date_of_stop=";

var markersArray = [];
var attributesChecked = [
    // 0 = false, 1 = true
    // Dear God Yiyi, why
    ["accident", [
        [false, "Yes"],
        [false, "No"]
    ]],
    ["gender", [
        [false, "M"],
        [false, "F"]
    ]],
    ["fatal", [
        [false, "Yes"],
        [false, "No"]
    ]],
    ["race", [
        [false, "WHITE"],
        [false, "ASIAN"],
        [false, "BLACK"],
        [false, "OTHER"]
    ]],
    ["violation_type", [
        [false, "Citation"],
        [false, "Warning"]
    ]]
];

function resetAttribute(attribute) {
    var attributeToReset;
    switch (attribute) {
        case "accident":
            attributeToReset = 0;
            break;
        case "gender":
            attributeToReset = 1;
            break;
        case "fatal":
            attributeToReset = 2;
            break;
        case "race":
            attributeToReset = 3;
            break;
        case "violation_type":
            attributeToReset = 4;
            break;
        case "all":
            attributeToReset = -1;
            break;
    }
    if (attributeToReset != -1) {
        for (var i = 0; i < attributesChecked[attributeToReset][1].length; i++) {
            attributesChecked[attributeToReset][1][i][0] = false;
        }
    } else {
        for (var j = 0; j < attributesChecked.length; j++) {
            for (var i = 0; i < attributesChecked[j][1].length; i++) {
                attributesChecked[j][1][i][0] = false;
            }
        }
    }
}


function setOnMap() {
    for (var i = 0; i < markersArray.length; i++) {
        var check = true;
        var tempMarker = markersArray[i];
        for (var j = 0; j < attributesChecked.length; j++) { // Iterate through all the attributes
            var attributeChoices = attributesChecked[j][1];
            for (var k = 0; k < attributeChoices.length; k++) {
                var tempAttribute = attributeChoices[k];

                if (tempAttribute[0] == true) {
                    if (tempMarker[attributesChecked[j][0]] != tempAttribute[1]) {
                        check = false;
                    }
                }
            }
        }
        if (check) {
            markersArray[i].setMap(map);
        } else {
            markersArray[i].setMap(null);
        }
    }
}

function initListeners() {
    document.getElementById("accidentYes").addEventListener("click", function() {
        resetAttribute("accident");
        attributesChecked[0][1][0][0] = true;
        setOnMap();
    });
    document.getElementById("accidentNo").addEventListener("click", function() {
        resetAttribute("accident");
        attributesChecked[0][1][1][0] = true;
        setOnMap();
    });
    document.getElementById("genderMale").addEventListener("click", function() {
        resetAttribute("gender");
        attributesChecked[1][1][0][0] = true;
        setOnMap();
    });
    document.getElementById("genderFemale").addEventListener("click", function() {
        resetAttribute("gender");
        attributesChecked[1][1][1][0] = true;
        setOnMap();
    });
    document.getElementById("fatalYes").addEventListener("click", function() {
        resetAttribute("fatal");
        attributesChecked[2][1][0][0] = true;
        setOnMap();
    });
    document.getElementById("fatalNo").addEventListener("click", function() {
        resetAttribute("fatal");
        attributesChecked[2][1][1][0] = true;
        setOnMap();
    });
    document.getElementById("raceWhite").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked[3][1][0][0] = true;
        setOnMap();
    });
    document.getElementById("raceAsian").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked[3][1][1][0] = true;
        setOnMap();
    });
    document.getElementById("raceBlack").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked[3][1][2][0] = true;
        setOnMap();
    });
    document.getElementById("raceOther").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked[3][1][3][0] = true;
        setOnMap();
    });
    document.getElementById("vioCitation").addEventListener("click", function() {
        resetAttribute("violation_type");
        attributesChecked[4][1][0][0] = true;
        setOnMap();
    });
    document.getElementById("vioWarning").addEventListener("click", function() {
        resetAttribute("violation_type");
        attributesChecked[4][1][1][0] = true;
        setOnMap();
    });
    document.getElementById("showall").addEventListener("click", function() {
        document.getElementById("accidentNo").checked = false;
        document.getElementById("accidentYes").checked = false;
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

        resetAttribute("all");
        setOnMap();
    });
    grabData();
}

function initMap() {
    var myLatlng = new google.maps.LatLng(39.1547, -77.2405);
    var mapOptions = {
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
    var date = getEasternTime(); // CAUTION: returns moment.js object, not native Date()
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
    $.getJSON(src, function(data) {
        for (var key = 0; key < data.length; key++) {
            var description = "<p>" + data[key].description + "</p>";
            var infowindow = new google.maps.InfoWindow({
                content: description
            });
            var lat = data[key].latitude;
            var long = data[key].longitude;
            if (lat && long) {
                var myLatln = new google.maps.LatLng(lat, long);
                var marker = new google.maps.Marker({
                    position: myLatln,
                    title: "",
                    info: description
                });
                marker.accident = data[key].contributed_to_accident;
                marker.gender = data[key].gender;
                marker.fatal = data[key].fatal;
                marker.race = data[key].race;
                marker.violation_type = data[key].violation_type;

                markersArray.push(marker);

                marker.setMap(map);
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(this.info);
                    infowindow.open(map, this);
                });
            }
        }
    });
}
