var fs = require('fs');

exports.verify = function (data, field_names) {
    for (var i = 0; i < field_names.length; i++) {
        // if (!data[field_names[i]]) {
        if (data[field_names[i]]==null) {
            throw exports.error("missing_data", field_names[i] + " not optional");
        }
    }
    return true;
}

exports.error = function (code, message) {
    var e = new Error(message);
    // e.code = code;
    return e;
};

exports.file_error = function (err) {
    return exports.error("file_error", JSON.stringify(err.message));
}

exports.invalid_email = function() {
    return exports.error("invalid_email",
                        "email is not verified.");
}

exports.restrict_delete = function() {
    return exports.error("restrict_delete",
                         "delete is restricted.");
}

exports.invalid_apply = function() {
    return exports.error("invalid_apply",
                        "user already applied.");
}

/**
 * Possible signatures:
 *  src, dst, callback
 *  src, dst, can_overwrite, callback
 */
exports.file_copy = function () {

    var src, dst, callback;
    var can_overwrite = false;

    if (arguments.length == 3) {
        src = arguments[0];
        dst = arguments[1];
        callback = arguments[2];
    } else if (arguments.length == 4) {
        src = arguments[0];
        dst = arguments[1];
        callback = arguments[3];
        can_overwrite = arguments[2]
    }

    function copy(err) {
        var is, os;

        if (!err && !can_overwrite) {
            return callback(exports.error("file_exists", "File " + dst + " exists."));
        }

        fs.stat(src, function (err) {
            if (err) {
                return callback(err);
            }

            is = fs.createReadStream(src);
            os = fs.createWriteStream(dst);
            is.on('end', function () { callback(null); });
            is.on('error', function (e) { callback(e); });
            is.pipe(os);
        });
    }

    fs.stat(dst, copy);
};

exports.valid_filename = function (fn) {
    var re = /[^\.a-zA-Z0-9_-]/;
    return typeof fn == 'string' && fn.length > 0 && !(fn.match(re));
};


exports.db_error = function () {
    return exports.error("server_error", "Something horrible has happened with our database!");
}

exports.item_already_exists = function (name: string) {
    return exports.error(name + " already exists", "A " + name + " with this name already exists.");
};
