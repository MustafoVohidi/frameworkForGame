var gameCenterApi = {
    'loadCss': function(linkHref, type = "text/css", rel = "stylesheet") {
        var link = document.createElement("link");
        link.href = linkHref;
        link.type = type;
        link.rel = rel;
        document.getElementsByTagName("head")[0].appendChild(link);
    },
    'loadJs': function(linkHref,callback = function(){}){
        var link = document.createElement('script');
        link.src = linkHref;
        link.type="text/javascript";
        link.addEventListener("load",function(event){
            callback();
        });
        document.body.appendChild(link);
    },
    'appendHtml': function(el, str) {
        var div = document.createElement('div');
        div.innerHTML = str;
        while (div.children.length > 0) {
            el.appendChild(div.children[0]);
        }
    },
    'alert': function(text, title = "") {
        alert(text);
    }
};
