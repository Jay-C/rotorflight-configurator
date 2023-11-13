'use strict';

TABS.adjustments = {
    isDirty: false,

    AUX_MIN: 875,
    AUX_MAX: 2125,

    ALWAYS_ON_CH: 255,

    PRIMARY_CHANNEL_COUNT: 5,

    FUNCTIONS: [
        'None',
        'RateProfile',
        'PIDProfile',
        'LEDProfile',
        'OSDProfile',
        'PitchRate',
        'RollRate',
        'YawRate',
        'PitchRCRate',
        'RollRCRate',
        'YawRCRate',
        'PitchRCExpo',
        'RollRCExpo',
        'YawRCExpo',
        'PitchP',
        'PitchI',
        'PitchD',
        'PitchF',
        'RollP',
        'RollI',
        'RollD',
        'RollF',
        'YawP',
        'YawI',
        'YawD',
        'YawF',
        'YawCWStopGain',
        'YawCCWStopGain',
        'YawCyclicFF',
        'YawCollectiveFF',
        'YawCollectiveDyn',
        'YawCollectiveDecay',
        'PitchCollectiveFF',
        'PitchGyroCutoff',
        'RollGyroCutoff',
        'YawGyroCutoff',
        'PitchDtermCutoff',
        'RollDtermCutoff',
        'YawDtermCutoff',
        'RescueClimbCollective',
        'RescueHoverCollective',
        'RescueHoverAltitude',
        'RescueAltP',
        'RescueAltI',
        'RescueAltD',
        'AngleLevelGain',
        'HorizonLevelGain',
        'AcroTrainerGain',
        'GovernorGain',
        'GovernorP',
        'GovernorI',
        'GovernorD',
        'GovernorF',
        'GovernorTTA',
        'GovernorCyclicFF',
        'GovernorCollectiveFF',
        'PitchB',
        'RollB',
        'YawB',
        'PitchO',
        'RollO',
        'CrossCouplingGain',
        'CrossCouplingRatio',
        'CrossCouplingCutoff',
    ],
};

