'use strict';

const RPMFilter = {

    MAX_NOTCH_COUNT: 16,

    MAIN_MOTOR_NOTCH_COUNT: 1,
    TAIL_MOTOR_NOTCH_COUNT: 0,

    MAIN_ROTOR_NOTCH_COUNT: 4,
    TAIL_ROTOR_NOTCH_COUNT: 4,

    DOUBLE_NOTCH_SEPARATION: 1,


    aboutEQ: function(a,b,tol)
    {
        return Math.abs(a - b) < tol;
    },

    nullNotch: function ()
    {
        return { motor_index: 0, gear_ratio: 0, notch_q: 0, min_hz: 0, max_hz: 0, };
    },

    cloneNotch: function (a)
    {
        return { motor_index: a.motor_index, gear_ratio: a.gear_ratio, notch_q: a.notch_q, min_hz: a.min_hz, max_hz: a.max_hz, };
    },

    compareNotch : function (a, b)
    {
        return( a.motor_index == b.motor_index &&
                a.gear_ratio  == b.gear_ratio &&
                a.notch_q     == b.notch_q &&
                a.min_hz      == b.min_hz &&
                a.max_hz      == b.max_hz );
    },

    isNullNotch : function (a)
    {
        return( a.motor_index == 0 &&
                a.gear_ratio  == 0 &&
                a.notch_q     == 0 &&
                a.min_hz      == 0 &&
                a.max_hz      == 0 );
    },

    eraseNotches : function(bank, index)
    {
        const self = this;

        index.forEach(function (item) {
            bank[item] = self.nullNotch();
        });
    },

    cloneBank : function (a)
    {
        const self = this;
        const copy = [];

        a.forEach(function (notch) {
            copy.push(self.cloneNotch(notch));
        });

        return copy;
    },

    compareBank : function (a, b)
    {
        const self = this;

        for (let i=0; i<self.MAX_NOTCH_COUNT; i++)
            if (!self.compareNotch(a[i],b[i]))
                return false;

        return true;
    },

    isNullBank : function (a)
    {
        const self = this;

        for (let i=0; i<self.MAX_NOTCH_COUNT; i++)
            if (!self.isNullNotch(a[i]))
                return false;

        return true;
    },

    findNotchAt : function(bank, motor, ratio)
    {
        const self = this;

        for (let i=0; i<bank.length; i++) {
            if (bank[i].motor_index == motor && bank[i].gear_ratio == ratio)
                return i;
        }

        return undefined;
    },

    findNotchBetween : function(bank, motor, ratioLow, ratioHigh)
    {
        const self = this;

        //console.log(`findNotchBetween ${motor} ${ratioLow} ${ratioHigh}`);

        for (let i=0; i<bank.length; i++) {
            //console.log(`* [${i}] compare motor:${bank[i].motor_index} ratio:${bank[i].gear_ratio}`);
            if (bank[i].motor_index == motor && bank[i].gear_ratio >= ratioLow && bank[i].gear_ratio <= ratioHigh)
                return i;
        }

        return undefined;
    },

    findSingleNotch : function(bank, motor, ratio)
    {
        const self = this;

        const ratio1 = Math.floor(ratio) - 1;
        const ratio2 = Math.ceil(ratio) + 1;

        const index = self.findNotchBetween(bank, motor, ratio1, ratio2);

        if (index != undefined) {
            console.log(`findSingleNotch ${index} ${motor} ${ratio}`);
            return [index];
        }

        return undefined;
    },

    findDoubleNotch : function(bank, motor, ratio)
    {
        const self = this;

        const index1 = self.findNotchBetween(bank, motor, ratio * 1.001, ratio * 1.05);
        const index2 = self.findNotchBetween(bank, motor, ratio * 0.95, ratio * 0.999);

        if (index1 != undefined && index2 != undefined && index1 != index2)
        {
            if (bank[index1].notch_q == bank[index2].notch_q &&
                bank[index1].min_hz  == bank[index2].min_hz &&
                bank[index1].max_hz  == bank[index2].max_hz) {
                const dist1 = (bank[index1].gear_ratio - ratio) /  ratio;
                const dist2 = (bank[index2].gear_ratio - ratio) / -ratio;

                const separ = self.DOUBLE_NOTCH_SEPARATION / bank[index1].notch_q;

                console.log(`findDoubleNotch ${motor} ${index1}:${dist1} ${index2}:${dist2} ${separ}`);

                if (self.aboutEQ(dist1, separ, 0.0005) && self.aboutEQ(dist2, separ, 0.0005))
                    return [index1, index2];
            }
        }

        return undefined;
    },

    findHarmonic : function(bank, motor, ratio, harm)
    {
        const self = this;

        let index = undefined;

        console.log(`findHarmonic: ${motor} ${ratio} ${harm}`);

        index = self.findDoubleNotch(bank, motor, ratio/harm);
        if (index) {
            const notch = {
                harmonic: harm,
                count: 2,
                notch_q: bank[index[0]].notch_q,
                min_hz: bank[index[0]].min_hz,
                max_hz: bank[index[0]].max_hz,
            };

            self.eraseNotches(bank, index);

            console.log('findHarmonicDouble: ', notch);

            return notch;
        }

        index = self.findSingleNotch(bank, motor, ratio/harm);
        if (index) {
            const notch = {
                harmonic: harm,
                count: 1,
                notch_q: bank[index[0]].notch_q,
                min_hz: bank[index[0]].min_hz,
                max_hz: bank[index[0]].max_hz,
            };

            self.eraseNotches(bank, index);

            console.log('findHarmonicSingle: ', notch);

            return notch;
        }

        return undefined;
    },

    findGlobalMinHz : function(config)
    {


    },

    findGlobalMaxHz : function(config)
    {


    },

    findGlobalMinRPM : function(config)
    {


    },

    findGlobalMaxRPM : function(config)
    {


    },

    generateAdvancedConfig : function(config)
    {
        const self = this;

        const bank = [];




    },

    parseAdvancedConfig : function(rpm_filter)
    {
        const self = this;

        const bank = self.cloneBank(rpm_filter);

        const config = {
            mainMotor: [],
            mainRotor: [],
            tailMotor: [],
            tailRotor: [],
        };

        for (let i=0; i<self.MAIN_ROTOR_NOTCH_COUNT; i++)
            config.mainRotor[i] = this.findHarmonic(bank, self.mainMotor, self.mainGearRatio,  i + 1);

        for (let i=0; i<self.TAIL_ROTOR_NOTCH_COUNT; i++)
            config.tailRotor[i] = this.findHarmonic(bank, self.tailMotor, self.tailGearRatio,  i + 1);


        if (self.mainGearRatio != 1000) {
            for (let i=0; i<self.MAIN_MOTOR_NOTCH_COUNT; i++)
                config.mainMotor[i] = this.findHarmonic(bank, self.mainMotor, 1000,  i + 1);
        }

        if (self.mainMotor != self.tailMotor && self.tailGearRatio != 1000) {
            for (let i=0; i<self.TAIL_MOTOR_NOTCH_COUNT; i++)
                config.tailMotor[i] = this.findHarmonic(bank, self.tailMotor, 1000,  i + 1);
        }

        console.log('Main Motor harmonics: ', config.mainMotor);
        console.log('Main Rotor harmonics: ', config.mainRotor);
        console.log('Tail Motor harmonics: ', config.tailMotor);
        console.log('Tail Rotor harmonics: ', config.tailRotor);

        return config;
    },

    initialize : function (mainMotor, mainGearRatio, tailMotor, tailGearRatio)
    {
        const self = this;

        self.mainMotor = mainMotor;
        self.tailMotor = tailMotor;

        self.mainGearRatio = mainGearRatio * 1000;
        self.tailGearRatio = tailGearRatio * 1000;

        console.log(`main motor: ${mainMotor}`);
        console.log(`main motor ratio: ${mainGearRatio}`);
        console.log(`tail motor: ${tailMotor}`);
        console.log(`tail gear ratio: ${tailGearRatio}`);
    },

};
