
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
var baseUrl = "http://192.168.15.183";

var toggleOnOff = function() {
    fetch(baseUrl + '/onoff-toggle')
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var refreshData = function() {
    fetch(baseUrl + '/onoff-toggle')
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var targetUp = function() {
    fetch(baseUrl + '/target-inc')
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var targetDown = function() {
    fetch(baseUrl + '/target-dec')
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var timeUp = function() {
    fetch(baseUrl + '/time-inc')
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}
var timeDown = function() {
    fetch(baseUrl + '/time-dec')
        .then(() => {
            if (refreshData) {
                refreshData();
            }
        });
}

document.addEventListener('DOMContentLoaded', function () {
    var updateFrequency = 500;
    var _digits = document.querySelectorAll('.digit');

    var fetchCurrentTemp = function (callback) {
        fetch(baseUrl + '/current-temp')
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
    var doFetchCurrentTemp = function () {
        fetchCurrentTemp((error, temp) => {
            if (error) {
                console.log(error)
                setCurrentTemp(NaN)
            } else {
                setCurrentTemp(Math.round(temp))
            }
        });
    }
    setInterval(doFetchCurrentTemp, updateFrequency)
    
    var fetchSetTemp = function (callback) {
        fetch(baseUrl + '/target-temp')
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
    var doFetchSetTemp = function () {
        fetchSetTemp((error, temp) => {
            if (error) {
                console.log(error)
                setSetTemp(NaN)
            } else {
                setSetTemp(Math.round(temp))
            }
        });
    }
    setInterval(doFetchSetTemp, updateFrequency)
    
    var fetchCurrentTime = function (callback) {
        fetch(baseUrl + '/current-time')
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
    var doFetchCurrentTime = function () {
        fetchCurrentTime((error, temp) => {
            if (error) {
                console.log(error)
                setCurrentTime(NaN)
            } else {
                setCurrentTime(Math.round(temp))
            }
        });
    }
    setInterval(doFetchCurrentTime, updateFrequency)
    
    var fetchHeaterStatus = function (callback) {
        fetch(baseUrl + '/heater-status')
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
    var doFetchHeaterStatus = function () {
        fetchHeaterStatus((error, status) => {
            if (error) {
                console.log(error)
                setHeaterStatus(false)
            } else {
                setHeaterStatus(status)
            }
        });
    }
    setInterval(doFetchHeaterStatus, updateFrequency)
    
    var fetchOnoffStatus = function (callback) {
        fetch(baseUrl + '/onoff-status')
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
    var doFetchOnoffStatus = function () {
        fetchOnoffStatus((error, status) => {
            if (error) {
                console.log(error)
                setOnOffStatus(false)
            } else {
                setOnOffStatus(status)
            }
        });
    }
    setInterval(doFetchOnoffStatus, updateFrequency)

    refreshData = () => {
        doFetchCurrentTemp();
        doFetchSetTemp();
        doFetchHeaterStatus();
        doFetchOnoffStatus();
        doFetchCurrentTime();
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
            if (status) {
                heaterStatus.src = "/static/heater-on.png";
            } else {
                heaterStatus.src = "/static/heater-off.png";
            }
        }
    }
    
    var setOnOffStatus = function(status) {
        var onoffStatus = document.getElementById("onoffStatus");
        if (onoffStatus) {
            if (status) {
                onoffStatus.src = "/static/on.png";
            } else {
                onoffStatus.src = "/static/off.png";
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