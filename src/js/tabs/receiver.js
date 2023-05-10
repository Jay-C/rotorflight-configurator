'use strict';

TABS.receiver = {
    isDirty: false,
    needReboot: false,
    bindButton: false,
    stickButton: false,
    saveButtons: false,
    rcmap: [ 0, 1, 2, 3, 4, 5, 6, 7 ],
    rcmapSize: 8,
    deadband: 0,
    yawDeadband: 0,
    axisLetters: ['A', 'E', 'R', 'C', 'T', '1', '2', '3'],
    axisNames: [
        { value: 0, text: 'controlAxisRoll' },
        { value: 1, text: 'controlAxisPitch' },
        { value: 2, text: 'controlAxisYaw' },
        { value: 3, text: 'controlAxisCollective' },
        { value: 4, text: 'controlAxisThrottle' },
        { value: 5, text: 'controlAxisAux1' },
        { value: 6, text: 'controlAxisAux2' },
        { value: 7, text: 'controlAxisAux3' },
        { value: 8, text: 'controlAxisAux4' },
        { value: 9, text: 'controlAxisAux5' },
        { value: 10, text: 'controlAxisAux6' },
        { value: 11, text: 'controlAxisAux7' },
        { value: 12, text: 'controlAxisAux8' },
        { value: 13, text: 'controlAxisAux9' },
        { value: 14, text: 'controlAxisAux10' },
        { value: 15, text: 'controlAxisAux11' },
        { value: 16, text: 'controlAxisAux12' },
        { value: 17, text: 'controlAxisAux13' },
        { value: 18, text: 'controlAxisAux14' },
        { value: 19, text: 'controlAxisAux15' },
        { value: 20, text: 'controlAxisAux16' },
        { value: 21, text: 'controlAxisAux17' },
        { value: 22, text: 'controlAxisAux18' },
    ],
    rssiOptions: [
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
    rxProtocols: [
        { name: 'CRSF',                 id: 9,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'S.BUS',                id: 2,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'F.PORT',               id: 12,  feature: 'RX_SERIAL',    visible: true, },
        { name: 'DSM/1024',             id: 0,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'DSM/2048',             id: 1,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'DSM/SRXL',             id: 10,  feature: 'RX_SERIAL',    visible: true, },
        { name: 'DSM/SRXL2',            id: 13,  feature: 'RX_SERIAL',    visible: true, },
        { name: 'GHOST',                id: 14,  feature: 'RX_SERIAL',    visible: true, },
        { name: 'SUMD',                 id: 3,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'SUMH',                 id: 4,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'IBUS',                 id: 7,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'XBUS',                 id: 5,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'XBUS/RJ01',            id: 6,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'EXBUS',                id: 8,   feature: 'RX_SERIAL',    visible: true, },
        { name: 'PPM',                  id: 0,   feature: 'RX_PPM',       visible: true, },
        { name: 'MSP',                  id: 0,   feature: 'RX_MSP',       visible: true, },
        // Hidden options
        { name: 'PWM',                  id: 0,   feature: 'RX_PARALLEL_PWM', visible: false, },
        { name: 'CUSTOM',               id: 11,  feature: 'RX_SERIAL',    visible: false, },
        // Unsupported SPI receivers
        { name: 'SPI/CX10',             id: 4,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/CX10A',            id: 5,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/ELRS',             id: 19,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FRSKY D',          id: 8,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FRSKY X',          id: 9,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FRSKY X LBT',      id: 15,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FRSKY X V2',       id: 17,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FRSKY X LBT V2',   id: 18,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FLYSKY',           id: 10,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/FLYSKY 2A',        id: 11,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/H8_3D',            id: 6,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/INAV',             id: 7,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/KN',               id: 12,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/REDPINE',          id: 16,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/SFHSS',            id: 13,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/SYMA X',           id: 2,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/SYMA X5C',         id: 3,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/SPEKTRUM',         id: 14,  feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/V202 250k',        id: 0,   feature: 'RX_SPI',   visible: false, },
        { name: 'SPI/V202 1M',          id: 1,   feature: 'RX_SPI',   visible: false, },
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

        $('input[name="cyclic_deadband"]')
            .val(FC.RC_DEADBAND_CONFIG.deadband)
            .change(function () {
                self.deadband = parseInt($(this).val());
            })
            .change();

        $('input[name="yaw_deadband"]')
            .val(FC.RC_DEADBAND_CONFIG.yaw_deadband)
            .change(function () {
                self.yawDeadband = parseInt($(this).val());
            })
            .change();

        $('input[name="stick_center"]')
            .val(FC.RX_CONFIG.stick_center)
            .change();

        $('input[name="stick_min"]')
            .val(FC.RX_CONFIG.stick_min)
            .change();

        $('input[name="stick_max"]')
            .val(FC.RX_CONFIG.stick_max)
            .change();



    //// RX Mode

        const rxProtoSelectElement = $('select[name="receiverProtocol"]');
        let currentProto = -1;

        self.rxProtocols.forEach((item, index) => {
            let visible = item.visible;
            if (FC.FEATURE_CONFIG.features.isEnabled(item.feature)) {
                if ((item.feature == 'RX_SERIAL' && item.id == FC.RX_CONFIG.serialrx_provider) ||
                    (item.feature == 'RX_SPI' && item.id == FC.RX_CONFIG.rxSpiProtocol) ||
                    (item.feature == 'RX_MSP') ||
                    (item.feature == 'RX_PPM') ||
                    (item.feature == 'RX_PARALLEL_PWM')) {
                        visible = true;
                        currentProto = index;
                }
            }
            if (visible) {
                rxProtoSelectElement.append(`<option value="${index}">${item.name}</option>`);
            }
        });

        rxProtoSelectElement.val(currentProto);

        rxProtoSelectElement.change(function () {
            const index = parseInt($(this).val());

            const proto = self.rxProtocols[index];

            FC.FEATURE_CONFIG.features.setGroup('RX_PROTO', false);
            FC.FEATURE_CONFIG.features.setFeature(proto.feature, true);

            if (proto.feature == 'RX_SERIAL') {
                FC.RX_CONFIG.serialrx_provider = proto.id;
            }
            else if (proto.feature == 'RX_SPI') {
                FC.RX_CONFIG.rxSpiProtocol = proto.id;
            }
        });


    //// Serial options

        const serialRxInvertedElement = $('input[name="serial_inverted"]');
        serialRxInvertedElement.change(function () {
            const inverted = $(this).is(':checked') ? 1 : 0;
            if (FC.RX_CONFIG.serialrx_inverted !== inverted) {
                updateButtons(true);
            }
            FC.RX_CONFIG.serialrx_inverted = inverted;
        });

        serialRxInvertedElement.prop('checked', FC.RX_CONFIG.serialrx_inverted !== 0);

        const serialRxHalfDuplexElement = $('input[name="serial_half_duplex"]');
        serialRxHalfDuplexElement.change(function () {
            const halfduplex = $(this).is(':checked') ? 1 : 0;
            if (FC.RX_CONFIG.serialrx_halfduplex !== halfduplex) {
                updateButtons(true);
            }
            FC.RX_CONFIG.serialrx_halfduplex = halfduplex;
        });

        serialRxHalfDuplexElement.prop('checked', FC.RX_CONFIG.serialrx_halfduplex !== 0);


    //// Channels Bars

        function addChannelBar(parent, name, options) {
            const elem = $('#tab-receiver-templates .receiverBarTemplate table tr').clone();
            elem.find('.name').text(name);
            const chSelect = elem.find('.channel_select');
            if (options) {
                options.forEach((item) => {
                    const text = i18n.getMessage(item.text);
                    chSelect.append(`<option value="${item.value}">${text}</option>`);
                });
            } else {
                chSelect.hide();
            }
            parent.append(elem);
            return elem;
        }

        function updateChannelBar(elem, width, label) {
            elem.find('.fill').css('width', width);
            elem.find('.label').text(label);
        }

        self.rcmapSize = FC.RC_MAP.length;
        self.numChannels = (FC.RC.active_channels > 0) ? FC.RC.active_channels : self.rcmapSize;

        const chContainer = $('.tab-receiver .channels');

        const channelElems = [];
        const channelSelect = [];

        for (let ch = 0; ch < self.numChannels; ch++) {
            if (ch < self.rcmapSize) {
                const elem = addChannelBar(chContainer, `CH${ch + 1}`, self.axisNames.slice(0, self.rcmapSize));
                channelElems.push(elem);

                const chsel = elem.find('.channel_select');
                channelSelect.push(chsel);

                chsel.change(function () {
                    const newAxis = parseInt(chsel.val());
                    const oldAxis = self.rcmap[ch];
                    const hc = self.rcmap.indexOf(newAxis);

                    self.rcmap[hc] = oldAxis;
                    self.rcmap[ch] = newAxis;

                    console.log(self.rcmap);

                    setRcMapGUI();
                });
            }
            else {
                const options = [ self.axisNames[ch] ];
                const elem = addChannelBar(chContainer, `CH${ch + 1}`, options);
                channelElems.push(elem);

                const chsel = elem.find('.channel_select');
                chsel.prop('disabled', true);
            }
        }


    //// RSSI

        // RSSI bar
        const rssiBar = addChannelBar(chContainer, 'RSSI', self.rssiOptions);
        const rssiSelect = rssiBar.bind('.channel_select');

        rssiSelect.change(function() {
            const value = rssiSelect.val();
            // FIXME
            FC.RSSI_CONFIG.channel = value;
        });

        function updateRSSI() {
            const rssi = ((FC.ANALOG.rssi / 1023) * 100).toFixed(0) + '%';
            updateChannelBar(rssiBar, rssi, rssi);
        }


    //// RX Channels

        function updateRcData() {
            MSP.send_message(MSPCodes.MSP_ANALOG, false, false, updateRSSI);
        }

        function updateBars() {
            const meterScaleMin = 750;
            const meterScaleMax = 2250;
            for (let ch = 0; ch < FC.RC.active_channels; ch++) {
                const value = FC.RX_CHANNELS[ch];
                const width = (100 * (value - meterScaleMin) / (meterScaleMax - meterScaleMin)).clamp(0, 100) + '%';
                updateChannelBar(channelElems[ch], width, value);
            }
            MSP.send_message(MSPCodes.MSP_RC, false, false, updateRcData);
        }

        // correct inner label margin on window resize (i don't know how we could do this in css)
        self.resize = function () {
            const containerWidth = $('.meter:first', chContainer).width(),
                labelWidth = $('.meter .label:first', chContainer).width(),
                margin = (containerWidth - labelWidth) / 2;
            $('.channels .label').css('margin-left', margin);
        };

        $(window).on('resize', self.resize).resize(); // trigger so labels get correctly aligned on creation


    //// RCMAP

        const rcmapInput = $('input[name="rcmap"]');
        const rcmapPreset = $('select[name="rcmap_preset"]');

        rcmapPreset.val(0);

        function setRcMapGUI() {
            const rcbuf = [];
            for (let ch = 0; ch < self.rcmapSize; ch++) {
                const axis = self.rcmap[ch];
                rcbuf[ch] = self.axisLetters[axis];
                channelSelect[ch].val(axis);
            }
            rcmapInput.val(rcbuf.join(''));
        }

        rcmapInput.on('input', function () {
            const val = rcmapInput.val();
            if (val.length > self.rcmapSize) {
                rcmapInput.val(val.substring(0, self.rcmapSize));
            }
        });

        rcmapInput.on('change', function () {
            const val = rcmapInput.val();

            if (val.length != self.rcmapSize) {
                setRcMapGUI();
                return false;
            }

            const rcvec = val.split('');
            const rcmap = [];

            for (let ch = 0; ch < self.rcmapSize; ch++) {
                const letter = rcvec[ch];
                const axis = self.axisLetters.indexOf(letter);
                if (axis < 0 || rcvec.slice(0,ch).indexOf(letter) >= 0) {
                    setRcMapGUI();
                    return false;
                }
                rcmap[ch] = axis;
            }

            self.rcmap = rcmap;
            setRcMapGUI();

            return true;
        });

        rcmapPreset.on('change', function () {
            rcmapInput.val(rcmapPreset.val()).change();
            rcmapPreset.val(0);
        });

        self.rcmap = FC.RC_MAP;


    //// Virtual Stick

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

        // Only show the MSP control sticks if the MSP Rx feature is enabled
        self.stickButton = FC.FEATURE_CONFIG.features.isEnabled('RX_MSP');


    //// Bind button

        self.bindButton = bit_check(FC.CONFIG.targetCapabilities, FC.TARGET_CAPABILITIES_FLAGS.SUPPORTS_RX_BIND);
        updateButtons();

        $("a.bind").click(function() {
            MSP.send_message(MSPCodes.MSP2_BETAFLIGHT_BIND);
            GUI.log(i18n.getMessage('receiverButtonBindMessage'));
        });


    //// Update data

        function updateConfig() {

            FC.RX_CONFIG.stick_center = parseInt($('.sticks input[name="stick_center"]').val());

            FC.RX_CONFIG.stick_max = parseInt($('.sticks input[name="stick_max"]').val());
            FC.RX_CONFIG.stick_min = parseInt($('.sticks input[name="stick_min"]').val());

            FC.RC_DEADBAND_CONFIG.deadband = self.deadband;
            FC.RC_DEADBAND_CONFIG.yaw_deadband = self.yawDeadband;

            FC.RC_MAP = self.rcmap;
        }


    //// Main GUI

        setRcMapGUI();
        updateButtons();

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
            MSP.send_message(MSPCodes.MSP_RX_CHANNELS, false, false, updateBars);
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
