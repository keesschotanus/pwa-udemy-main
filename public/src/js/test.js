var jsonstring = `
{
    "first-post" : {
        "id" : "first-post",
            "image" : "https://firebasestorage.googleapis.com/v0/b/udemy-pwa-bc405.appspot.com/o/sf-boat.jpg?alt=media&token=c50f95a1-557f-481f-9e01-620d07904def",
                "location" : "In San Francisco",
                    "title" : "Awesome trip to SF!"
    },
    "second-post" : {
        "id" : "first-post",
            "image" : "https://firebasestorage.googleapis.com/v0/b/udemy-pwa-bc405.appspot.com/o/sf-boat.jpg?alt=media&token=c50f95a1-557f-481f-9e01-620d07904def",
                "location" : "In San Francisco",
                    "title" : "Awesome trip to SF!"
    }
}
`;
var data = JSON.parse(jsonstring);

for (var key in data) {
    console.log(key /*,data[key] */);
}