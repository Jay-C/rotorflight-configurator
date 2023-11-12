'use strict';

TABS.adjustments = {
    isDirty: false,

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
        mspHelper.sendAdjustmentRanges(eeprom_write);

        function eeprom_write() {
            MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
                GUI.log(i18n.getMessage('eepromSaved'));
                if (callback) callback();
            });
        }
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

        adjBody.find('.adjTypeOptionInput').attr('name', `adjTypeOptionInput${adjustmentIndex}`);

        const channelRange = {
            'min': [  900 ],
            'max': [ 2100 ]
        };

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

        incSlider.noUiSlider({
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

        decSlider.noUiSlider({
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

        valSlider.noUiSlider({
            start: [ 1500, 1600 ],
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
            values: [ 900, 1000, 1200, 1400, 1500, 1600, 1800, 2000, 2100 ],
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
            const value = enaSlider.val();
            adjRange.enaRange.start = value[0];
            adjRange.enaRange.end = value[1];
            enaMinInput.val(value[0]);
            enaMaxInput.val(value[1]);
        });

        function enaChange() {
            adjRange.enaRange.start = enaMinInput.val();
            adjRange.enaRange.end = enaMaxInput.val();
            enaSlider.val([adjRange.enaRange.start, adjRange.enaRange.end]);
        }
        enaMinInput.on('change', enaChange);
        enaMaxInput.on('change', enaChange);

        decSlider.on('slide', function() {
            const value = decSlider.val();
            adjRange.adjRange1.start = value[0];
            adjRange.adjRange1.end = value[1];
            decMinInput.val(value[0]);
            decMaxInput.val(value[1]);
        });

        function decChange() {
            adjRange.adjRange1.start = decMinInput.val();
            adjRange.adjRange1.end = decMaxInput.val();
            decSlider.val([adjRange.adjRange1.start, adjRange.adjRange1.end]);
        }
        decMinInput.on('change', decChange);
        decMaxInput.on('change', decChange);

        incSlider.on('slide', function() {
            const value = incSlider.val();
            adjRange.adjRange2.start = value[0];
            adjRange.adjRange2.end = value[1];
            incMinInput.val(value[0]);
            incMaxInput.val(value[1]);
        });

        function incChange() {
            adjRange.adjRange2.start = incMinInput.val();
            adjRange.adjRange2.end = incMaxInput.val();
            incSlider.val([adjRange.adjRange2.start, adjRange.adjRange2.end]);
        }
        incMinInput.on('change', incChange);
        incMaxInput.on('change', incChange);

        valSlider.on('slide', function() {
            const value = valSlider.val();
            adjRange.adjMin = value[0];
            adjRange.adjMax = value[1];
            funcMinInput.val(value[0]);
            funcMaxInput.val(value[1]);
        });

        function funcChange() {
            adjRange.adjMin = funcMinInput.val();
            adjRange.adjMax = funcMaxInput.val();
            valSlider.val([adjRange.adjMin, adjRange.adjMax]);
        }
        funcMinInput.on('change', funcChange);
        funcMaxInput.on('change', funcChange);

        funcStepInput.on('change', function () {
            adjRange.adjStep = funcStepInput.val();
        });

        var adjType = 0;
        if (adjRange.adjFunction > 0) {
            if (adjRange.adjStep > 0) {
                adjType = 2;
            }
            else {
                adjType = 1;
            }
        }

        const adjOffElem = adjBody.find('#adjOff');
        const adjMappedElem = adjBody.find('#adjMapped');
        const adjSteppedElem = adjBody.find('#adjStepped');

        adjOffElem.prop('checked', adjType == 0);
        adjMappedElem.prop('checked', adjType == 1);
        adjSteppedElem.prop('checked', adjType == 2);

        function updateVisibility(initial) {
            const adjOff = adjOffElem.prop('checked');
            const adjMapped = adjMappedElem.prop('checked');
            const adjStepped = adjSteppedElem.prop('checked');

            if (adjOff) {
                adjBody.find('.adj-slider').attr("disabled", "disabled");
                funcSelect.val(0);
                adjBody.find('.marker').hide();
            } else {
                adjBody.find('.adj-slider').removeAttr("disabled");
                adjBody.find('.marker').show();
            }

            if (adjMapped) {
                funcStepInput.val(0).trigger('change');
            }

            adjBody.find('.input-element').prop('disabled', adjOff);
            adjBody.find('.stepped-only').toggle(adjStepped);
            adjBody.find('.mapped-only').toggle(adjMapped);
        }
        adjBody.find('.adjTypeOptionInput').on('change', updateVisibility);

        updateVisibility(true);

        return adjBody;
    }

    function dataToForm() {
        const selectFunction = $('#tab-adjustments-templates .adjustmentBody select.function');
        self.FUNCTIONS.forEach(function(value, key) {
            selectFunction.append(new Option(i18n.getMessage('adjustmentsFunction' + value), key));
        });

        const channelList = $('#tab-adjustments-templates .adjustmentBody select.channel');
        let autoOption = new Option(i18n.getMessage('auxiliaryAutoChannelSelect'), -1);
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

    function process_html() {

        // translate to user-selected language
        i18n.localizePage();

        // UI Hooks
        dataToForm();

        // Hide the buttons toolbar
        $('.tab-adjustments').addClass('toolbar_hidden');

        self.isDirty = false;

        function update_markers() {
            $('.tab-adjustments .adjustment').each( function () {
                const enaChannelIndex = $(this).find('.enaChannel').val() + self.PRIMARY_CHANNEL_COUNT;
                const enaChannelPos = FC.RC.channels[enaChannelIndex].clamp(900, 2100);
                const enaPercentage = (enaChannelPos - 900) / (2100-900) * 100;
                $(this).find('.enaMarker').css('left', enaPercentage + '%');

                const adjChannelIndex = $(this).find('.adjChannel').val() + self.PRIMARY_CHANNEL_COUNT;
                const adjChannelPos = FC.RC.channels[adjChannelIndex].clamp(900, 2100);
                const adjPercentage = (adjChannelPos - 900) / (2100-900) * 100;
                $(this).find('.adjMarker').css('left', adjPercentage + '%');
            });
        }

        function auto_select_channel() {

            const auto_option = $('.tab-adjustments select.channel option[value="-1"]:selected');

            if (auto_option.length > 0) {
                const RCchannels = FC.RC.channels.slice(self.PRIMARY_CHANNEL_COUNT, FC.RC.active_channels);
                if (self.RCchannels) {
                    let channel = -1;
                    let chDelta = 100;
                    for (let index = 0; index < RCchannels.length; index++) {
                        let delta = Math.abs(RCchannels[index] - self.RCchannels[index]);
                        if (delta > chDelta) {
                            channel = index;
                            chDelta = delta;
                        }
                    }
                    if (channel != -1) {
                        auto_option.parent().val(channel);
                        self.RCchannels = null;
                    }
                } else {
                    self.RCchannels = RCchannels;
                }
            } else {
                self.RCchannels = null;
            }
        }

        function update_ui() {
            auto_select_channel();
            update_markers();
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

        if (false) {

        // enable data pulling
        GUI.interval_add('rc_pull', function () {
            MSP.send_message(MSPCodes.MSP_RC, false, false, update_ui);
        }, 250, true);

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function () {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 500, true);

        }

        GUI.content_ready(callback);
    }
};

TABS.adjustments.cleanup = function (callback) {
    this.isDirty = false;

    if (callback) callback();
};
