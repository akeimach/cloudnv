var countAsync = 0;
var divMatches = $("<div>");


function isURL(imageData) {
    var urlPattern = new RegExp("^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?" + // port
    "(\\/[-a-z\\d%@_.~+&:]*)*" + // path
    "(\\?[;&a-z\\d%@_.,~+&:=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$","i"); // fragment locator
    return urlPattern.test(imageData);
}



function getCloudDescriptor(visionResults) {
    var searchWordArray = [];
    for (var i = 0; i < visionResults.length; i++) {
        if ((cloudSpeciesArray.indexOf(visionResults[i]) !== -1)) {
            searchWordArray.push(visionResults[i]);
        }
    }
    if (searchWordArray.length === 1) {
        searchWordArray.push("cloud");
    }
    if (searchWordArray.length === 0) {
        // if no specific descriptors were found, check the broad categories
        for (var i = 0; i < visionResults.length; i++) {
            if ((cloudGeneraArray.indexOf(visionResults[i]) !== -1)) {
                searchWordArray.push(visionResults[i]);
            }
        }
    }
    if (searchWordArray.length > 0) {
        console.log("chosen words: " + searchWordArray);
        return searchWordArray;
    }
    return searchWordArray;
}



function checkAsyncResults() {
    if (countAsync === 0) { // Each asyncronous call (increment) has been completed (decrement)
        $("#cloudDesc").empty();
        if (divMatches.children().length === 0) {
            divMatches.append("<h3>Couldn't identify cloud</h3>");
            parseWikiAPI(1461163);
            $("#cloudDesc").append(divMatches);
        }
        else {
            $("#cloudDesc").append("<h3>Matching Cloud Types</h3>");
            $("#cloudDesc").append(divMatches);
        }
    }
}



function parseWikiAPI(pageID, title) {

    var wikiURL = "https://en.wikipedia.org/w/api.php?exintro=&explaintext=&" + $.param({
        "action" : "query",
        "format" : "json",
        "prop"   : "extracts|categories", // Same as parsing wikitext but better! Plain text only! Bye regex!
        "titles" : title
    });

    $.ajax({
        url: wikiURL,
        dataType: "jsonp"
    }).done(function(result) {

        var cloudCategory = false;
        var categories = result.query.pages[pageID].categories;
        // To check if the article is about clouds, check the category
        for (var i = 0; i < categories.length; i++) {
            var parseCategory = categories[i].title.toLowerCase();
            if (parseCategory.indexOf("cloud") !== -1) {
                cloudCategory = true;
            }
            else {
                for (var c = 0; c < cloudGeneraArray.length; c++) {
                    if (parseCategory.indexOf(cloudGeneraArray[c]) !== -1) {
                        cloudCategory = true;
                    }
                }
            }
        }

        if (cloudCategory) {
            divMatches.append("<br><h4><a href='http://en.wikipedia.org/?curid=" + pageID + "' target='_blank'>" + title + "</a></h4>");
            divMatches.append("<p>" + result.query.pages[pageID].extract + "</p>");
        }

        countAsync--;
        checkAsyncResults();

    }).fail(function(err) {
        throw err;
    });
}



function queryWikiAPI(searchWordArray) {

    var wikiURL = "https://en.wikipedia.org/w/api.php?" + $.param({
        "action" : "query",
        "list"   : "search",
        "srsearch" : searchWordArray.join(" "),
        "srwhat" : "text",
        "prop"   : "categories",
        "format" : "json"
    });

    console.log(wikiURL);

    $.ajax({
        url: wikiURL,
        dataType: "jsonp"
    }).done(function(result) {
        var resultArray = result.query.search;
        console.log("wikipedia query results", resultArray);
        countAsync = 0;
        divMatches.empty();
        for (var i = 0; i < resultArray.length; i++) {
            if ((resultArray[i].title.search("List")) && (resultArray[i].title.search("Cloud"))) {
                countAsync++;
                parseWikiAPI(resultArray[i].pageid, resultArray[i].title);
            }
        }

    }).fail(function(err) {
        throw err;
    });
}



