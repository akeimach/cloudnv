

var response = new XMLHttpRequest;
var imageResults = [];
var cloudWord;

function getWikiResults() {

    console.log(cloudWord);

    var wikiURL = "https://en.wikipedia.org/w/api.php";

    wikiURL += "?" + $.param({
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
        console.log(resultArray);
        console.log("http://en.wikipedia.org/?curid=" + resultArray[0].pageid);

    }).fail(function(err) {
        throw err;
    });

}


function getBestDescriptor() {
    // TODO: split word into array so two words can both be searched
    for (var i = 0; i < imageResults.length; i++) {
        if (specialClouds.indexOf(imageResults[i]) !== -1) {
            cloudWord = imageResults[i];
            return cloudWord;
        }
        else if (cloudSpecies.indexOf(imageResults[i]) !== -1) {
            cloudWord = imageResults[i];
            return cloudWord;
        }
        else if (cloudFamilies.indexOf(imageResults[i]) !== -1) {
            cloudWord = imageResults[i];
            return cloudWord;
        }
    }
}


response.onload = function() {
    imageResults = [];
    var result = JSON.parse(response.responseText);
    if (result.responses[0].error) {
        console.log(result.responses[0].error);
    }
    else {
        var resultWebDetect = result.responses[0].webDetection.webEntities;
        var resultLabels = result.responses[0].labelAnnotations;
        for (var i = 0; i < resultWebDetect.length; i++) {
            var cloudWord = resultWebDetect[i].description;
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
        console.log(imageResults);
        cloudWord = getBestDescriptor();
        if (cloudWord) {
            getWikiResults();
        }
    }
};


$(document.body).ready(function(event) {

    var imageUri = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Cirrus_clouds2.jpg/220px-Cirrus_clouds2.jpg"; //temp test image

    var request = JSON.stringify(
        {
            "requests":[
                {  
                    "image":{
                        "source":{      
                            "imageUri":
                                imageUri
                        }
                    },  
                    "features":[
                        {
                            "type":"WEB_DETECTION",
                            "maxResults":10
                        },
                        {
                            "type":"LABEL_DETECTION",
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




var cloudFamilies = [
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

var cloudSpecies = [
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
    "virga"
];


var specialClouds = [
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
    "altocumulus floccus"
];




