'use strict';

TABS.beepers = {};

TABS.beepers.initialize = function (callback) {
    const self = this;

    if (GUI.active_tab != 'beepers') {
        GUI.active_tab = 'beepers';
    }

    load_beepers_config();

    function load_beepers_config() {
        MSP.send_message(MSPCodes.MSP_BEEPER_CONFIG, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/beepers.html", process_html);
    }

    function process_html() {

        // Hide the buttons toolbar
        $('.tab-beepers').addClass('toolbar_hidden');

        // translate to user-selected language
        i18n.localizePage();

        let toolbarHidden = true;

        function showToolbar() {
            if (toolbarHidden) {
                toolbarHidden = false;
                $('.tab-beepers').removeClass('toolbar_hidden');
            }
        }

        // Dshot Beeper
        const dshotBeeper_e = $('.tab-beepers .dshotbeeper');
        const dshotBeacon_e = $('.tab-beepers .dshotbeacon');
        const dshotBeeperBeaconTone = $('select.dshotBeeperBeaconTone');
        const dshotBeaconCondition_e = $('tbody.dshotBeaconConditions');

        for (let i = 1; i <= 5; i++) {
            dshotBeeperBeaconTone.append('<option value="' + (i) + '">'+ (i) + '</option>');
        }
        dshotBeeper_e.show();

        dshotBeeperBeaconTone.change(function() {
            FC.BEEPER_CONFIG.dshotBeaconTone = dshotBeeperBeaconTone.val();
        });

        dshotBeeperBeaconTone.val(FC.BEEPER_CONFIG.dshotBeaconTone);

        const template = $('.beepers .beeper-template');

        FC.BEEPER_CONFIG.dshotBeaconConditions.generateElements(template, dshotBeaconCondition_e);

        $('input.condition', dshotBeaconCondition_e).change(function () {
            const element = $(this);
            FC.BEEPER_CONFIG.dshotBeaconConditions.updateData(element);
        });

        // Analog Beeper
        const destination = $('.beepers .beeper-configuration');
        const beeper_e = $('.tab-beepers .beepers');

        FC.BEEPER_CONFIG.beepers.generateElements(template, destination);

        $('input.condition', beeper_e).change(function () {
            const element = $(this);
            FC.BEEPER_CONFIG.beepers.updateData(element);
        });

        $('.content_wrapper').change(function () {
            showToolbar();
        });

        $('a.revert').click(function() {
            self.refresh();
        });

        $('a.save').click(function() {
            Promise.resolve(true)
                .then(() => MSP.promise(MSPCodes.MSP_SET_BEEPER_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_BEEPER_CONFIG)))
                .then(() => MSP.promise(MSPCodes.MSP_EEPROM_WRITE))
                .then(() => {
                    GUI.log(i18n.getMessage('eepromSaved'));
                    self.refresh();
                });
        });

        GUI.content_ready(callback);
    }
};

TABS.beepers.cleanup = function (callback) {
    if (callback) callback();
};

TABS.beepers.refresh = function (callback) {
    const self = this;

    GUI.tab_switch_cleanup(function () {
        self.initialize();
        if (callback) callback();
    });
};