function queryVisionAPI(imageData) {
    // imageData is either a url or base 64 encoded string
    var imageDataString;
    if (isURL(imageData)) {
        imageDataString = '"source":{"imageUri":"' + imageData + '"}';
    }
    else {
        imageDataString = '"content":"' + imageData + '"';
    }
    var request = '{"requests":[{"image":{' + imageDataString + '},"features":[{"type":"WEB_DETECTION","maxResults":10},{"type":"LABEL_DETECTION","maxResults":10}]}]}';

    var response = new XMLHttpRequest;
    response.open("POST","https://vision.googleapis.com/v1/images:annotate?key=" + apiKey.vision, !0);
    response.send(request);

    response.onload = function() {

        var visionResults = [];
        var result = JSON.parse(response.responseText);

        if (result.responses[0].error) {
            // Check if there was a response
            // TODO: notify user there was a time-out
            console.log(result.responses[0].error);
        }
        else {
            var queryResults = result.responses[0].webDetection.webEntities.concat(result.responses[0].labelAnnotations);
            queryResults.sort(function(a, b) { // Sort the vision api results by score
                return parseFloat(b.score) - parseFloat(a.score);
            });
            console.log(queryResults);
            for (var i = 0; i < queryResults.length; i++) {
                var resultWord = queryResults[i].description;
                if (resultWord) {
                    resultWord = resultWord.toLowerCase();
                    var wordArray = resultWord.split(" ");
                    for (var j = 0; j < wordArray.length; j++) {
                        if (visionResults.indexOf(wordArray[j]) === -1) {
                            visionResults.push(wordArray[j]);
                        }
                    }
                }
            }
            console.log(visionResults);
            var searchWordArray = getCloudDescriptor(visionResults);
            if (searchWordArray.length > 0) {
                // if the cloud type was found in our cloud word array
                queryWikiAPI(searchWordArray);
            }
            else {
                checkAsyncResults();
            }
        }
    };
};



$("#submit").on("click", function(event) {
    event.preventDefault();
    var imageData = $("#image-url").val().trim();
    if (imageData !== "") {
        displayPic(imageData);
        $("#image-url").val("");
        $("#image-url").attr("placeholder", imageData);
        queryVisionAPI(imageData);
    }
});



var cloudGeneraArray = [
    "nimbostratus",
    "cumulonimbus",
    "cirrus",
    "cirrostratus",
    "cirrocumulus",
    "altostratus",
    "altocumulus",
    "stratus",
    "stratocumulus",
    "cumulus"
];

var cloudSpeciesArray = [
    "virga",
    "tornato",
    "sundogs",
    "pyrocumulus",
    "pileus",
    "noctilucent",
    "nacreous",
    "mammatus",
    "kelvin–helmholtz",
    "fallstreak",
    "distrail",
    "contrail",
    "contrails",
    "arcus",
    "mushroom",
    "spissatus",
    "calvus",
    "capillatus",
    "cirrocumulogenitus",
    "cumulonimbogenitus",
    "homogenitus",
    "cirromutatus",
    "cirrocumulomutatus",
    "altostratomutatus",
    "cirrostratomutatus",
    "altocumulogenitus",
    "stratocumuliform",
    "altocumulomutatus",
    "cumuliform",
    "volutus",
    "undulatus",
    "translucidus",
    "radiatus",
    "lacunosus",
    "uncinus",
    "stratiformis",
    "stratiformus",
    "stratiform",
    "mediocris",
    "lenticularis",
    "lenticular",
    "humilis",
    "fractus",
    "fibratus",
    "congestus",
    "castellanus",
    "nebulosus",
    "opacus",
    "perlucidus",
    "duplicatus",
    "floccus",
    "intortus",
    "vertebratus",
    "iridescence",
    "circumhorizontal",
    "mutatus",
    "genitus",
    "mackerel",
    "incus",
    "pannus",
    "praecipitatio",
    "tuba",
    "velum",
    "cirriform",
    "columnar",
    "tropospheric",
    "asperitas",
    "stratospheric",
    "polar",
    "non-nacreous"
];


