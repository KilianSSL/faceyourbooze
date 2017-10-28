$(document).ready(function () {
    console.log("ready!");

    document.getElementById('button').addEventListener('click', function () {
        var files = document.getElementById('file').files;
        if (files.length > 0) {
            getBase64(files[0]);
        }
    });
});

function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        console.log(reader.result);
        postImage(reader.result);
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}

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
