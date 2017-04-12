"use strict";

const $ = require('jquery');
window.jQuery = $;
const bootstrap = require('bootstrap');

$.getJSON("profiles.json", function(profiles) {
    $('#profile-tree').append(JSON.stringify(profiles, null, 5));
});
