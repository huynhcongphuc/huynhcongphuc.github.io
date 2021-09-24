$(document).ready(function () {
    $("#footer").load("\\Layout\\layout_footer.html");

    $("#porfolio").click(function () {
        window.location = "/index.html";
    })
    $("#programing").click(function () {
        window.location = "/Page\\Programing.html";
    })
    $("#automation").click(function () {
        window.location = "/Page\\Automation.html";
    })
    $("#electrical").click(function () {
        window.location = "/Page\\Electrical.html";
    })
    $("#network").click(function () {
        window.location = "/Page\\Network.html";
    })
    $("#protocol").click(function () {
        window.location = "/Page\\Protocol.html";
    })
});