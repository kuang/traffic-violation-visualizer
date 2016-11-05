var map, src = "https://data.montgomerycountymd.gov/resource/ms8i-8ux3.json?date_of_stop=";

var markersArray = [];
var attributesChecked = {
    "accident": {
        "Yes": false,
        "No": false
    },
    "gender": {
        "M": false,
        "F": false
    },
    "fatal": {
        "Yes": false,
        "No": false
    },
    "race": { // Yes, why not feed the racists Yiyi
        "WHITE": false,
        "ASIAN": false,
        "BLACK": false,
        "OTHER": false
    },
    "violation_type": {
        "Citation": false,
        "Warning": false
    }
};

function resetAttribute(attribute) {
    if (attribute != "all") {
        // Reset selected attribute
        for (var setting in attributesChecked[attribute]) {
            if (attributesChecked[attribute].hasOwnProperty(setting)) {
                attributesChecked[attribute][setting] = false;
            }
        }
    } else {
        // Reset all attributes
        for (var attr in attributesChecked) {
            if (attributesChecked.hasOwnProperty(attr)) {
                for (var setting in attributesChecked[attr]) {
                    if (attributesChecked[attr].hasOwnProperty(setting)) {
                        attributesChecked[attr][setting] = false;
                    }
                }
            }
        }
    }
}


function setOnMap() {
    for (var i = 0; i < markersArray.length; i++) {
        var check = true;
        var tempMarker = markersArray[i];
        for (var attr in attributesChecked) {
            if (attributesChecked.hasOwnProperty(attr)) {
                var attributeChoices = attributesChecked[attr];
                for (var setting in attributeChoices) {
                    if (attributeChoices.hasOwnProperty(setting)) {
                        if (attributeChoices[setting] && tempMarker[attr] != setting) {
                            check = false;
                        }
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
        attributesChecked.accident.Yes = true;
        setOnMap();
    });
    document.getElementById("accidentNo").addEventListener("click", function() {
        resetAttribute("accident");
        attributesChecked.accident.No = true;
        setOnMap();
    });
    document.getElementById("genderMale").addEventListener("click", function() {
        resetAttribute("gender");
        attributesChecked.gender.M = true;
        setOnMap();
    });
    document.getElementById("genderFemale").addEventListener("click", function() {
        resetAttribute("gender");
        attributesChecked.gender.F = true;
        setOnMap();
    });
    document.getElementById("fatalYes").addEventListener("click", function() {
        resetAttribute("fatal");
        attributesChecked.fatal.Yes = true;
        setOnMap();
    });
    document.getElementById("fatalNo").addEventListener("click", function() {
        resetAttribute("fatal");
        attributesChecked.fatal.No = true;
        setOnMap();
    });
    document.getElementById("raceWhite").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked.race.WHITE = true;
        setOnMap();
    });
    document.getElementById("raceAsian").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked.race.ASIAN = true;
        setOnMap();
    });
    document.getElementById("raceBlack").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked.race.BLACK = true;
        setOnMap();
    });
    document.getElementById("raceOther").addEventListener("click", function() {
        resetAttribute("race");
        attributesChecked.race.OTHER = true;
        setOnMap();
    });
    document.getElementById("vioCitation").addEventListener("click", function() {
        resetAttribute("violation_type");
        attributesChecked.violation_type.Citation = true;
        setOnMap();
    });
    document.getElementById("vioWarning").addEventListener("click", function() {
        resetAttribute("violation_type");
        attributesChecked.violation_type.Warning = true;
        setOnMap();
    });
    document.getElementById("showAll").addEventListener("click", function() {
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
