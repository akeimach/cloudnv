

var response = new XMLHttpRequest;
var imageResults = [];
var cloudWord;
var cloudWordArray = [];

function getWikiResults() {

    var wikiURL = "https://en.wikipedia.org/w/api.php?" + $.param({
        "action" : "query",
        "list"   : "search",
        "srsearch" : cloudWord,
        "srwhat" : "text",
        "format" : "json",
    });

    $.ajax({
        url: wikiURL,
        dataType: "jsonp"
    }).done(function(result) {
        var resultArray = result.query.search;
        console.log("wikipedia query result", resultArray);
        console.log("top wikipedia url: http://en.wikipedia.org/?curid=" + resultArray[0].pageid);
    }).fail(function(err) {
        throw err;
    });
}


function getBestDescriptor() {
    // TODO: split word into array so two words can both be searched
    for (var i = 0; i < cloudWordArray.length; i++) {
        // if the cloud word in the array exists in the google vision results
        if (imageResults.indexOf(cloudWordArray[i]) !== -1) {
            // set the cloud word
            cloudWord = cloudWordArray[i];
            console.log("chosen word: " + cloudWord);
            return;
        }
    }
}


response.onload = function() {
    imageResults = [];
    var result = JSON.parse(response.responseText);
    if (result.responses[0].error) {
        // Check if there was a response
        // TODO: notify user there was a time-out
        console.log(result.responses[0].error);
    }
    else {
        var resultWebDetect = result.responses[0].webDetection.webEntities;
        var resultLabels = result.responses[0].labelAnnotations;
        console.log("web detect results", resultWebDetect);
        console.log("label detect results", resultLabels);
        for (var i = 0; i < resultWebDetect.length; i++) {
            var cloudWord = resultWebDetect[i].description;
            // TODO: remove the word "cloud" from the description
            if (cloudWord) {
                imageResults.push(cloudWord.toLowerCase());
            }
        }
        for (var i = 0; i < resultLabels.length; i++) {
            var cloudWord = resultLabels[i].description;
            if (cloudWord) {
                imageResults.push(cloudWord.toLowerCase());
            }
        }
        console.log("image description results", imageResults);
        getBestDescriptor();
        if (cloudWord) {
            // if the cloud type was found in our cloud word array
            getWikiResults();
        }
    }
};


$("#submit").on("click", function(event) {
    event.preventDefault();
    var imageUri = $("#image-url").val().trim();
    var request = JSON.stringify(
        {   "requests":[
                {   "image":{
                        "source":{      
                            "imageUri":
                                imageUri
                        }
                    },  
                    "features":[
                        {   "type":"WEB_DETECTION",
                            "maxResults":10
                        },
                        {   "type":"LABEL_DETECTION",
                            "maxResults":10
                        }
                    ]
                } 
            ]
        }
    );
    response.open("POST","https://vision.googleapis.com/v1/images:annotate?key=" + apiKey.vision, !0);
    response.send(request);
});



cloudWordArray = [
    "noctilucent",
    "polar stratospheric",
    "cirriform",
    "nacreous",
    "non-nacreous",
    "stratospheric nacreous",
    "columnar",
    "tropospheric",
    "cumulonimbus",
    "nimbostratus",
    "high-level cirriform",
    "stratocumuliform",
    "stratiform",
    "high clouds",
    "genus cirrus",
    "cirrus uncinus",
    "cirrus spissatus",
    "cirrus fibratus radiatus",
    "cirriform clouds",
    "cirrus",
    "cirrus fibratus",
    "cirrus uncinus",
    "cirrus spissatus",
    "cirrus castellanus",
    "cirrus floccus",
    "cirrus fibratus intortus",
    "cirrus fibratus vertebratus",
    "pattern-based variety radiatus",
    "fibratus",
    "uncinus",
    "cirrus fibratus radiatus",
    "cirrus uncinus radiatus",
    "pattern-based variety duplicatus",
    "cirrus fibratus duplicatus",
    "cirrus uncinus duplicatus",
    "spissatus",
    "castellanus",
    "floccus",
    "castellanus",
    "genitus mother clouds",
    "cirrus cirrocumulogenitus",
    "cirrus altocumulogenitus",
    "cirrus cumulonimbogenitus",
    "cirrus homogenitus",
    "aircraft contrails",
    "mutatus mother cloud",
    "cirrus cirrostratomutatus",
    "genus cirrocumulus",
    "cirrocumulus stratiformis",
    "high-level stratocumuliform",
    "cirrocumulus",
    "stratocumuliform genus",
    "high stratocumuliform species",
    "cirrocumulus stratiformis",
    "cirrocumulus lenticularis",
    "lenticular",
    "cirrocumulus castellanus",
    "cirrocumulus floccus",
    "stratocumuliform",
    "undulatus",
    "cirrocumulus",
    "stratiformis",
    "lenticularis",
    "cirrocumulus stratiformis undulatus",
    "cirrocumulus lenticularis undulatus",
    "lacunosus",
    "castellanus",
    "cumuliform floccus",
    "stratocumuliform lacunosus",
    "cirrocumulus stratiformis lacunosus",
    "cirrocumulus castellanus lacunosus",
    "cirrocumulus floccus lacunosus",
    "virga",
    "stratiformis",
    "castellanus",
    "floccus",
    "genitus mother clouds",
    "cirrocumulus homogenitus",
    "mutatus mother clouds",
    "cirrocumulus cirromutatus",
    "cirrocumulus cirrostratomutatus",
    "cirrocumulus altocumulomutatus",
    "genus cirrostratus",
    "cirrostratus nebulosus",
    "altostratus translucidus",
    "cirrostratus",
    "altostratus",
    "nimbostratus",
    "cirrostratus fibratus",
    "cirrostratus fibratus duplicatus",
    "cirrostratus fibratus undulatus",
    "genitus mother clouds",
    "cirrostratus cirrocumulogenitus",
    "cirrostratus cumulonimbogenitus",
    "cirrostratus homogenitus",
    "cirrostratus cirromutatus",
    "cirrostratus cirrocumulomutatus",
    "cirrostratus altostratomutatus",
    "genus altocumulus",
    "altocumulus stratiformis",
    "altocumulus lenticularis",
    "altocumulus volutus",
    "altocumulus castellanus",
    "altocumulus floccus",
    "calvus",
    "capillatus",
    "castellanus",
    "congestus",
    "fibratus",
    "floccus",
    "fractus",
    "humilis",
    "lenticularis",
    "mediocris",
    "nebulosus",
    "spissatus",
    "stratiformis",
    "uncinus",
    "duplicatus",
    "intortus",
    "lacunosus",
    "opacus",
    "perlucidus",
    "radiatus",
    "translucidus",
    "undulatus",
    "vertebratus",
    "arcus",
    "incus",
    "mamma",
    "pannus",
    "pileus",
    "praecipitatio",
    "tuba",
    "velum",
    "virga",
    "cirrus",
    "cirrostratus",
    "cirrocumulus",
    "altocumulus",
    "altostratus",
    "stratocumulus",
    "stratus",
    "cumulus",
    "cumulonimbus",
    "nimbostratus"
];




