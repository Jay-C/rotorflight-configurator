'use strict';

TABS.mixer = {
    isDirty: false,
    needSave: false,
    needReboot: false,
    customConfig: false,

    MIXER_CONFIG_dirty: false,
    MIXER_INPUT1_dirty: false,
    MIXER_INPUT2_dirty: false,
    MIXER_INPUT3_dirty: false,
    MIXER_INPUT4_dirty: false,
    MIXER_RULES_dirty: false,

    MIXER_OVERRIDE_MIN: -2500,
    MIXER_OVERRIDE_MAX:  2500,
    MIXER_OVERRIDE_OFF:  2501,

    showOverrides: [ 1,2,4,3, ],

    overrideAttr: [
        { min:-1500, max:1500, step:50,   fixed:0, scale:1.000 },
        { min:-18,   max:18,   step:0.1,  fixed:1, scale:0.012 },
        { min:-18,   max:18,   step:0.1,  fixed:1, scale:0.012 },
        { min:-100,  max:100,  step:1,    fixed:0, scale:0.100 },
        { min:-18,   max:18,   step:0.1,  fixed:1, scale:0.012 },
    ],
};

TABS.mixer.initialize = function (callback) {
    const self = this;

    function setDirty() {
        if (!self.isDirty) {
            self.isDirty = true;
            $('.tab-mixer').removeClass('toolbar_hidden');
        }

        if (self.needReboot) {
            $('.save_btn').hide();
            $('.reboot_btn').show();
        } else {
            $('.save_btn').show();
            $('.reboot_btn').hide();
        }
    }

    load_data(load_html);

    function load_html() {
        $('#content').load("./tabs/mixer.html", process_html);
    }

    function load_data(callback) {
        MSP.promise(MSPCodes.MSP_STATUS)
            .then(() => MSP.promise(MSPCodes.MSP_FEATURE_CONFIG))
            .then(() => MSP.promise(MSPCodes.MSP_MIXER_CONFIG))
            .then(() => MSP.promise(MSPCodes.MSP_MIXER_INPUTS))
            .then(() => MSP.promise(MSPCodes.MSP_MIXER_RULES))
            .then(() => MSP.promise(MSPCodes.MSP_MIXER_OVERRIDE))
            .then(callback);
    }

    function save_data(callback) {
        function send_mixer_config() {
            if (self.MIXER_CONFIG_dirty)
                MSP.send_message(MSPCodes.MSP_SET_MIXER_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_MIXER_CONFIG), false, send_mixer_input1);
            else
                send_mixer_input1();
        }
        function send_mixer_input1() {
            if (self.MIXER_INPUT1_dirty)
                mspHelper.sendMixerInput(1, send_mixer_input2);
            else
                send_mixer_input2();
        }
        function send_mixer_input2() {
            if (self.MIXER_INPUT2_dirty)
                mspHelper.sendMixerInput(2, send_mixer_input3);
            else
                send_mixer_input3();
        }
        function send_mixer_input3() {
            if (self.MIXER_INPUT3_dirty)
                mspHelper.sendMixerInput(3, send_mixer_input4);
            else
                send_mixer_input4();
        }
        function send_mixer_input4() {
            if (self.MIXER_INPUT4_dirty)
                mspHelper.sendMixerInput(4, send_mixer_rules);
            else
                send_mixer_rules();
        }
        function send_mixer_rules() {
            if (self.MIXER_RULES_dirty)
                mspHelper.sendMixerRules(save_eeprom);
            else
                save_eeprom();
        }
        function save_eeprom() {
            if (self.needSave)
                MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, eeprom_saved);
            else
                save_done();
        }
        function eeprom_saved() {
            GUI.log(i18n.getMessage('eepromSaved'));
            self.needSave = false;
            save_done();
        }
        function save_done() {
            self.MIXER_CONFIG_dirty = false;
            self.MIXER_INPUT1_dirty = false;
            self.MIXER_INPUT2_dirty = false;
            self.MIXER_INPUT3_dirty = false;
            self.MIXER_INPUT4_dirty = false;
            self.MIXER_RULES_dirty = false;

            self.isDirty = self.needReboot || self.needSave;

            if (self.needReboot) {
                MSP.send_message(MSPCodes.MSP_SET_REBOOT);
                GUI.log(i18n.getMessage('deviceRebooting'));
                reinitialiseConnection(callback);
            }
            else {
                if (callback) callback();
            }
        }

        send_mixer_config();
    }

    function add_override(inputIndex) {

        const mixerOverride = $('#tab-mixer-templates .mixerOverrideTemplate tr').clone();

        const mixerSlider = mixerOverride.find('.mixerOverrideSlider');
        const mixerEnable = mixerOverride.find('.mixerOverrideEnable input');
        const mixerInput  = mixerOverride.find('.mixerOverrideInput input');

        const attr = self.overrideAttr[inputIndex];

        mixerOverride.attr('class', `mixerOverride${inputIndex}`);
        mixerOverride.find('.mixerOverrideName').text(i18n.getMessage(Mixer.inputNames[inputIndex]));

        mixerInput.attr(attr);

        switch (inputIndex) {
            case 1:
            case 2:
            case 4:
            {
                mixerSlider.noUiSlider({
                    range: {
                        'min': -18,
                        'max':  18,
                    },
                    start: 0,
                    step: 1,
                    behaviour: 'snap-drag',
                });

                mixerOverride.find('.pips-range').noUiSlider_pips({
                    mode: 'values',
                    values: [ -18, -15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15, 18, ],
                    density: 100 / ((18 + 18) / 1),
                    stepped: true,
                    format: wNumb({
                        decimals: 0,
                    }),
                });
            }
            break;

            case 3:
            {
                mixerSlider.noUiSlider({
                    range: {
                        'min': -100,
                        'max':  100,
                    },
                    start: 0,
                    step: 5,
                    behaviour: 'snap-drag',
                });

                mixerOverride.find('.pips-range').noUiSlider_pips({
                    mode: 'values',
                    values: [ -100, -75, -50, -25, 0, 25, 50, 75, 100, ],
                    density: 100 / ((100 + 100) / 5),
                    stepped: true,
                    format: wNumb({
                        decimals: 0,
                    }),
                });
            }
            break;

            default:
            {
                mixerSlider.noUiSlider({
                    range: {
                        'min': -1500,
                        'max':  1500,
                    },
                    start: 0,
                    step: 50,
                    behaviour: 'snap-drag',
                });

                mixerOverride.find('.pips-range').noUiSlider_pips({
                    mode: 'values',
                    values: [ -1500, -1000, -500, 0, 500, 1000, 1500, ],
                    density: 100 / ((1500 + 1500) / 100),
                    stepped: true,
                    format: wNumb({
                        decimals: 0,
                    }),
                });
            }
            break;
        }

        mixerSlider.on('slide', function () {
            mixerInput.val(Number($(this).val()).toFixed(attr.fixed));
        });

        mixerSlider.on('change', function () {
            mixerInput.change();
        });

        mixerInput.change(function () {
            const value = $(this).val();
            mixerSlider.val(value);
            FC.MIXER_OVERRIDE[inputIndex] = Math.round(value / attr.scale);
            mspHelper.sendMixerOverride(inputIndex);
        });

        mixerEnable.change(function () {
            const check = $(this).prop('checked');
            const value = check ? 0 : self.MIXER_OVERRIDE_OFF;

            mixerInput.val(0);
            mixerSlider.val(0);

            mixerInput.prop('disabled', !check);
            mixerSlider.attr('disabled', !check);

            FC.MIXER_OVERRIDE[inputIndex] = value;
            mspHelper.sendMixerOverride(inputIndex);
        });

        let value = FC.MIXER_OVERRIDE[inputIndex];
        let check = (value >= self.MIXER_OVERRIDE_MIN && value <= self.MIXER_OVERRIDE_MAX);

        value *= attr.scale;
        value = (check ? value : 0).toFixed(attr.fixed);

        mixerInput.val(value);
        mixerSlider.val(value);

        mixerInput.prop('disabled', !check);
        mixerSlider.attr('disabled', !check);
        mixerEnable.prop('checked', check);

        $('.mixerOverride tbody').append(mixerOverride);
    }

    function data_to_form() {

        self.origMixerConfig = Mixer.cloneConfig(FC.MIXER_CONFIG);
        self.origMixerInputs = Mixer.cloneInputs(FC.MIXER_INPUTS);
        self.origMixerRules  = Mixer.cloneRules(FC.MIXER_RULES);

        self.isDirty = false;
        self.needSave = false;
        self.needReboot = false;

        self.MIXER_CONFIG_dirty = false;
        self.MIXER_INPUT1_dirty = false;
        self.MIXER_INPUT2_dirty = false;
        self.MIXER_INPUT3_dirty = false;
        self.MIXER_INPUT4_dirty = false;
        self.MIXER_RULES_dirty = false;

        //self.prevRules = Mixer.cloneRules(FC.MIXER_RULES);

        //const mixerRuleOpers   = $('.mixerRuleTemplate #oper');
        //const mixerRuleInputs  = $('.mixerRuleTemplate #input');
        //const mixerRuleOutputs = $('.mixerRuleTemplate #output');

        //Mixer.operNames.forEach(function(name,index) {
        //    mixerRuleOpers.append($(`<option value="${index}">` + i18n.getMessage(name)  + '</option>'));
        //});
        //Mixer.inputNames.forEach(function(name,index) {
        //    mixerRuleInputs.append($(`<option value="${index}">` + i18n.getMessage(name)  + '</option>'));
        //});
        //Mixer.outputNames.forEach(function(name,index) {
        //    mixerRuleOutputs.append($(`<option value="${index}">` + i18n.getMessage(name) + '</options>'));
        //});

        if (!FC.CONFIG.mixerOverrideDisabled) {
            self.showOverrides.forEach(function(index) {
                add_override(index);
            });
            $('.tab-mixer .override').show();
        }
        else {
            $('.tab-mixer .override').hide();
        }

        self.customConfig = false;

        self.customConfig |= (FC.MIXER_INPUTS[1].rate !=  FC.MIXER_INPUTS[2].rate &&
                              FC.MIXER_INPUTS[1].rate != -FC.MIXER_INPUTS[2].rate);

        self.customConfig |= (FC.MIXER_INPUTS[1].max !=  FC.MIXER_INPUTS[2].max);

        self.customConfig |= (FC.MIXER_INPUTS[1].max != -FC.MIXER_INPUTS[1].min);
        self.customConfig |= (FC.MIXER_INPUTS[2].max != -FC.MIXER_INPUTS[2].min);
        self.customConfig |= (FC.MIXER_INPUTS[4].max != -FC.MIXER_INPUTS[4].min);

        if (self.customConfig)
            $('.mixerCustomNote').show();
        else
            $('.mixerCustomNote').hide();

        self.customRules = !Mixer.isNullMixer(FC.MIXER_RULES);

        if (self.customRules)
            $('.mixerRulesNote').show();
        else
            $('.mixerRulsNote').hide();

        const ailDir = (FC.MIXER_INPUTS[1].rate < 0) ? -1 : 1;
        const elevDir = (FC.MIXER_INPUTS[2].rate < 0) ? -1 : 1;
        const collDir = (FC.MIXER_INPUTS[4].rate < 0) ? -1 : 1;

        const collectiveRate = Math.abs(FC.MIXER_INPUTS[4].rate) * 0.1;
        const cyclicRate = Math.abs(FC.MIXER_INPUTS[1].rate) * 0.1;

        const collectiveMax = FC.MIXER_INPUTS[4].max * 0.012;
        const cyclicMax = FC.MIXER_INPUTS[2].max * 0.012;
        const totalMax = FC.MIXER_CONFIG.blade_pitch_limit * 0.012;

        const yawDir = (FC.MIXER_INPUTS[3].rate < 0) ? -1 : 1;
        const yawRate = Math.abs(FC.MIXER_INPUTS[3].rate) * 0.1;
        const yawScale = FC.MIXER_CONFIG.tail_rotor_mode ? 0.1 : 0.024;
        const yawMax = FC.MIXER_INPUTS[3].max * yawScale;
        const yawMin = FC.MIXER_INPUTS[3].min * yawScale;

        const mixerSwashType = $('.tab-mixer #mixerSwashType');

        Mixer.swashTypes.forEach(function(name,index) {
            mixerSwashType.append($(`<option value="${index}">` + i18n.getMessage(name) + '</option>'));
        });

        mixerSwashType.val(FC.MIXER_CONFIG.swash_type);

        //$('.tab-mixer #mixerSwashRing').val(FC.MIXER_CONFIG.swash_ring).change();
        $('.tab-mixer #mixerAileronDirection').val(ailDir).change();
        $('.tab-mixer #mixerElevatorDirection').val(elevDir).change();
        $('.tab-mixer #mixerCollectiveDirection').val(collDir).change();
        $('.tab-mixer #mixerMainRotorDirection').val(FC.MIXER_CONFIG.main_rotor_dir);

        $('.tab-mixer #mixerSwashPhase').val(FC.MIXER_CONFIG.swash_phase * 0.1).change();

        $('.tab-mixer #mixerSwashTrim1').val(FC.MIXER_CONFIG.swash_trim[0]).change();
        $('.tab-mixer #mixerSwashTrim2').val(FC.MIXER_CONFIG.swash_trim[1]).change();
        $('.tab-mixer #mixerSwashTrim3').val(FC.MIXER_CONFIG.swash_trim[2]).change();

        $('.tab-mixer #mixerCyclicCalibration').val(cyclicRate).change();
        $('.tab-mixer #mixerCollectiveCalibration').val(collectiveRate).change();
        $('.tab-mixer #mixerCollectiveLimit').val(collectiveMax).change();
        $('.tab-mixer #mixerCyclicLimit').val(cyclicMax).change();
        $('.tab-mixer #mixerTotalPitchLimit').val(totalMax).change();

        $('.tab-mixer #mixerTailRotorMode').change(function () {
            const val = $(this).val();
            if (val != 0)
                $('.tailRotorMotorized').show();
            else
                $('.tailRotorMotorized').hide();
            if (val == 2)
                $('.mixerBidirNote').show();
            else
                $('.mixerBidirNote').hide();
        });

        $('.tab-mixer #mixerTailRotorMode').val(FC.MIXER_CONFIG.tail_rotor_mode).change();
        $('.tab-mixer #mixerTailRotorDirection').val(yawDir).change();
        $('.tab-mixer #mixerTailRotorCalibration').val(yawRate).change();
        $('.tab-mixer #mixerTailRotorMinYaw').val(yawMin).change();
        $('.tab-mixer #mixerTailRotorMaxYaw').val(yawMax).change();
        $('.tab-mixer #mixerTailMotorIdle').val(FC.MIXER_CONFIG.tail_motor_idle / 10).change();

        $('.tab-mixer .mixerReboot').change(function() {
            FC.MIXER_CONFIG.swash_type = parseInt($('.tab-mixer #mixerSwashType').val());
            FC.MIXER_CONFIG.tail_rotor_mode = parseInt($('.tab-mixer #mixerTailRotorMode').val());

            $('.tab-mixer .mixerConfigTable select').prop('disabled', true);
            $('.tab-mixer .mixerConfigTable input').prop('disabled', true);
            $('.tab-mixer .mixerReboot select').prop('disabled', false);

            self.MIXER_CONFIG_dirty = true;
            self.needReboot = true;
            self.needSave = true;
            setDirty();
        });

        $('.tab-mixer .mixerConfig').change(function() {
            FC.MIXER_CONFIG.main_rotor_dir = parseInt($('.tab-mixer #mixerMainRotorDirection').val());
            FC.MIXER_CONFIG.blade_pitch_limit = $('.tab-mixer #mixerTotalPitchLimit').val() / 0.012;
            FC.MIXER_CONFIG.swash_phase = parseInt($('.tab-mixer #mixerSwashPhase').val() * 10);
            //FC.MIXER_CONFIG.swash_ring = parseInt($('.tab-mixer #mixerSwashRing').val());
            FC.MIXER_CONFIG.swash_trim[0] = parseInt($('.tab-mixer #mixerSwashTrim1').val());
            FC.MIXER_CONFIG.swash_trim[1] = parseInt($('.tab-mixer #mixerSwashTrim2').val());
            FC.MIXER_CONFIG.swash_trim[2] = parseInt($('.tab-mixer #mixerSwashTrim3').val());
            FC.MIXER_CONFIG.tail_motor_idle = $('.tab-mixer #mixerTailMotorIdle').val() * 10;

            self.MIXER_CONFIG_dirty = true;
            self.needSave = true;
            setDirty();

            MSP.send_message(MSPCodes.MSP_SET_MIXER_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_MIXER_CONFIG));
        });

        $('.tab-mixer .mixerInput1').change(function() {
            const aileronDir = $('.tab-mixer #mixerAileronDirection').val();
            const cyclicRate = $('.tab-mixer #mixerCyclicCalibration').val() * 10;
            FC.MIXER_INPUTS[1].rate = cyclicRate * aileronDir;
            FC.MIXER_INPUTS[1].min = -cyclicMax;
            FC.MIXER_INPUTS[1].max =  cyclicMax;

            self.MIXER_INPUT1_dirty = true;
            self.needSave = true;
            setDirty();

            mspHelper.sendMixerInput(1);
        });

        $('.tab-mixer .mixerInput2').change(function() {
            const elevatorDir = $('.tab-mixer #mixerElevatorDirection').val();
            const cyclicRate = $('.tab-mixer #mixerCyclicCalibration').val() * 10;
            FC.MIXER_INPUTS[2].rate = cyclicRate * elevatorDir;
            FC.MIXER_INPUTS[2].min = -cyclicMax;
            FC.MIXER_INPUTS[2].max =  cyclicMax;

            self.MIXER_INPUT2_dirty = true;
            self.needSave = true;
            setDirty();

            mspHelper.sendMixerInput(2);
        });

        $('.tab-mixer .mixerInput3').change(function() {
            const yawDir = $('.tab-mixer #mixerTailRotorDirection').val();
            const yawRate = $('.tab-mixer #mixerTailRotorCalibration').val() * 10;
            const yawMin = $('.tab-mixer #mixerTailRotorMinYaw').val();
            const yawMax = $('.tab-mixer #mixerTailRotorMaxYaw').val();
            const yawScale = FC.MIXER_CONFIG.tail_rotor_mode ? 0.1 : 0.024;
            FC.MIXER_INPUTS[3].rate = yawRate * yawDir;
            FC.MIXER_INPUTS[3].min = yawMin / yawScale;
            FC.MIXER_INPUTS[3].max = yawMax / yawScale;

            self.MIXER_INPUT3_dirty = true;
            self.needSave = true;
            setDirty();

            mspHelper.sendMixerInput(3);
        });

        $('.tab-mixer .mixerInput4').change(function() {
            const collectiveDir = $('.tab-mixer #mixerCollectiveDirection').val();
            const collectiveRate = $('.tab-mixer #mixerCollectiveCalibration').val() * 10;
            const collectiveMax = $('.tab-mixer #mixerCollectiveLimit').val() / 0.012;
            FC.MIXER_INPUTS[4].rate = collectiveRate * collectiveDir;
            FC.MIXER_INPUTS[4].min = -collectiveMax;
            FC.MIXER_INPUTS[4].max =  collectiveMax;

            self.MIXER_INPUT4_dirty = true;
            self.needSave = true;
            setDirty();

            mspHelper.sendMixerInput(4);
        });
    }

    function process_html() {

        // translate to user-selected language
        i18n.localizePage();

        // UI Hooks
        data_to_form();

        // Hide the buttons toolbar
        $('.tab-mixer').addClass('toolbar_hidden');

        self.save = function (callback) {
            save_data(callback);
        };

        self.revert = function (callback) {
            FC.MIXER_CONFIG = self.origMixerConfig;
            FC.MIXER_INPUTS = self.origMixerInputs;

            self.needSave = false;
            self.needReboot = false;

            save_data(callback);
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

         GUI.content_ready(callback);
    }
};

TABS.mixer.cleanup = function (callback) {
    this.isDirty = false;

    if (callback) callback();
};

