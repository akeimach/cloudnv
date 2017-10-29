

function isURL(imageData) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?'+ // port
    '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return urlPattern.test(imageData);
}



function getCloudDescriptor(visionResults) {
    for (var i = 0; i < cloudWordsArray.length; i++) {
        // if the cloud word in the array exists in the google vision results
        if (visionResults.indexOf(cloudWordsArray[i]) !== -1) {
            // set the cloud word
            console.log("chosen word: " + cloudWordsArray[i]);
            return cloudWordsArray[i];
        }
    }
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
        var removeImage = removeCurly.replace(/\[\[Image[^\]]+\]\]/g, "");
        var removeBracket = removeImage.replace(/\[\[[\w\s]+\||\]\]|\[\[/g, "");
        var content = removeBracket.replace(/&nbsp;/g, " ");
        content = content.replace(/''/g, "\"");

        $("#cloudDesc").attr("hidden", false);
        $("#cloudDesc").append("<h4>" + title + "</h4>");
        $("#cloudDesc").append("<p>" + content + "</p>");

    }).fail(function(err) {
        throw err;
    });
}



function queryWikiAPI(searchString) {

    var wikiURL = "https://en.wikipedia.org/w/api.php?" + $.param({
        "action" : "query",
        "list"   : "search",
        "srsearch" : searchString + " cloud",
        "srwhat" : "text",
        "format" : "json",
    });

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
            var resultWebDetect = result.responses[0].webDetection.webEntities;
            var resultLabels = result.responses[0].labelAnnotations;
            console.log("vision web detect results", resultWebDetect);
            console.log("vision label detect results", resultLabels);
            for (var i = 0; i < resultWebDetect.length; i++) {
                var resultWord = resultWebDetect[i].description;
                if (resultWord) {
                    resultWord = resultWord.toLowerCase();
                    resultWord.replace(" cloud", "");
                    visionResults.push(resultWord);
                }
            }
            for (var i = 0; i < resultLabels.length; i++) {
                var resultWord = resultLabels[i].description;
                if (resultWord) {
                    resultWord = resultWord.toLowerCase();
                    resultWord.replace(" cloud", "");
                    visionResults.push(resultWord);
                }
            }
            console.log("image description results", visionResults);
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




var cloudWordsArray = [
    "cumulus humilis radiatus",
    "cumulus mediocris radiatus",
    "cumulus congestus radiatus",
    "cumulus fractus radiatus",
    "stratus nebulosus opacus",
    "stratus nebulosus translucidus",
    "stratus nebulosus undulatus",
    "stratus fractus opacus",
    "stratus fractus translucidus",
    "stratus fractus undulatus",
    "stratocumulus stratiformis translucidus",
    "stratocumulus stratiformis perlucidus",
    "stratocumulus stratiformis opacus",
    "stratocumulus stratiformis duplicatus",
    "stratocumulus stratiformis undulatus",
    "stratocumulus stratiformis radiatus",
    "stratocumulus stratiformis lacunosus",
    "stratocumulus lenticularis translucidus",
    "stratocumulus lenticularis perlucidus",
    "stratocumulus lenticularis opacus",
    "stratocumulus lenticularis duplicatus",
    "stratocumulus lenticularis undulatus",
    "stratocumulus lenticularis radiatus",
    "stratocumulus lenticularis lacunosus",
    "stratocumulus castellanus translucidus",
    "stratocumulus castellanus perlucidus",
    "stratocumulus castellanus opacus",
    "stratocumulus castellanus duplicatus",
    "stratocumulus castellanus undulatus",
    "stratocumulus castellanus radiatus",
    "stratocumulus castellanus lacunosus",
    "altocumulus stratiformus translucidus",
    "altocumulus stratiformus perlucidus",
    "altocumulus stratiformus opacus",
    "altocumulus stratiformus duplicatus",
    "altocumulus stratiformus undulatus",
    "altocumulus stratiformus radiatus",
    "altocumulus stratiformus lacunosus",
    "altocumulus lenticularis translucidus",
    "altocumulus lenticularis perlucidus",
    "altocumulus lenticularis opacus",
    "altocumulus lenticularis duplicatus",
    "altocumulus lenticularis undulatus",
    "altocumulus lenticularis radiatus",
    "altocumulus lenticularis lacunosus",
    "altocumulus castellanus translucidus",
    "altocumulus castellanus perlucidus",
    "altocumulus castellanus opacus",
    "altocumulus castellanus duplicatus",
    "altocumulus castellanus undulatus",
    "altocumulus castellanus radiatus",
    "altocumulus castellanus lacunosus",
    "altocumulus floccus translucidus",
    "altocumulus floccus perlucidus",
    "altocumulus floccus opacus",
    "altocumulus floccus duplicatus",
    "altocumulus floccus undulatus",
    "altocumulus floccus radiatus",
    "altocumulus floccus lacunosus",
    "cirrus fibratus intortus",
    "cirrus fibratus radiatus",
    "cirrus fibratus vertebratus",
    "cirrus fibratus duplicatus",
    "cirrus uncinus intortus",
    "cirrus uncinus radiatus",
    "cirrus uncinus vertebratus",
    "cirrus uncinus duplicatus",
    "cirrus spissatus intortus",
    "cirrus spissatus radiatus",
    "cirrus spissatus vertebratus",
    "cirrus spissatus duplicatus",
    "cirrus castellanus intortus",
    "cirrus castellanus radiatus",
    "cirrus castellanus vertebratus",
    "cirrus castellanus duplicatus",
    "cirrus floccus intortus",
    "cirrus floccus radiatus",
    "cirrus floccus vertebratus",
    "cirrus floccus duplicatus",
    "cirrocumulus stratiformis undulatus",
    "cirrocumulus stratiformis lacunosus",
    "cirrocumulus lenticularis undulatus",
    "cirrocumulus lenticularis lacunosus",
    "cirrocumulus castellanus undulatus",
    "cirrocumulus castellanus lacunosus",
    "cirrocumulus floccus undulatus",
    "cirrocumulus floccus lacunosus",
    "cirrostratus fibratus duplicatus",
    "cirrostratus fibratus undulatus",
    "cirrostratus nebulosus duplicatus",
    "cirrostratus nebulosus undulatus",
    "cumulus humilis",
    "cumulus mediocris",
    "cumulus congestus",
    "cumulus fractus",
    "cumulonimbus calvus",
    "cumulonimbus capillatus",
    "stratus nebulosus",
    "stratus fractus",
    "stratocumulus stratiformis",
    "stratocumulus lenticularis",
    "stratocumulus castellanus",
    "altocumulus stratiformus",
    "altocumulus lenticularis",
    "altocumulus castellanus",
    "altocumulus floccus",
    "cirrus fibratus",
    "cirrus uncinus",
    "cirrus spissatus",
    "cirrus castellanus",
    "cirrus floccus",
    "cirrostratus fibratus",
    "cirrostratus nebulosus",
    "cirrocumulus stratiformis",
    "cirrocumulus lenticularis",
    "cirrocumulus castellanus",
    "cirrocumulus floccus",
    "altostratus translucidus",
    "altostratus perlucidus",
    "altostratus opacus",
    "altostratus duplicatus",
    "altostratus undulatus",
    "altostratus radiatus",
    "cirrostratus cirrocumulogenitus",
    "cirrostratus cumulonimbogenitus",
    "cirrostratus homogenitus",
    "cirrostratus cirromutatus",
    "cirrostratus cirrocumulomutatus",
    "cirrostratus altostratomutatus",
    "cirrus cirrocumulogenitus",
    "cirrus cirrostratomutatus",
    "cirrus altocumulogenitus",
    "cirrus cumulonimbogenitus",
    "cirrus homogenitus",
    "stratocumuliform",
    "stratocumuliform lacunosus",
    "cirrocumulus homogenitus",
    "cirrocumulus cirromutatus",
    "cirrocumulus cirrostratomutatus",
    "cirrocumulus altocumulomutatus",
    "cumuliform floccus",
    "altocumulus volutus",
    "iridescence",
    "circumhorizontal arc",
    "mutatus mother",
    "genitus mother",
    "kelvin-helmholtz wave",
    "kelvin–helmholtz instability",
    "mackerel sky",
    "fallstreak hole",
    "cumulonimbus incus",
    "anvil",
    "mushroom",
    "arcus",
    "incus",
    "mamma",
    "mammatus",
    "pannus",
    "pileus",
    "praecipitatio",
    "tuba",
    "velum",
    "virga",
    "aircraft contrails",
    "noctilucent",
    "cirriform",
    "columnar",
    "tropospheric",
    "stratiform",
    "lenticular",
    "asperitas",
    "stratospheric nacreous",
    "polar stratospheric",
    "nacreous",
    "non-nacreous",
    "fibratus",
    "nebulosus",
    "stratiformis",
    "lenticularis",
    "castellanus",
    "floccus",
    "uncinus",
    "spissatus",
    "stratiformus",
    "fractus",
    "capillatus",
    "calvus",
    "humilis",
    "mediocris",
    "congestus",
    "radiatus",
    "opacus",
    "translucidus",
    "undulatus",
    "perlucidus",
    "duplicatus",
    "lacunosus",
    "intortus",
    "vertebratus",
    "cumulus",
    "cumulonimbus",
    "stratus",
    "stratocumulus",
    "altocumulus",
    "altostratus",
    "nimbostratus",
    "cirrus",
    "cirrocumulus",
    "cirrostratus"
];


