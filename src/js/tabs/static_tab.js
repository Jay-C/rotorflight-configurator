'use strict';

TABS.staticTab = {
    tabName: null,
};

TABS.staticTab.initialize = function (callback) {
    const tabFile = `./tabs/${this.tabName}.html`;

    $('#content').html('<div id="tab-static"><div id="tab-static-contents"></div>');

    $('#tab-static-contents').load(tabFile, function () {
        i18n.localizePage();
        GUI.content_ready(callback);
    });

};

TABS.staticTab.cleanup = function (callback) {
    if (callback) callback();
};
