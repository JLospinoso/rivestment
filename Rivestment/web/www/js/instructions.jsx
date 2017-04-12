"use strict";
const md = require('markdown');
const $ = require('jquery');
window.jQuery = $;
const bootstrap = require('bootstrap');

$.getJSON("settings.json", function(settings){
    const instructions =
`
The goal of Rivestment is to win.

To win, you must have the highest score.

You increase your score by finding the preimages that generate MD5 hashes. The competition is set up so that
you will benefit greatly from automating submissions using a Slack bot. First, you (or your bot)
must register to play in Slack. The user responsible for being referee of the competition is
${settings.prefix}. To register with ${settings.prefix}, simply issue the following command:

\`\`\`
${settings.prefix} register [NAME]
\`\`\`

where \`[NAME]\` is the name you'd like ${settings.prefix} to refer to you as. It must be unique
across all players, and you can only register one name at a time. You should probably use the name of your bot here,
since you'll want your bot to perform some action for many of ${settings.prefix}'s responses.

At any time, you can quit the competition (and even rejoin). Your points will be reset, and you will
have the opportunity to change your \`[NAME]\`. Just issue the following command:

\`\`\`
${settings.prefix} quit
\`\`\`

The main interaction between you (or your bot) and ${settings.prefix} is with the \`challenge\` and \`try\` verbs.
You start with ${settings.startingScore} points, and you may spend ${settings.challengeCost}
per challenge to generate a set of
problems. You simply issue the following command:

\`\`\`
${settings.prefix} challenge
\`\`\`

and ${settings.prefix} will respond with a strictly formatted string corresponding to your challenges, e.g.:

\`\`\`
jbot challenges 303d14ff089e96ef12918f26679cebb6 a6ae2e0501b9757668b360d71efe75cf
d5777df5589dff6fa803ffdfc2d9434d d129a5ef717217ce56e7f6724842ea1e
9fe198993f1e9ae25ba2e81121bb7ac2 d5f2d6187ab8494115e9607b9eed445e
6b65fdbfa3a1bfbc0e6a3081f6629602 294df8b85ad22f3911ec04c4383cbc1b
7547a67db8f3eddcbf981d7d19018283 2c1dc90e3d591a8fd17b3ed1c941bd86
\`\`\`

_(There are no newlines in the actual responses.)_

By default, you will receive ${settings.nChallenges} challenges. You may request any number of challenges you'd like,
but you cannot have more than ${settings.maxScraps} at any time. To request some other number of challenges, simply
append this number to your challenges command, i.e.:


\`\`\`
${settings.prefix} challenge 2
\`\`\`

A sample response:

\`\`\`
jbot challenges 303d14ff089e96ef12918f26679cebb6 a6ae2e0501b9757668b360d71efe75cf
\`\`\`


The string is space delimited. The first token is the name that you registered with (*note that this will cause Slack
bots to trigger!*). Next is the word "challenges", which you may use in a Slack bot to trigger a command. The remainder of
the string is a series of hashes delimited by spaces. The preimage will
end with your password, and a random number of salt digits are prepended. The valid alphabet for this salt is
the following string: *${settings.preimageRange}*.

Once you have found the preimage for one of your challenges, simply tell ${settings.prefix} by using the try
command, e.g.:

\`\`\`
${settings.prefix} try 303d14ff089e96ef12918f26679cebb6 hkhrrav0phm
\`\`\`

You may submit multiple hashes in one \`try\`. Simply space delimit the hash/preimage pairs and continue adding them
to the submission (up to ${settings.maxSubmissions}).

The third token is the hash that you have found, and the fourth token is the corresponding preimage.
Note that my password, \`av0phm\`, is at the end of my preimage. The salt portion for this example is \`hkhrr\`.
If you submit an incorrect hash, you lose ${settings.incorrectCost} points. If you submit a correct answer, you will gain
a number of points equal to one plus the length of the salt. This number is also known as the hash's *difficulty*.

You may adjust the minimum *difficulty* of the problems that ${settings.prefix} sends you by issuing the following command:

\`\`\`
${settings.prefix} level 5
\`\`\`

In this example, I will no longer receive challenges with preimage salts less than size four. The difficulties of your
challenges will range from your \`level\` to ten plus your \`level\` (inclusive).

You may retrieve your password by issuing the following command:

\`\`\`
${settings.prefix} password
\`\`\`

You may retrieve your current score by issuing the following command:

\`\`\`
scorebot points
\`\`\`

You may find that, over time, ${settings.prefix} will accumulate unsolved hashes called _scraps_. You can find out
what these problems are by issuing the following command:

\`\`\`
${settings.prefix} scraps
\`\`\`

The response is in an analogous format to the \`challenges\` response, e.g.

\`\`\`
jbot scraps a6ae2e0501b9757668b360d71efe75cf d5777df5589dff6fa803ffdfc2d9434d
d129a5ef717217ce56e7f6724842ea1e 9fe198993f1e9ae25ba2e81121bb7ac2
d5f2d6187ab8494115e9607b9eed445e 6b65fdbfa3a1bfbc0e6a3081f6629602
294df8b85ad22f3911ec04c4383cbc1b 7547a67db8f3eddcbf981d7d19018283
2c1dc90e3d591a8fd17b3ed1c941bd86
\`\`\`

_Note that, in this example, the \`[NAME]\` I registered was \`jbot\`_

If you automate your submissions (you will probably need to do this to be successful), please rate limit your
submissions to no more than one per second. Slack will rate limit ${settings.prefix} and it will halt everyone's
ability to interact with ${settings.prefix}.
`;
    const asHtml = md.markdown.toHTML(instructions);
    $("#instructions").append(asHtml);
});
