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
            .then(() => MSP.promise(MSPCodes.MSP_BOXIDS))
            .then(() => MSP.promise(MSPCodes.MSP_BOXNAMES))
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

        adjBody.attr('id', 'adjustment-' + adjustmentIndex);
        adjBody.data('index', adjustmentIndex);

        adjBody.find('.adjType').attr('name', `adjType${adjustmentIndex}`);

        const enaChannelList = adjBody.find('select.enaChannel');
        enaChannelList.val(adjRange.enaChannel);

        const adjChannelList = adjBody.find('select.adjChannel');
        adjChannelList.val(adjRange.adjChannel);

        const adjFuncList = adjBody.find('select.function');
        adjFuncList.val(adjRange.adjFunction);

        const stepSizeElem = adjBody.find('input.functionStepSize');
        stepSizeElem.val(adjRange.adjStep);

        const minValueElem = adjBody.find('input.functionMinValue');
        minValueElem.val(adjRange.adjMin);

        const maxValueElem = adjBody.find('input.functionMaxValue');
        maxValueElem.val(adjRange.adjMax);

        // configure ranges
        const channelRange = {
                'min': [  900 ],
                'max': [ 2100 ]
            };

        let enaValues = [ 1300, 1700 ];
        if (adjRange.enaRange != undefined) {
            enaValues = [adjRange.enaRange.start, adjRange.enaRange.end];
        }

        let incValues = [ 1800, 1900 ];
        if (adjRange.adjRange2 != undefined) {
            incValues = [adjRange.adjRange2.start, adjRange.adjRange2.end];
        }

        let decValues = [ 1100, 1200 ];
        if (adjRange.adjRange1 != undefined) {
            decValues = [adjRange.adjRange1.start, adjRange.adjRange1.end];
        }

        const enaSlider = adjBody.find('.ena-slider');
        const incSlider = adjBody.find('.inc-slider');
        const decSlider = adjBody.find('.dec-slider');
        const valSlider = adjBody.find('.val-slider');

        enaSlider.noUiSlider({
            start: enaValues,
            behaviour: 'snap-drag',
            margin: 20,
            step: 5,
            connect: true,
            range: channelRange,
            format: wNumb({
                decimals: 0
            })
        });

        incSlider.noUiSlider({
            start: incValues,
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
            start: decValues,
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
            start: decValues,
            behaviour: 'snap-drag',
            margin: 2,
            step: 1,
            connect: true,
            range: channelRange,
            format: wNumb({
                decimals: 0
            })
        });

        enaSlider.Link('lower').to(adjBody.find('.lowerLimitValue'));
        enaSlider.Link('upper').to(adjBody.find('.upperLimitValue'));
        incSlider.Link('lower').to(adjBody.find('.lowerIncValue'));
        incSlider.Link('upper').to(adjBody.find('.upperIncValue'));
        decSlider.Link('lower').to(adjBody.find('.lowerDecValue'));
        decSlider.Link('upper').to(adjBody.find('.upperDecValue'));

        if (false) {
        adjBody.find(".pips-channel-range").noUiSlider_pips({
            mode: 'values',
            values: [ 900, 1000, 1200, 1400, 1500, 1600, 1800, 2000, 2100 ],
            density: 4,
            stepped: true
        });

        // Element visibility
        const enableElement = adjBody.find('input.enable');

        function updateVisibility() {
            const isEnabled = enableElement.is(':checked');
            adjBody.find('.adjActive').prop("disabled", !isEnabled);
            if (isEnabled) {
                adjBody.find('.channel-slider').removeAttr("disabled");
            } else {
                adjBody.find('.channel-slider').attr("disabled", "disabled");
            }
            const stepSize = parseInt(stepSizeElem.val());
            adjBody.find('.IncLimit').toggle(stepSize > 0);
            adjBody.find('.DecLimit').toggle(stepSize > 0);
            adjBody.find('.inc-slider').toggle(stepSize > 0);
            adjBody.find('.ScaleLimit').toggle(stepSize == 0);
        }

        enableElement.change(updateVisibility);

        const isEnabled = (adjRange?.enaRange?.start < adjRange?.enaRange?.end);
        enableElement.prop("checked", isEnabled).change();

        }

        return adjBody;
    }

    function formToData() {

        const totalAdjustmentRangeCount = FC.ADJUSTMENT_RANGES.length;

        FC.ADJUSTMENT_RANGES = [];

        const defaultAdjustmentRange = {
            enaChannel: 0,
            enaRange: {
                start: 1500,
                end: 1500,
            },
            adjRange1: {
                start: 1500,
                end: 1500,
            },
            adjRange2: {
                start: 1500,
                end: 1500,
            },
            adjFunction: 0,
            adjChannel: 0,
            adjStep: 0,
            adjMin: 0,
            adjMax: 0,
        };

        $('.tab-adjustments .adjustments .adjustment').each(function () {
            const adjustmentElement = $(this);

            if (adjustmentElement.find('.enable').prop("checked")) {
                const enaValues = $(this).find('.range .ena-slider').val();
                const incValues = $(this).find('.range .inc-slider').val();
                const decValues = $(this).find('.range .dec-slider').val();
                const adjRange = {
                    enaChannel: parseInt($(this).find('select.enaChannel').val()),
                    enaRange: {
                        start: enaValues[0],
                        end: enaValues[1],
                    },
                    adjRange1: {
                        start: decValues[0],
                        end: decValues[1],
                    },
                    adjRange2: {
                        start: incValues[0],
                        end: incValues[1],
                    },
                    adjFunction: parseInt($(this).find('select.function').val()),
                    adjChannel: parseInt($(this).find('select.adjChannel').val()),
                    adjStep: parseInt($(this).find('input.functionStepSize').val()),
                    adjMin: parseInt($(this).find('input.functionMinValue').val()),
                    adjMax: parseInt($(this).find('input.functionMaxValue').val()),
                };
                FC.ADJUSTMENT_RANGES.push(adjRange);
            } else {
                FC.ADJUSTMENT_RANGES.push(defaultAdjustmentRange);
            }
        });

        for (let index = FC.ADJUSTMENT_RANGES.length; index < totalAdjustmentRangeCount; index++) {
            FC.ADJUSTMENT_RANGES.push(defaultAdjustmentRange);
        }
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
            $('.adjustments .adjustment').each( function () {
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
            formToData();
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

        $('.content_wrapper').change(function () {
            setDirty();
        });

        // enable data pulling
        GUI.interval_add('rc_pull', function () {
            MSP.send_message(MSPCodes.MSP_RC, false, false, update_ui);
        }, 250, true);

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function () {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 500, true);

        GUI.content_ready(callback);
    }
};

TABS.adjustments.cleanup = function (callback) {
    this.isDirty = false;

    if (callback) callback();
};
