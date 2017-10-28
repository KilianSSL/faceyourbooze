var score = ['VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];
var drinks = [
    {
        name: 'Mumie',
        image: ''
    }, {
        name: 'Strawberry',
        image: ''
    }, {
        name: 'Brain',
        image: ''
    }, {
        name: 'Fruchtcocktail',
        image: ''
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
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
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
    //test = result;
    console.log(result);
    var faceAnnotations = result.responses[0].faceAnnotations[0];

    console.log(faceAnnotations.joyLikelihood);

    var isJoy = (faceAnnotations.joyLikelihood == 'VERY_LIKELY');
    console.log(isJoy);
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
