const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v2/venues/explore?&client_id=FPRD2S2RFIB4QLBNBBHNAMLYOUF2AZSZ21ZK53QYASWCRJ1Z&client_secret=FEFA44EG0YDZ0XKA1UWX5ZWLZJLE30E2GYRLGB44PKE5KZ0E&v=20170915"
const WEATHER_SEARCH_URL = "https://api.openweathermap.org/data/2.5/weather?id=524901&APPID=a2d9429fad39b9f998a23d74c41056cc"

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
    <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="weather icon">
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
                limit: 15,
                query: 'trail',
            },
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                try {
                    //console.log(data);
                    let results = data.response.groups[0].items.map(function (item, index) {
                        //console.log(item);
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
}

//display the results passing the data from ajax call

function displayResults(result) {
//console.log(result.venue.location.formattedAddress[0])
console.log(result);
    let hikeLocation = result.venue.name;
    let hikeLink = `https://www.google.com/maps/search/${hikeLocation} + ${result.venue.location.formattedAddress[1]}`;
    const FOURSQUARE_PHOTO_URL = "https://api.foursquare.com/v2/venues/" + result.venue.id + "/photos?&client_id=AAX334AWRMDG2K3UNKXSXT5REBQZH3EQQPH0EOPSGU3CRBDQ&client_secret=SDZVEYKZBHKAS54ESJJZXOYTGKN2RKJHLUXQX5L4GLT2PS4U&v=20180417"

    //ajax call for separate photos endpoint for each item in previous ajax call
    $.ajax(FOURSQUARE_PHOTO_URL, {
        data: {
            limit: 1,
        },
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function(data){
                //console.log(data);
                myPhotoResult = data;
                const venuePhoto = "https://igx.4sqi.net/img/general/width960" + data.response.photos.items[0].suffix;
                //console.log(venuePhoto);
        }
    })

    let venuePhoto = "https://igx.4sqi.net/img/general/width960" + myPhotoResult.response.photos.items[0].suffix;
    let venueName = result.venue.name;
    //console.log(venueName);
    venueName = venueName.replace(/["'()-]/g,"");
    venueName = venueName.replace(/&-/g,' ').trim();
    //console.log(venueName);
        return `
            <div class="result col-3">
                <div class="result-image" style="background-image: url(https://igx.4sqi.net/img/general/width960${myPhotoResult.response.photos.items[0].suffix})" ;>
                </div>
                <div class="result-description">
                    <h2 class="result-name">${venueName}</h2>
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

$(searchLocation);
