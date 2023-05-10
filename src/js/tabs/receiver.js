'use strict';

TABS.receiver = {
    isDirty: false,
    rcmap: [ 0, 1, 2, 3, 4, 5, 6, 7 ],
    deadband: 0,
    yawDeadband: 0,
    needReboot: false,
    bindButton: false,
    stickButton: false,
    saveButtons: false,
    axisLetters: ['A', 'E', 'R', 'C', 'T', '1', '2', '3'],
    axisNames: [
        'controlAxisRoll',
        'controlAxisPitch',
        'controlAxisYaw',
        'controlAxisCollective',
        'controlAxisThrottle',
        'controlAxisAux1',
        'controlAxisAux2',
        'controlAxisAux3',
        'controlAxisAux4',
        'controlAxisAux5',
        'controlAxisAux6',
        'controlAxisAux7',
        'controlAxisAux8',
        'controlAxisAux9',
        'controlAxisAux10',
        'controlAxisAux11',
        'controlAxisAux12',
        'controlAxisAux13',
        'controlAxisAux14',
        'controlAxisAux15',
        'controlAxisAux16',
        'controlAxisAux17',
        'controlAxisAux18',
    ],
    chNames: [
        { value: 0, text: 'CH1' },
        { value: 1, text: 'CH2' },
        { value: 2, text: 'CH3' },
        { value: 3, text: 'CH4' },
        { value: 4, text: 'CH5' },
        { value: 5, text: 'CH6' },
        { value: 6, text: 'CH7' },
        { value: 7, text: 'CH8' },
    ],
    rssiNames: [
        { value: 0,  text:'AUTO' },
        { value: 1,  text:'ADC'  },
        { value: 6,  text:'AUX1' },
        { value: 7,  text:'AUX2' },
        { value: 8,  text:'AUX3' },
        { value: 9,  text:'AUX4' },
        { value: 10, text:'AUX5' },
        { value: 11, text:'AUX6' },
        { value: 12, text:'AUX7' },
        { value: 13, text:'AUX8' },
    ],
};

