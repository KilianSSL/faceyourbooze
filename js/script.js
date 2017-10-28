var score = ['VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY', 'IMPOSSIBLE'];
var drinks = [
    {
        name: 'Mumie',
        image: 'mummy.svg',
        score: 0,
        properties: {
            sorrowLikelihood: 5,
            angerLikelihood: 3,
            joyLikelihood: 5,
            surpriseLikelihood: 2,
            headwearLikelihood: 5
        }
    }, {
        name: 'Vampire',
        image: 'vampire.svg',
        score: 0,
        properties: {
            sorrowLikelihood: 2,
            angerLikelihood: 4,
            joyLikelihood: 5,
            surpriseLikelihood: 4,
            headwearLikelihood: 5
        }
    }, {
        name: 'Brain',
        image: 'brain.svg',
        score: 0,
        properties: {
            sorrowLikelihood: 5,
            angerLikelihood: 5,
            joyLikelihood: 2,
            surpriseLikelihood: 5,
            headwearLikelihood: 2
        }
    },
    {
        name: 'Fruchtcocktail',
        image: 'nofundrink.svg',
        score: 0,
        properties: {
            sorrowLikelihood: 2,
            angerLikelihood: 5,
            joyLikelihood: 5,
            surpriseLikelihood: 5,
            headwearLikelihood: 5
        }
    },
    {
        name: 'Bierle',
        image: 'beer.svg',
        score: 0,
        properties: {
            sorrowLikelihood: 5,
            angerLikelihood: 1,
            joyLikelihood: 1,
            surpriseLikelihood: 5,
            headwearLikelihood: 5
        }
    },
    {
        name: 'Shot, aber pronto',
        image: 'shot.svg',
        score: 0,
        properties: {
            sorrowLikelihood: 5,
            angerLikelihood: 5,
            joyLikelihood: 5,
            surpriseLikelihood: 5,
            headwearLikelihood: 5
        }
    }
];

$(document).ready(function () {
    console.log("ready!");
    var video = $('#video')[0];
    // Elements for taking the snapshot
    var canvas = $('#canvas')[0];
    console.log(canvas);
    var context = canvas.getContext('2d');

    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        });
    }

    $('#snap').on('click', function () {
        context.drawImage(video, 0, 0, 640, 480);

        postImage(canvas.toDataURL('image/jpeg', 1.0));
    });
});

function postImage_success(result) {
    var faceAnnotations = result.responses[0].faceAnnotations[0];

    for (var j in drinks) {
        if (drinks.hasOwnProperty(j)) {
            drinks[j].score = 0;
        }
    }

    getBooze(faceAnnotations);
}

function getBooze(faceAnnotations) {
    var trackedProperties = ['sorrowLikelihood', 'headwearLikelihood', 'joyLikelihood', 'angerLikelihood', 'surpriseLikelihood'];
    var finalDrink = {};

    console.log(faceAnnotations);

    for (var i in trackedProperties) {
        if (trackedProperties.hasOwnProperty(i)) {
            var imageScoreForProperty = score.indexOf(faceAnnotations[trackedProperties[i]]);
            console.log(trackedProperties[i], imageScoreForProperty);
            for (var j in drinks) {
                if (drinks.hasOwnProperty(j)) {
                    if (imageScoreForProperty >= drinks[j].properties[trackedProperties[i]]) {
                        drinks[j].score++;
                    }
                }
            }
        }
    }

    var maxScore = Math.max.apply(Math,drinks.map(function(o){return o.score;}));
    var smallDrink = false;
    if(maxScore > 0) {
        var choosenDrinks = drinks.filter(function(drink) {
            return drink.score === maxScore;
        });

        console.log(choosenDrinks);

        if(choosenDrinks.length > 1) {
            console.log('drin');
            finalDrink = choosenDrinks[Math.floor(Math.random()*choosenDrinks.length)];
        } else {
            finalDrink = choosenDrinks[0];
        }
    } else {
        finalDrink = drinks[5];
        smallDrink = true;
    }

    console.log(choosenDrinks);

    var mouthCenter = getMouth(faceAnnotations.landmarks)[0].position;

    var $drink = $('#drink');
    $drink.css('top', mouthCenter.y + 'px').css('left', mouthCenter.x + 'px');
    $drink.attr('src', 'assets/img/' + finalDrink.image);
    if(smallDrink) {
        $drink.addClass('small-drink');
    } else {
        $drink.removeClass('small-drink');
    }

    $drink.show();
}

function getMouth(landmarks) {
    return landmarks.filter(function(landmark) {
       return landmark.type === 'MOUTH_CENTER';
    });
}

function postImage(base64Image) {
    base64Image = base64Image.replace("data:image/jpeg;base64,", "");

    var data = {
        "requests": [
            {
                "image": {
                    "content": base64Image
                },
                "features": [
                    {
                        "type": "FACE_DETECTION"
                    }
                ]
            }
        ]
    };

    $.ajax({
        type: "POST",
        url: "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey,
        data: JSON.stringify(data),
        dataType: "json",
        success: postImage_success,
        headers: {
            "Content-Type": "application/json",
        }
    });
}