TABS.adjustments.initialize = function (callback) {
    const self = this;

    load_data(load_html);

    function load_html() {
        $('#content').load("./tabs/adjustments.html", process_html);
    }

    function load_data(callback) {
        Promise.resolve(true)
            .then(() => MSP.promise(MSPCodes.MSP_STATUS))
            .then(() => MSP.promise(MSPCodes.MSP_RC))
            .then(() => MSP.promise(MSPCodes.MSP_ADJUSTMENT_RANGES))
            .then(callback);
    }

    function save_data(callback) {
        var index = 0;

        function save_range() {
            if (index < FC.ADJUSTMENT_RANGES.length) {
                if (FC.ADJUSTMENT_RANGES[index].dirty) {
                    FC.ADJUSTMENT_RANGES[index].dirty = false;
                    mspHelper.sendAdjustmentRange(index++, save_range);
                }
                else {
                    index++;
                    save_range();
                }
            } else {
                MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
                    GUI.log(i18n.getMessage('eepromSaved'));
                    callback?.();
                });
            }
        }

        save_range();
    }

    function setDirty() {
        if (!self.isDirty) {
            self.isDirty = true;
            $('.tab-adjustments').removeClass('toolbar_hidden');
        }
    }

    function newAdjustment(adjustmentIndex) {

        const adjBody = $('#tab-adjustments-templates .adjustmentBody').clone();
        const adjRange = FC.ADJUSTMENT_RANGES[adjustmentIndex];

        adjRange.dirty = false;

        var adjType = 0;
        if (adjRange.adjFunction > 0) {
            if (adjRange.adjStep > 0)
                adjType = 2;
            else
                adjType = 1;
        }

        adjBody.attr('data', adjRange);

        adjBody.find('.adjTypeOptionInput').attr('name', `adjTypeOptionInput${adjustmentIndex}`);

        const channelRange = {
            'min': [ self.AUX_MIN ],
            'max': [ self.AUX_MAX ]
        };

        const channelPips = [ 900, 1000, 1200, 1400, 1500, 1600, 1800, 2000, 2100 ];

        const enaSlider = adjBody.find('.ena-slider');
        const incSlider = adjBody.find('.inc-slider');
        const decSlider = adjBody.find('.dec-slider');
        const valSlider = adjBody.find('.val-slider');

        enaSlider.noUiSlider({
            start: [ adjRange.enaRange.start, adjRange.enaRange.end ],
            behaviour: 'snap-drag',
            margin: 10,
            step: 5,
            connect: true,
            range: channelRange,
            format: wNumb({
                decimals: 0
            })
        });

        decSlider.noUiSlider({
            start: [ adjRange.adjRange1.start, adjRange.adjRange1.end ],
            behaviour: 'snap-drag',
            margin: 10,
            step: 5,
            connect: true,
            range: channelRange,
            format: wNumb({
                decimals: 0
            })
        });

        incSlider.noUiSlider({
            start: [ adjRange.adjRange2.start, adjRange.adjRange2.end ],
            behaviour: 'snap-drag',
            margin: 10,
            step: 5,
            connect: true,
            range: channelRange,
            format: wNumb({
                decimals: 0
            })
        });

        valSlider.noUiSlider({
            start: [ adjRange.adjMin, adjRange.adjMax ],
            behaviour: 'snap-drag',
            margin: 1,
            step: 1,
            connect: true,
            range: channelRange,
            format: wNumb({
                decimals: 0
            })
        });

        adjBody.find(".pips-channel-range").noUiSlider_pips({
            mode: 'values',
            values: channelPips,
            density: 4,
            stepped: true
        });

        const enaChannelList = adjBody.find('select.enaChannel');
        enaChannelList.val(adjRange.enaChannel);

        const adjChannelList = adjBody.find('select.adjChannel');
        adjChannelList.val(adjRange.adjChannel);

        const adjFuncList = adjBody.find('select.function');
        adjFuncList.val(adjRange.adjFunction);

        const enaMinInput = adjBody.find('.lowerEnaValue');
        enaMinInput.val(adjRange.enaRange.start);

        const enaMaxInput = adjBody.find('.upperEnaValue');
        enaMaxInput.val(adjRange.enaRange.end);

        const decMinInput = adjBody.find('.lowerDecValue');
        decMinInput.val(adjRange.adjRange1.start);

        const decMaxInput = adjBody.find('.upperDecValue');
        decMaxInput.val(adjRange.adjRange1.end);

        const incMinInput = adjBody.find('.lowerIncValue');
        incMinInput.val(adjRange.adjRange2.start);

        const incMaxInput = adjBody.find('.upperIncValue');
        incMaxInput.val(adjRange.adjRange2.end);

        const funcMinInput = adjBody.find('.functionMinValue');
        funcMinInput.val(adjRange.adjMin);

        const funcMaxInput = adjBody.find('.functionMaxValue');
        funcMaxInput.val(adjRange.adjMax);

        const funcStepInput = adjBody.find('.functionStepSize');
        funcStepInput.val(adjRange.adjStep);

        const funcSelect = adjBody.find('.function');
        funcSelect.val(adjRange.adjFunction);

        enaSlider.on('slide', function() {
            const range = enaSlider.val();
            adjRange.dirty = true;
            adjRange.enaRange.start = range[0];
            adjRange.enaRange.end = range[1];
            enaMinInput.val(range[0]);
            enaMaxInput.val(range[1]);
        });

        function enaChange() {
            adjRange.dirty = true;
            adjRange.enaRange.start = enaMinInput.val();
            adjRange.enaRange.end = enaMaxInput.val();
            enaSlider.val([adjRange.enaRange.start, adjRange.enaRange.end]);
        }
        enaMinInput.on('change', enaChange);
        enaMaxInput.on('change', enaChange);

        decSlider.on('slide', function() {
            const range = decSlider.val();
            adjRange.dirty = true;
            adjRange.adjRange1.start = range[0];
            adjRange.adjRange1.end = range[1];
            decMinInput.val(range[0]);
            decMaxInput.val(range[1]);
        });

        function decChange() {
            adjRange.dirty = true;
            adjRange.adjRange1.start = decMinInput.val();
            adjRange.adjRange1.end = decMaxInput.val();
            decSlider.val([adjRange.adjRange1.start, adjRange.adjRange1.end]);
        }
        decMinInput.on('change', decChange);
        decMaxInput.on('change', decChange);

        incSlider.on('slide', function() {
            const range = incSlider.val();
            adjRange.dirty = true;
            adjRange.adjRange2.start = range[0];
            adjRange.adjRange2.end = range[1];
            incMinInput.val(range[0]);
            incMaxInput.val(range[1]);
        });

        function incChange() {
            adjRange.dirty = true;
            adjRange.adjRange2.start = incMinInput.val();
            adjRange.adjRange2.end = incMaxInput.val();
            incSlider.val([adjRange.adjRange2.start, adjRange.adjRange2.end]);
        }
        incMinInput.on('change', incChange);
        incMaxInput.on('change', incChange);

        valSlider.on('slide', function() {
            const range = valSlider.val();
            adjRange.dirty = true;
            adjRange.adjMin = range[0];
            adjRange.adjMax = range[1];
            funcMinInput.val(range[0]);
            funcMaxInput.val(range[1]);
        });

        function valChange() {
            adjRange.dirty = true;
            adjRange.adjMin = funcMinInput.val();
            adjRange.adjMax = funcMaxInput.val();
            valSlider.val([adjRange.adjMin, adjRange.adjMax]);
        }
        funcMinInput.on('change', valChange);
        funcMaxInput.on('change', valChange);

        funcStepInput.on('change', function () {
            adjRange.dirty = true;
            adjRange.adjStep = funcStepInput.val();
        });

        funcSelect.on('change', function () {
            adjRange.dirty = true;
            adjRange.adjFunction = funcSelect.val();
        });

        enaChannelList.on('change', function () {
            const channel = enaChannelList.val();
            adjRange.dirty = true;
            adjRange.enaChannel = channel;
        });

        adjChannelList.on('change', function () {
            const channel = adjChannelList.val();
            adjRange.dirty = true;
            adjRange.adjChannel = channel;
        });

        const adjTypeElems = adjBody.find('.adjTypeOptionInput');

        adjTypeElems.filter(`[value="${adjType}"]`).prop('checked', true);

        function updateVisibility(event) {
            const adjType = adjTypeElems.filter(':checked').val();

            if (adjType == 0) {
                adjBody.find('.adj-slider').attr("disabled", "disabled");
                if (adjRange.function > 0) {
                    funcSelect.val(0).trigger('change');
                }
            } else {
                adjBody.find('.adj-slider').removeAttr("disabled");
            }

            if (adjType == 0 || adjRange.enaChannel == self.ALWAYS_ON_CH)
                adjBody.find('.ena-slider').attr("disabled", "disabled");
            else
                adjBody.find('.ena-slider').removeAttr("disabled");

            if (adjType == 1 && adjRange.adjStep != 0) {
                funcStepInput.val(0).trigger('change');
            }
            else if (adjType == 2 && adjRange.adjStep == 0) {
                funcStepInput.val(1).trigger('change');
            }

            adjBody.find('.input-element').prop('disabled', adjType == 0);
            adjBody.find('.enaChannelRanges input').prop('disabled', adjType == 0 || adjRange.enaChannel == self.ALWAYS_ON_CH);

            adjBody.find('.mapped-only').toggle(adjType == 1);
            adjBody.find('.stepped-only').toggle(adjType == 2);

            adjBody.find('.enaMarker').toggle(adjType > 0 && adjRange.enaChannel != self.ALWAYS_ON_CH);
            adjBody.find('.adjMarker').toggle(adjType > 0);
            adjBody.find('.valMarker').toggle(adjType == 1);
        }

        adjTypeElems.on('change', updateVisibility);
        enaChannelList.on('change', updateVisibility);

        updateVisibility();

        return adjBody;
    }

    function initAdjustments() {
        const selectFunction = $('#tab-adjustments-templates .adjustmentBody select.function');
        self.FUNCTIONS.forEach(function(value, key) {
            selectFunction.append(new Option(i18n.getMessage('adjustmentsFunction' + value), key));
        });

        const enaChannel = $('#tab-adjustments-templates .adjustmentBody select.enaChannel');
        const alwaysOption = new Option(i18n.getMessage('auxiliaryAlwaysChannelSelect'), self.ALWAYS_ON_CH);
        enaChannel.append(alwaysOption);

        const channelList = $('#tab-adjustments-templates .adjustmentBody select.channel');
        const autoOption = new Option(i18n.getMessage('auxiliaryAutoChannelSelect'), -1);
        channelList.append(autoOption);

        const auxChannelCount = FC.RC.active_channels - self.PRIMARY_CHANNEL_COUNT;
        for (let index = 0; index < auxChannelCount; index++) {
            const option = new Option(`AUX${index + 1}`, index);
            channelList.append(option);
        }

        const adjTable = $('.tab-adjustments table.adjustments');
        for (let index = 0; index < FC.ADJUSTMENT_RANGES.length; index++) {
            adjTable.append(newAdjustment(index));
        }
    }

    function update_markers() {
        $('.tab-adjustments .adjustment').each( function () {
            const enaChannelInput = $(this).find('.enaChannel').val();
            if (enaChannelInput >= 0 && enaChannelInput < self.ALWAYS_ON_CH) {
                const enaChannelIndex = enaChannelInput + self.PRIMARY_CHANNEL_COUNT;
                const enaChannelPos = FC.RC.channels[enaChannelIndex ].clamp(self.AUX_MIN, self.AUX_MAX);
                const enaPercentage = (enaChannelPos - self.AUX_MIN) / (self.AUX_MAX-self.AUX_MIN) * 100;
                $(this).find('.enaMarker').css('left', enaPercentage + '%');
                $(this).find('.ena-channel-value').val(enaChannelPos);
            }

            const adjChannelInput = $(this).find('.adjChannel').val();
            if (adjChannelInput >= 0) {
                const adjChannelIndex = adjChannelInput + self.PRIMARY_CHANNEL_COUNT;
                const adjChannelPos = FC.RC.channels[adjChannelIndex].clamp(self.AUX_MIN, self.AUX_MAX);
                const adjPercentage = (adjChannelPos - self.AUX_MIN) / (self.AUX_MAX-self.AUX_MIN) * 100;
                $(this).find('.adjMarker').css('left', adjPercentage + '%');
                $(this).find('.adj-channel-value').val(adjChannelPos);
            }
        });
    }

    function auto_select_channel() {
        const auto_option = $('.tab-adjustments select.channel option[value="-1"]:selected');
        if (auto_option.length > 0) {
            const RCchannels = FC.RC.channels.slice(self.PRIMARY_CHANNEL_COUNT, FC.RC.active_channels);
            if (self.RCchannels) {
                let channel = undefined;
                let chDelta = 100;
                for (let index = 0; index < RCchannels.length; index++) {
                    let delta = Math.abs(RCchannels[index] - self.RCchannels[index]);
                    if (delta > chDelta) {
                        channel = index;
                        chDelta = delta;
                    }
                }
                if (channel !== undefined) {
                    auto_option.parent().val(channel).trigger('change');
                    self.RCchannels = null;
                }
            } else {
                self.RCchannels = RCchannels;
            }
        } else {
            self.RCchannels = null;
        }
    }

    function process_html() {

        // translate to user-selected language
        i18n.localizePage();

        // Create UI
        initAdjustments();

        // Hide the buttons toolbar
        $('.tab-adjustments').addClass('toolbar_hidden');

        self.isDirty = false;

        function update_ui() {
            update_markers();
            auto_select_channel();
        }

        self.save = function (callback) {
            save_data(callback);
        };

        self.revert = function (callback) {
            callback();
        };

        $('a.save').click(function () {
            self.save(() => GUI.tab_switch_reload());
        });

        $('a.revert').click(function () {
            self.revert(() => GUI.tab_switch_reload());
        });

        $('.content_wrapper').on('change', function () {
            setDirty();
        });

        GUI.interval_add('rc_pull', function () {
            MSP.send_message(MSPCodes.MSP_RC, false, false, update_ui);
        }, 250, true);

        GUI.content_ready(callback);
    }
};

TABS.adjustments.cleanup = function (callback) {
    this.isDirty = false;

    if (callback) callback();
};