TABS.receiver.initialize = function (callback) {
    const self = this;

    load_data(load_html);

    function load_html() {
        $('#content').load("./tabs/receiver.html", process_html);
    }

    function load_data(callback) {
        MSP.promise(MSPCodes.MSP_STATUS)
            .then(() => MSP.promise(MSPCodes.MSP_FEATURE_CONFIG))
            .then(() => MSP.promise(MSPCodes.MSP_RC))
            .then(() => MSP.promise(MSPCodes.MSP_RC_TUNING))
            .then(() => MSP.promise(MSPCodes.MSP_RC_DEADBAND))
            .then(() => MSP.promise(MSPCodes.MSP_RX_MAP))
            .then(() => MSP.promise(MSPCodes.MSP_RX_CONFIG))
            .then(() => MSP.promise(MSPCodes.MSP_RX_CHANNELS))
            .then(() => MSP.promise(MSPCodes.MSP_RSSI_CONFIG))
            .then(() => MSP.promise(MSPCodes.MSP_MIXER_CONFIG))
            .then(callback);
    }

    function save_data(callback) {
        Promise.resolve(true)
            .then(() => MSP.promise(MSPCodes.MSP_SET_RX_MAP, mspHelper.crunch(MSPCodes.MSP_SET_RX_MAP)))
            .then(() => MSP.promise(MSPCodes.MSP_SET_RX_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_RX_CONFIG)))
            .then(() => MSP.promise(MSPCodes.MSP_SET_RC_DEADBAND, mspHelper.crunch(MSPCodes.MSP_SET_RC_DEADBAND)))
            .then(() => MSP.promise(MSPCodes.MSP_SET_RSSI_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_RSSI_CONFIG)))
            .then(() => MSP.promise(MSPCodes.MSP_SET_FEATURE_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_FEATURE_CONFIG)))
            .then(() => MSP.promise(MSPCodes.MSP_EEPROM_WRITE))
            .then(() => {
                GUI.log(i18n.getMessage('eepromSaved'));
                if (self.needReboot) {
                    MSP.send_message(MSPCodes.MSP_SET_REBOOT);
                    GUI.log(i18n.getMessage('deviceRebooting'));
                    reinitialiseConnection(callback);
                }
                else {
                    if (callback) callback();
                }
            });
    }

    function process_html() {

        // Hide the buttons toolbar
        $('.tab-receiver').addClass('toolbar_hidden');

        // translate to user-selected language
        i18n.localizePage();

        // UI Hooks
        self.isDirty = false;
        self.saveButtons = false;
        self.bindButton = false;
        self.stickButton = false;
        self.needReboot = false;

        const bindBtn = $('.bind_btn');
        const stickBtn = $('.sticks_btn');
        const saveBtn = $('.save_btn');
        const rebootBtn = $('.reboot_btn');

        function updateButtons(reboot) {
            if (reboot)
                self.needReboot = true;

            if (self.saveButtons || self.bindButton || self.stickButton) {
                if (!self.isDirty) {
                    $('.tab-receiver').removeClass('toolbar_hidden');
                    self.isDirty = true;
                }
                bindBtn.toggle(self.bindButton);
                stickBtn.toggle(self.stickButton);
                saveBtn.toggle(!self.needReboot);
                rebootBtn.toggle(self.needReboot);
            }
        }

        $('input[name="cyclic_deadband"]').val(FC.RC_DEADBAND_CONFIG.deadband);
        $('input[name="yaw_deadband"]').val(FC.RC_DEADBAND_CONFIG.yaw_deadband);

        $('input[name="cyclic_deadband"]').change(function () {
            self.deadband = parseInt($(this).val());
        }).change();
        $('input[name="yaw_deadband"]').change(function () {
            self.yawDeadband = parseInt($(this).val());
        }).change();

        $('input[name="stick_center"]').val(FC.RX_CONFIG.stick_center);

        $('input[name="stick_min"]').val(FC.RX_CONFIG.stick_min);
        $('input[name="stick_max"]').val(FC.RX_CONFIG.stick_max);


    //// Bars

        function addChannel(parent, name, channels) {
            const elem = $('#tab-receiver-templates .receiverBarTemplate table tr').clone();
            elem.find('.name').text(name);
            const chSelect = elem.find('.channel_select');
            channels.forEach((ch) => {
                chSelect.append(`<option value="${ch.value}">${ch.text}</option>`);
            });
            parent.append(elem);
            return elem;
        }

        function updateChannelBar(elem, width, label) {
            elem.find('.fill').css('width', width);
            elem.find('.label').text(label);
        }

        const numChannels = (FC.RC.active_channels > 0) ? FC.RC.active_channels : 8;

        const chContainer = $('.tab-receiver .channels');
        const channelElems = [];
        const channelSelect = [];

        for (let i = 0; i < numChannels; i++) {
            const elem = addChannel(chContainer, i18n.getMessage(self.axisNames[i]), self.chNames);
            channelElems.push(elem);
            channelSelect.push(elem.find('.channel_select'));
        }

        const rssiBar = addChannel(chContainer, 'RSSI', self.rssiNames);

        function updateRSSI() {
            const rssi = ((FC.ANALOG.rssi / 1023) * 100).toFixed(0) + '%';
            updateChannelBar(rssiBar, rssi, rssi);
        }

        function updateBars() {
            const meterScaleMin = 750;
            const meterScaleMax = 2250;
            for (let i = 0; i < FC.RC.active_channels; i++) {
                const ch = (i < 8) ? self.rcmap[i] : i;
                const value = FC.RC.channels[i]; // FC.RX_CHANNELS[ch];
                const width = (100 * (value - meterScaleMin) / (meterScaleMax - meterScaleMin)).clamp(0, 100) + '%';
                updateChannelBar(channelElems[i], width, value);
            }
            MSP.send_message(MSPCodes.MSP_ANALOG, false, false, updateRSSI);
        }

        // correct inner label margin on window resize (i don't know how we could do this in css)
        self.resize = function () {
            const containerWidth = $('.meter:first', chContainer).width(),
                  labelWidth = $('.meter .label:first', chContainer).width(),
                  margin = (containerWidth - labelWidth) / 2;
            $('.channels .label').css('margin-left', margin);
        };

        $(window).on('resize', self.resize).resize(); // trigger so labels get correctly aligned on creation


    //// rcmap

        const rcmapElem = $('input[name="rcmap"]');

        function setRcMapGUI() {
            const rcbuf = [];
            for (let axis = 0; axis < self.rcmap.length; axis++) {
                const ch = self.rcmap[axis];
                rcbuf[ch] = self.axisLetters[axis];
                channelSelect[axis].val(ch);
            }
            rcmapElem.val(rcbuf.join(''));
        }

        self.rcmap = FC.RC_MAP;

        setRcMapGUI();

        rcmapElem.on('input', function () {
            const val = rcmapElem.val();
            if (val.length > 8) {
                rcmapElem.val(val.substr(0, 8));
            }
        });

        rcmapElem.on('change', function () {
            const val = rcmapElem.val();

            if (val.length != 8) {
                setRcMapGUI();
                return false;
            }

            const rcvec = val.split('');
            const rcmap = [];

            for (let ch = 0; ch < 8; ch++) {
                const axis = self.axisLetters.indexOf(rcvec[ch]);
                if (axis < 0 || rcvec.slice(0,ch).indexOf(rcvec[ch]) >= 0) {
                    setRcMapGUI();
                    return false;
                }
                rcmap[axis] = ch;
            }

            self.rcmap = rcmap;
            setRcMapGUI();

            return true;
        });

        $('select[name="rcmap_preset"]').val(0);
        $('select[name="rcmap_preset"]').change(function () {
            rcmapElem.val($(this).val()).change();
        });


        // rssi
        const rssi_channel_e = $('select[name="rssi_channel"]');
        rssi_channel_e.append(`<option value="0">${i18n.getMessage("receiverRssiChannelDisabledOption")}</option>`);
        //1-5 reserved for Roll Pitch Yaw Collective Throttle, starting at 6
        for (let i = 6; i < FC.RC.active_channels + 1; i++) {
            rssi_channel_e.append(`<option value="${i}">${i18n.getMessage("controlAxisAux" + (i-5))}</option>`);
        }

        $('select[name="rssi_channel"]').val(FC.RSSI_CONFIG.channel);

        const serialRxSelectElement = $('select.serialRX');
        FC.getSerialRxTypes().forEach((serialRxType, index) => {
            serialRxSelectElement.append(`<option value="${index}">${serialRxType}</option>`);
        });

        serialRxSelectElement.change(function () {
            const serialRxValue = parseInt($(this).val());

            let newValue;
            if (serialRxValue !== FC.RX_CONFIG.serialrx_provider) {
                newValue = $(this).find('option:selected').text();
                updateButtons(true);
            }

            FC.RX_CONFIG.serialrx_provider = serialRxValue;
        });

        // select current serial RX type
        serialRxSelectElement.val(FC.RX_CONFIG.serialrx_provider);

        const serialRxInvertedElement = $('input[name="serialRXInverted"]');
        serialRxInvertedElement.change(function () {
            const inverted = $(this).is(':checked') ? 1 : 0;
            if (FC.RX_CONFIG.serialrx_inverted !== inverted) {
                updateButtons(true);
            }
            FC.RX_CONFIG.serialrx_inverted = inverted;
        });

        serialRxInvertedElement.prop('checked', FC.RX_CONFIG.serialrx_inverted !== 0);

        const serialRxHalfDuplexElement = $('input[name="serialRXHalfDuplex"]');
        serialRxHalfDuplexElement.change(function () {
            const halfduplex = $(this).is(':checked') ? 1 : 0;
            if (FC.RX_CONFIG.serialrx_halfduplex !== halfduplex) {
                updateButtons(true);
            }
            FC.RX_CONFIG.serialrx_halfduplex = halfduplex;
        });

        serialRxHalfDuplexElement.prop('checked', FC.RX_CONFIG.serialrx_halfduplex !== 0);


        updateButtons();

        function updateConfig() {

            FC.RX_CONFIG.stick_max = parseInt($('.sticks input[name="stick_max"]').val());
            FC.RX_CONFIG.stick_center = parseInt($('.sticks input[name="stick_center"]').val());
            FC.RX_CONFIG.stick_min = parseInt($('.sticks input[name="stick_min"]').val());
            FC.RC_DEADBAND_CONFIG.yaw_deadband = parseInt($('.deadband input[name="yaw_deadband"]').val());
            FC.RC_DEADBAND_CONFIG.deadband = parseInt($('.deadband input[name="deadband"]').val());

            FC.RC_MAP = self.rcmap;

            FC.RSSI_CONFIG.channel = parseInt($('select[name="rssi_channel"]').val());
        }

        $("a.sticks").click(function() {
            const windowWidth = 370;
            const windowHeight = 510;

            chrome.app.window.create("/tabs/receiver_msp.html", {
                id: "receiver_msp",
                innerBounds: {
                    minWidth: windowWidth, minHeight: windowHeight,
                    width: windowWidth, height: windowHeight,
                    maxWidth: windowWidth, maxHeight: windowHeight
                },
                alwaysOnTop: true
            }, function(createdWindow) {
                // Give the window a callback it can use to send the channels (otherwise it can't see those objects)
                createdWindow.contentWindow.setRawRx = function(channels) {
                    if (CONFIGURATOR.connectionValid && GUI.active_tab != 'cli') {
                        mspHelper.setRawRx(channels);
                        return true;
                    } else {
                        return false;
                    }
                };

                DarkTheme.isDarkThemeEnabled(function(isEnabled) {
                    windowWatcherUtil.passValue(createdWindow, 'darkTheme', isEnabled);
                });

            });
        });

        self.bindButton = bit_check(FC.CONFIG.targetCapabilities, FC.TARGET_CAPABILITIES_FLAGS.SUPPORTS_RX_BIND);
        updateButtons();

        $("a.bind").click(function() {
            MSP.send_message(MSPCodes.MSP2_BETAFLIGHT_BIND);
            GUI.log(i18n.getMessage('receiverButtonBindMessage'));
        });

        // Only show the MSP control sticks if the MSP Rx feature is enabled
        self.stickButton = FC.FEATURE_CONFIG.features.isEnabled('RX_MSP');

        self.initModelPreview();
        self.renderModel();

        $('.content_wrapper').change(function () {
            self.saveButtons = true;
            updateButtons(true);
        });

        self.save = function(callback) {
            updateConfig();
            save_data(callback);
        };

        self.revert = function(callback) {
            callback();
        };

        $('a.save').click(function () {
            self.save(() => GUI.tab_switch_reload());
        });

        $('a.reboot').click(function () {
            self.save(() => GUI.tab_switch_reload());
        });

        $('a.revert').click(function () {
            self.revert(() => GUI.tab_switch_reload());
        });

        GUI.interval_add('receiver_pull', function () {
            MSP.send_message(MSPCodes.MSP_RC, false, false, updateBars);
        }, 25, false);

        GUI.interval_add('status_pull', function () {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 250, true);

        GUI.content_ready(callback);
    }
};

