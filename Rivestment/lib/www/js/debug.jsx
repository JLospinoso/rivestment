"use strict";

$.getJSON("profiles.json", function(profiles) {
    $('#profile-tree').append(JSON.stringify(profiles, null, 5));
});

$(function () {
});