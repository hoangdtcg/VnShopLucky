$(document).ready(function () {
    $(".btn-1").click(function () {
        changeScreen("roulette-2");
    });
    $(".btn-2").click(function () {
        changeScreen("roulette-1");
    });
    $(".home-btn").click(function () {
        changeScreen("home");
    });
    function changeScreen(screen = "home") {
        console.log(screen);
        switch (screen) {
            case "home":
                window.location.assign("index.html");
                break;
            case "roulette-1":
                window.location.assign("roulette.html?type=gold");
                break;
            case "roulette-2":
                window.location.assign("roulette.html?type=diamond");
                break;
            default:
                window.location.assign("index.html");
                break;
        }
    }
    function successFunc(data) {
        customers = data;
        console.log(customers);
        $('.start').removeAttr('disabled');
    }

    Sheetsu.read(
        // "https://sheetsu.com/apis/v1.0lw/020b2c0f/",
        "https://sheetsu.com/apis/v1.0su/b2d8fd7b7a69/",
        {},
        successFunc
    );
});