TABS.receiver.initModelPreview = function () {
    const self = this;

    self.model = new Model($('#canvas_wrapper'), $('#canvas'));
    self.clock = new THREE.Clock();
    self.rateCurve = new RateCurve2();
    self.keepRendering = true;

    self.currentRatesType = FC.RC_TUNING.rates_type;

    self.currentRates = {
        roll_rate:         FC.RC_TUNING.roll_rate,
        pitch_rate:        FC.RC_TUNING.pitch_rate,
        yaw_rate:          FC.RC_TUNING.yaw_rate,
        rc_rate:           FC.RC_TUNING.RC_RATE,
        rc_rate_yaw:       FC.RC_TUNING.rcYawRate,
        rc_expo:           FC.RC_TUNING.RC_EXPO,
        rc_yaw_expo:       FC.RC_TUNING.RC_YAW_EXPO,
        rc_rate_pitch:     FC.RC_TUNING.rcPitchRate,
        rc_pitch_expo:     FC.RC_TUNING.RC_PITCH_EXPO,
        roll_rate_limit:   FC.RC_TUNING.roll_rate_limit,
        pitch_rate_limit:  FC.RC_TUNING.pitch_rate_limit,
        yaw_rate_limit:    FC.RC_TUNING.yaw_rate_limit,
        deadband:          FC.RC_DEADBAND_CONFIG.deadband,
        yawDeadband:       FC.RC_DEADBAND_CONFIG.yaw_deadband,
        superexpo:         true
    };

    switch (self.currentRatesType) {

        case 2:
            self.currentRates.roll_rate     *= 100;
            self.currentRates.pitch_rate    *= 100;
            self.currentRates.yaw_rate      *= 100;
            self.currentRates.rc_rate       *= 1000;
            self.currentRates.rc_rate_yaw   *= 1000;
            self.currentRates.rc_rate_pitch *= 1000;
            self.currentRates.rc_expo       *= 100;
            self.currentRates.rc_yaw_expo   *= 100;
            self.currentRates.rc_pitch_expo *= 100;
            break;

        case 4:
            self.currentRates.roll_rate     *= 1000;
            self.currentRates.pitch_rate    *= 1000;
            self.currentRates.yaw_rate      *= 1000;
            self.currentRates.rc_rate       *= 1000;
            self.currentRates.rc_rate_yaw   *= 1000;
            self.currentRates.rc_rate_pitch *= 1000;
            break;

        case 5:
            self.currentRates.roll_rate     *= 1000;
            self.currentRates.pitch_rate    *= 1000;
            self.currentRates.yaw_rate      *= 1000;
            break;

        default:
            break;
    }

    $(window).on('resize', $.proxy(self.model.resize, self.model));
};

