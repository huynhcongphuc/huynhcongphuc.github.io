$(document).ready(function () {
    $("#footer").load("\\Layout\\layout_footer.html");

    $("#porfolio").click(function () {
        window.location = "/index.html";
    })
    $("#savingurl").click(function () {
        window.location = "/page\\savingurl.html";
    })
    $("#slogan").click(function () {
        window.location = "/index.html";
    })
    $("#blogs").click(function () {
        window.location = "https://phucexpressapp.herokuapp.com/";
    })
});