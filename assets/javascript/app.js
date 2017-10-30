

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
    var searchString = [];
    for (var i = 0; i < visionResults.length; i++) {
        if ((cloudWordsArray.indexOf(visionResults[i]) !== -1) && (searchString.length < 2)) {
            searchString.push(visionResults[i]);
        }
    }
    if (searchString.length === 1) {
        // add the word 'cloud' if only one specific descriptor found
        searchString.push("cloud");
    }
    if (searchString.length === 0) {
        // if no specific descriptors were found, check the broad categories
        for (var i = 0; i < visionResults.length; i++) {
            if ((cloudTypesArray.indexOf(visionResults[i]) !== -1) && (searchString.length < 1)) {
                searchString.push(visionResults[i]);
            }
        }
    }
    if (searchString.length > 0) {
        console.log("chosen words: " + searchString.join(" "));
        return searchString.join(" ");
    }
    $("#cloudDesc").attr("hidden", false);
    $("#cloudDesc").empty();
    $("#cloudDesc").append("<h4>Couldn't identify cloud</h4>");
}



function parseWikiAPI(pageID) {
    var wikiURL = "https://en.wikipedia.org/w/api.php?" + $.param({
        "action" : "parse",
        "pageid" : pageID,
        "format" : "json",
        "section": 0, //only parse the summary section
        "prop"   : "wikitext"
    });

    $.ajax({
        url: wikiURL,
        dataType: "jsonp"
    }).done(function(result) {

        var title = result.parse.title;
        var removeDiv = result.parse.wikitext['*'].replace(/<\/?[^>]+(>|$)/g, "");
        var removeCurly = removeDiv.replace(/{{[^}]+}}/g, "");
        var removeImage = removeCurly.replace(/\[\[(Image|File)[^\]]+\]\]/g, "");
        var removeBracket = removeImage.replace(/\[\[[\w\s]+\||\]\]|\[\[/g, "");
        var content = removeBracket.replace(/&nbsp;/g, " ");
        content = content.replace(/''/g, "\"");
        content = content.replace(/__NOTOC__/g, "");

        $("#cloudDesc").attr("hidden", false);
        $("#cloudDesc").empty();
        $("#cloudDesc").append("<h4>" + title + "</h4>");
        $("#cloudDesc").append("<p>" + content + "</p>");
        var linkText = $("<p>");
        linkText.append("Read more on ");
        linkText.append("<a href='http://en.wikipedia.org/?curid=" + pageID + "' target='_blank'>Wikipedia</a>");
        $("#cloudDesc").append(linkText);

    }).fail(function(err) {
        throw err;
    });
}



function queryWikiAPI(searchString) {

    var wikiURL = "https://en.wikipedia.org/w/api.php?" + $.param({
        "action" : "query",
        "list"   : "search",
        "srsearch" : searchString,
        "srwhat" : "text",
        "format" : "json",
    });

    console.log(wikiURL);

    $.ajax({
        url: wikiURL,
        dataType: "jsonp"
    }).done(function(result) {
        var resultArray = result.query.search;
        console.log("wikipedia query results", resultArray);
        console.log("top wikipedia url: http://en.wikipedia.org/?curid=" + resultArray[0].pageid);
        parseWikiAPI(resultArray[0].pageid);
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
            var searchString = getCloudDescriptor(visionResults);
            if (searchString) {
                // if the cloud type was found in our cloud word array
                queryWikiAPI(searchString);
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



var cloudTypesArray = [
    "stratus",
    "stratocumulus",
    "altocumulus",
    "cirrus",
    "cirrocumulus",
    "cirrostratus",
    "cumulonimbus",
    "altostratus",
    "nimbostratus",
    "cumulus"
];

var cloudWordsArray = [
    "humilis",
    "radiatus",
    "mediocris",
    "congestus",
    "fractus",
    "nebulosus",
    "opacus",
    "translucidus",
    "undulatus",
    "stratiformis",
    "perlucidus",
    "duplicatus",
    "lacunosus",
    "lenticularis",
    "castellanus",
    "stratiformus",
    "floccus",
    "fibratus",
    "intortus",
    "vertebratus",
    "uncinus",
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
    "iridescence",
    "circumhorizontal",
    "arc",
    "mutatus",
    "mother",
    "genitus",
    "kelvin–helmholtz",
    "mackerel",
    "fallstreak",
    "incus",
    "anvil",
    "mushroom",
    "arcus",
    "mamma",
    "mammatus",
    "pannus",
    "pileus",
    "praecipitatio",
    "tuba",
    "velum",
    "virga",
    "aircraft",
    "contrails",
    "noctilucent",
    "cirriform",
    "columnar",
    "tropospheric",
    "stratiform",
    "lenticular",
    "asperitas",
    "stratospheric",
    "nacreous",
    "polar",
    "non-nacreous",
];


