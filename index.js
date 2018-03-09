const HIKE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';
const CLIENT_ID = "ISY5MALGO3AVEOSEERX5ZUGGQWXAPSFPC2YJV004AHCDML10";
const CLIENT_SECRET = "KTCJFLIVGG1GKB3M4P3WVY0Y5H5UEMJOWNRSH3VUDROOS1HE";
const HIKE_PHOTO_URL = 'https://api.foursquare.com/v2/venues/';

function getDataFromFourApi(searchTerm, callback){
    const settings = {
        url: HIKE_SEARCH_URL + '?' + "v=20180308" + '&near=Los Angeles' + "&query=hiking" + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET,
        dataType: 'json',
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
};

function displayResult(result){
    return `
      <ul> 
        <li>
        ${result.name}
        </li>
      </ul>
    `;
}

function displayPhotos(result, callback){
    const settings = {
        url: HIKE_PHOTO_URL + result.id + "/photos?" + "v=20180308" + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET,
        dataType: 'json',
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
}

function displayPhotoResults(data){
    console.log(data);
}

function displayYelpSearchResults(data){
    console.log(data);
    const searchResults = data.response.venues.map((item, index) => displayResult(item));
    const searchPhotos = data.response.venues.map((item, index) => displayPhotos(item, displayPhotoResults))
    $('.js-search-results').html(searchResults);
}

function watchSubmit(){
    $('.js-search-form').submit(function(event){
        event.preventDefault();
        let queryTarget = $(event.currentTarget).find('.js-query');
        let query = queryTarget.val();
        queryTarget.val("");
        getDataFromFourApi(query, displayYelpSearchResults);
    });
}

$(watchSubmit);