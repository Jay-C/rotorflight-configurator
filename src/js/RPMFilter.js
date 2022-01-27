'use strict';

const RPMFilter = {

    NOTCH_COUNT: 16,

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

    eraseNotch : function(bank, index)
    {
        bank[index] = this.nullNotch();
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

        for (let i=0; i<self.NOTCH_COUNT; i++)
            if (!self.compareNotch(a[i],b[i]))
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

        console.log(`findNotchBetween ${motor} ${ratioLow} ${ratioHigh}`);

        for (let i=0; i<bank.length; i++) {
            if (bank[i].motor_index == motor && bank[i].gear_ratio > ratioLow && bank[i].gear_ratio < ratioHigh)
                return i;
        }

        return undefined;
    },

    findSingleNotch : function(bank, motor, ratio)
    {
        const self = this;

        const ratio1 = Math.floor(ratio) - 1;
        const ratio2 = Math.ceil(ratio) + 1;

        console.log(`findSingleNotch ${motor} ${ratio}`);

        return self.findNotchBetween(bank, motor, ratio1, ratio2);
    },

    findDoubleNotch : function(bank, motor, ratio)
    {
        const self = this;

        const index1 = self.findNotchBetween(bank, motor, ratio * 1.001, ratio * 1.05);
        const index2 = self.findNotchBetween(bank, motor, ratio * 0.95, ratio * 0.999);

        if (index1 != undefined && index2 != undefined && index2 == index1 + 1) {
            const dist1 = (bank[index1].gear_ratio - ratio) /  ratio;
            const dist2 = (bank[index2].gear_ratio - ratio) / -ratio;

            console.log(`findDoubleNotch ${motor} ${dist1} ${dist2}`);

            if (bank[index1].notch_q == bank[index2].notch_q &&
                self.aboutEQ(dist1, 0.005, 0.0001) &&
                self.aboutEQ(dist2, 0.005, 0.0001)) {
                return index1;
            }
        }

        return undefined;
    },

    findHarmonic : function(bank, motor, ratio, harm)
    {
        const self = this;

        console.log(`findHarmonic: ${motor} ${ratio} ${harm}`);

        let index = self.findDoubleNotch(bank, motor, ratio/harm);
        if (index != undefined) {
            const notch = {
                harmonic: harm,
                count: 2,
                notch_q: bank[index].notch_q,
                separation: (bank[index].gear_ratio - bank[index + 1].gear_ratio) / (ratio / harm),
                min_hz: bank[index].min_hz,
                max_hz: bank[index].max_hz,
            };

            self.eraseNotch(bank, index);
            self.eraseNotch(bank, index+1);

            console.log('findHarmonicDouble: ', notch);

            return notch;
        }

        index = self.findSingleNotch(bank, motor, ratio/harm);
        if (index != undefined) {
            const notch = {
                harmonic: harm,
                count: 1,
                notch_q: bank[index].notch_q,
                separation: 0,
                min_hz: bank[index].min_hz,
                max_hz: bank[index].max_hz,
            };

            self.eraseNotch(bank, index);

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

    parseAdvancedConfig : function(bank)
    {
        const self = this;

        const notches = self.cloneBank(bank);

        const config = {
            mainMotor: [],
            mainRotor: [],
            tailRotor: [],
        };

        config.mainMotor[1] = this.findHarmonic(notches, self.mainMotor, 1000,  1);

        for (let i=1; i<9; i++)
            config.mainRotor[i] = this.findHarmonic(notches, self.mainMotor, self.mainGearRatio,  i);

        for (let i=1; i<5; i++)
            config.tailRotor[i] = this.findHarmonic(notches, self.tailMotor, self.tailGearRatio,  i);

        console.log('Main Motor harmonics: ', config.mainMotor);
        console.log('Main Rotor harmonics: ', config.mainRotor);
        console.log('Tail Rotor harmonics: ', config.tailRotor);

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