TABS.receiver.renderModel = function () {
    const self = this;

    if (self.keepRendering) {
        requestAnimationFrame(self.renderModel.bind(this));
    }

    if (FC.RC.channels[0] && FC.RC.channels[1] && FC.RC.channels[2]) {
        const delta = self.clock.getDelta();

        const roll = delta * self.rateCurve.rcCommandRawToDegreesPerSecond(
            FC.RC.channels[0],
            self.currentRatesType,
            self.currentRates.roll_rate,
            self.currentRates.rc_rate,
            self.currentRates.rc_expo,
            self.currentRates.superexpo,
            self.currentRates.deadband,
            self.currentRates.roll_rate_limit
        );
        const pitch = delta * self.rateCurve.rcCommandRawToDegreesPerSecond(
            FC.RC.channels[1],
            self.currentRatesType,
            self.currentRates.pitch_rate,
            self.currentRates.rc_rate_pitch,
            self.currentRates.rc_pitch_expo,
            self.currentRates.superexpo,
            self.currentRates.deadband,
            self.currentRates.pitch_rate_limit
        );
        const yaw = delta * self.rateCurve.rcCommandRawToDegreesPerSecond(
            FC.RC.channels[2],
            self.currentRatesType,
            self.currentRates.yaw_rate,
            self.currentRates.rc_rate_yaw,
            self.currentRates.rc_yaw_expo,
            self.currentRates.superexpo,
            self.currentRates.yawDeadband,
            self.currentRates.yaw_rate_limit
        );

        self.model.rotateBy(-degToRad(pitch), -degToRad(yaw), -degToRad(roll));
    }
};

TABS.receiver.cleanup = function (callback) {
    $(window).off('resize', this.resize);

    this.keepRendering = false;

    if (this.model) {
        $(window).off('resize', $.proxy(this.model.resize, this.model));
        this.model.dispose();
    }

    this.isDirty = false;

    if (callback) callback();
};
