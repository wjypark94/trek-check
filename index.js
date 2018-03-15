const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v2/venues/explore?&client_id=FPRD2S2RFIB4QLBNBBHNAMLYOUF2AZSZ21ZK53QYASWCRJ1Z&client_secret=FEFA44EG0YDZ0XKA1UWX5ZWLZJLE30E2GYRLGB44PKE5KZ0E&v=20170915"
const WEATHER_SEARCH_URL = "https://api.openweathermap.org/data/2.5/weather?id=524901&APPID=a2d9429fad39b9f998a23d74c41056cc"
var hikingPlacesArray = [];

//press on submit button and scroll to results
function scrollPageTo(myTarget, topPadding) {
    if (topPadding == undefined) {
        topPadding = 0;
    }
    var moveTo = $(myTarget).offset().top - topPadding;
    $('html, body').stop().animate({
        scrollTop: moveTo
    }, 200);
}

//get data from openWeather API
function getDataFromWeatherApi(){
    let city = $('.search-query').val();
    $.ajax(WEATHER_SEARCH_URL, {
        data: {
            units: 'imperial',
            q: city
        },
        dataType: 'jsonp',
        type: 'GET',
        success: function (data) {
           let weatherResults = displayWeather(data);
           $('#weather-display').html(weatherResults);
           scrollPageTo('#weather-display', 15)
        }
    });
}

function displayWeather(data) {
    //console.log(data);
    //#8457 html symbol for fahrenheit
    //#8451 html symbol for celcius
    return `
    <div class="weather-results">
    <h1><strong>Current Weather for ${data.name}</strong></h1>
    <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png">
    <p style="font-size: 30px; margin-top: 10px;">${data.weather[0].main}</p>
    <p style="color: steelblue;"> Description:</p><p">${data.weather[0].description}</p>
    <p style="color: steelblue;"> Temperature:</p><p>${data.main.temp} &#8457; / ${(((data.main.temp)-32)*(5/9)).toFixed(2)} &#8451;</p>
    <p style="color:steelblue;"> Min. Temperature:</p><p> ${data.main.temp_min} &#8457; / ${(((data.main.temp_min)-32)*(5/9)).toFixed(2)} &#8451</p>
    <p style="color:steelblue;"> Max. Temperature:</p><p> ${data.main.temp_max} &#8457; / ${(((data.main.temp_max)-32)*(5/9)).toFixed(2)} &#8451</p>
    <p style="color:steelblue;"> Humidity:</p><p> ${data.main.humidity} &#37;</p>
    </div>
    `;
}


//retrieve data from FourSquare API
function getDataFromFourApi() {
        let city = $('.search-query').val();
        let category = $(this).text();
        $.ajax(FOURSQUARE_SEARCH_URL, {
            data: {
                near: city,
                venuePhotos: 1,
                limit: 21,
                query: 'trail',
            },
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                try {
                    //console.log(data);
                    let results = data.response.groups[0].items.map(function (item, index) {
                        console.log(item);
                        hikingPlacesArray.push([item.venue.location.lng, item.venue.location.lat]);
                        console.log(hikingPlacesArray);
                        return displayResults(item);
                    });
                    $('#foursquare-results').html(results);
                } catch (e) {
                    console.log(e);
                    $('#foursquare-results').html("<div class='result'><p>Sorry! No Results Found.</p></div>");
                }
            },
            error: function () {
                $('#foursquare-results').html("<div class='result'><p>Sorry! No Results Found.</p></div>");
            }
        });
        //console.log(category);  
}

function displayResults(result) {
//console.log(result.venue.location.formattedAddress[0])
//console.log(result);
    let hikeLocation = result.venue.name;
    let hikeLink = `https://www.google.com/maps/search/${hikeLocation} + ${result.venue.location.formattedAddress[1]}`;
    if (result.venue.photos.groups.length > 0){
        return `
            <div class="result col-3">
                <div class="result-image" style="background-image: url(https://igx.4sqi.net/img/general/width960${result.venue.photos.groups[0].items[0].suffix})" ;>
                </div>
                <div class="result-description">
                    <h2 class="result-name">${result.venue.name}</h2>
                    <span class="icon">
                        <img src="${result.venue.categories[0].icon.prefix}bg_32${result.venue.categories[0].icon.suffix}" alt="category-icon">
                    </span>
                    <span class="icon-text">
                        ${result.venue.categories[0].name}
                    </span>
                    <p class="result-address">${result.venue.location.formattedAddress[0]}</p>
                    <p class="result-address">${result.venue.location.formattedAddress[1]}</p>
                    <p class="result-address">${result.venue.location.formattedAddress[2]}</p>
                    <a class="hike-directions" href="${hikeLink}" target="_blank">Get Directions</a>
                </div>
            </div>
        `;
    } 
}


function searchLocation() {
    $('.search-form').submit(function (event) {
        event.preventDefault();
        $('.navigation').removeClass("hide");
        $('#weather-display').html("");
        $('#foursquare-results').html("");
        getDataFromWeatherApi();
        getDataFromFourApi();
        $('button').removeClass("selected");
    });
}

//autocomplete location name in form
function activatePlacesSearch() {
    let options = {
        types: ['(regions)']
    };
    let input = document.getElementById('search-term');
    let autocomplete = new google.maps.places.Autocomplete(input, options);
}

//google map function in progress


function initMap(){
    $('#map-button').click(function(){
        $('#map').css("height", "400px");
        $('#foursquare-results').css("display", "none");
        var mapCanvas = document.getElementById("map");
        var mapOptions = {
            center: new google.maps.LatLng(hikingPlacesArray[0][1], hikingPlacesArray[0][0]),
            zoom: 10
        };
        var map = new google.maps.Map(mapCanvas, mapOptions);
        scrollPageTo('#map', 15)
        //console.log(map);
        console.log(hikingPlacesArray);
        for (i = 0; i < hikingPlacesArray.length; i++) {  
			position = new google.maps.LatLng(hikingPlacesArray[i][1], hikingPlacesArray[i][0]);
		    marker = new google.maps.Marker({
		        position: position,
		        map: map
		    });
        }
    });
}



function googleMapFunction(){
    activatePlacesSearch();
    initMap();
}



$(searchLocation);
