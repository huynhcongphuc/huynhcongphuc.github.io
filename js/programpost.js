$(document).ready(function () {
    var post = [{
        topic: "Time out comunication line problem check - modem VNPT",
        filename: "/content/Time out Commline.docx",
        main: "Trobleshooting VNPT - IEC104, hiện tượng gửi lệnh control nhưng lại nhận lại lệnh NAK"
        },
    ];
    for (let i = 0; i <= post.length; i++) {
        var txt1 = "<div class=\"row border-bottom\"><h5>" + post[i].topic + "</h5>";
        var txt2 = "<div class=\"col-md-4\"><a href=\"" + post[i].filename + "\"><i class=\"fa fa-file-text\" aria-hidden=\"true\"></i> Time out Commline</a></div>";
        var txt3 = "<div class=\"col-md-8\"><p class=\"text-danger mb-3\" style=\"font-size: 16px\">" + post[i].main + "</p></div></div>";
        $("#post1").append(txt1 + txt2 + txt3);
        var txt4 = "<a href=\"" + post[i].filename + "\"><i class=\"fa fa-file-text\" aria-hidden=\"true\"></i> " + post[i].topic + "</a>";
        $("#subpost1").append(txt4);
    }

});