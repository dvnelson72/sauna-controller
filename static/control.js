
var digitSegments = [
    [1, 2, 3, 4, 5, 6],
    [2, 3],
    [1, 2, 7, 5, 4],
    [1, 2, 7, 3, 4],
    [6, 7, 2, 3],
    [1, 6, 7, 3, 4],
    [1, 6, 5, 4, 3, 7],
    [1, 2, 3],
    [1, 2, 3, 4, 5, 6, 7],
    [1, 2, 7, 3, 6]
]
var baseUrl = window.location.origin;
var params = new URLSearchParams(window.location.search);
var key = params.get("key") || "nokey";

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

var toggleOnOff = function() {
    fetch(baseUrl + '/onoff-toggle?key='+key)
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var targetUp = function() {
    fetch(baseUrl + '/target-inc?key='+key)
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var targetDown = function() {
    fetch(baseUrl + '/target-dec?key='+key)
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var timeUp = function() {
    fetch(baseUrl + '/time-inc?key='+key)
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var timeDown = function() {
    fetch(baseUrl + '/time-dec?key='+key)
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}

document.addEventListener('DOMContentLoaded', function () {
    var updateFrequency = 2000;
    var _digits = document.querySelectorAll('.digit');

    var fetchStatus = function (callback) {
        fetch(baseUrl + '/status?key='+key)
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
    var doFetchStatus = function () {
        fetchStatus((error, status) => {
            if (error) {
                console.log(error)
                setCurrentTemp(NaN)
                setSetTemp(NaN)
                setCurrentTime(NaN)
                setHeaterStatus(false)
                setOnOffStatus(false)
            } else {
                setCurrentTemp(Math.round(status.temperature))
                setSetTemp(Math.round(status.target))
                setCurrentTime(Math.round(status.time))
                setHeaterStatus(status.heater)
                setOnOffStatus(status.power)
            }
            console.log(status);
        });
    }
    setInterval(doFetchStatus, updateFrequency)

    refreshData = () => {
        doFetchStatus();
    }
    refreshData();
    

    var setCurrentTemp = function (temp) {
        setNumberPanel(6, temp);
    };

    var setSetTemp = function (temp) {
        setNumberPanel(0, temp);
    };

    var setCurrentTime = function (time) {
        setNumberPanel(3, time);
    };
    
    setNumberPanel = function(indexBase, value) {
        setNumber(_digits[indexBase], Math.floor(value / 100), value >= 100);
        setNumber(_digits[indexBase+1], Math.floor((value % 100) / 10), value >= 10);
        setNumber(_digits[indexBase+2], value % 10, true);
    }
    
    var setHeaterStatus = function(status) {
        var heaterStatus = document.getElementById("heaterStatus");
        if (heaterStatus) {
            var newsrc = heaterStatus.src
            if (status) {
                newsrc = "/static/heater-on.png";
            } else {
                newsrc = "/static/heater-off.png";
            }
            if (heaterStatus.src!=newsrc) {
                heaterStatus.src=newsrc
            }
        }
    }
    
    var setOnOffStatus = function(status) {
        var onoffStatus = document.getElementById("onoffStatus");
        if (onoffStatus) {
            var newsrc = onoffStatus.src
            if (status) {
                newsrc = "/static/on.png";
            } else {
                newsrc = "/static/off.png";
            }
            if (onoffStatus.src!=newsrc) {
                onoffStatus.src=newsrc
            }
        }
    }
});



var setNumber = function (digit, number, on) {
    var segments = digit.querySelectorAll('.segment');
    var current = parseInt(digit.getAttribute('data-value'));

    // only switch if number has changed or wasn't set
    if (!isNaN(current) && current != number) {
        // unset previous number
        digitSegments[current].forEach(function (digitSegment, index) {
            setTimeout(function () {
                segments[digitSegment - 1].classList.remove('on');
                segments[digitSegment - 1].classList.remove('off');
            }, index * 1)
        });
    }

    if (isNaN(current) || current != number) {
        // set new number after
        setTimeout(function () {
            digitSegments[number].forEach(function (digitSegment, index) {
                setTimeout(function () {
                    if (on) {
                        segments[digitSegment - 1].classList.add('on');
                    } else {
                        segments[digitSegment - 1].classList.add('off');
                    }
                }, index * 1)
            });
        }, 50);
        digit.setAttribute('data-value', number);
    }
}