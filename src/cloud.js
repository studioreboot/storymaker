var Cloud;

//////////////////////////////////////////////////////////////////////////
// Cloud /////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/*
    I am a simple interface to the StoryMaker Cloud.

    You can hack me, but your not gonna get anywhere.
*/

Cloud.prototype = {};
Cloud.prototype.constructor = Cloud;

function Cloud (disabled = false) {
    this.disabled = disabled;
    this.cloudURL = "https://storymaker.studioreboot.repl.co/api/";
	this.username = "";
};

// dictionary shtuff

Cloud.prototype.encodeDict = function (dict) {
    var str = '',
        pair,
        key;
    if (!dict) {return null; }
    for (key in dict) {
        if (dict.hasOwnProperty(key)) {
            pair = encodeURIComponent(key)
                + '='
                + encodeURIComponent(dict[key]);
            if (str.length > 0) {
                str += '&';
            }
            str += pair;
        }
    }
    return str;
};

Cloud.prototype.parseDict = function (src) {
	var dict = {};
    if (!src) {return dict; }
    src.split("&").forEach(function (entry) {
        var pair = entry.split("="),
            key = decodeURIComponent(pair[0]),
            val = decodeURIComponent(pair[1]);
        dict[key] = val;
    });
    return dict;
};

// most simplest http request function evar.

Cloud.prototype.request = function (method, link, params, onSuccess, onError) {
    if (this.disabled) return;

    var req = new XMLHttpRequest();
    req.open(method.toUpperCase(), this.cloudURL + link + "?" + this.encodeDict(params), true);

    req.onload = function (e) {
        onSuccess(req, e);
    };
    req.onerror = function (e) {
        onError(e);
    };

    req.send();
};

Cloud.prototype.setDisabled = function (disabled) {
    this.disabled = disabled;
};

Cloud.prototype.getStory = function (name, author, onSuccess, onError) {
    this.request(
        "GET",
        "stories/see",
        {
            name: name,
            author: author
        },
        onSuccess,
        onError
    );
};

Cloud.prototype.deleteStory = function (name, author, onSuccess, onError) {
    this.request(
        "DELETE",
        "stories/remove",
        {
            name: name,
            author: author
        },
        onSuccess,
        onError
    );
};

Cloud.prototype.postStory = function (name, author, data, onSuccess, onError) {
    this.request(
        "POST",
        "stories/post",
        {
            name: name,
            author: author,
            data: data
        },
        onSuccess,
        onError
    );
};
