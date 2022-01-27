'use strict';

const RPMFilter = {

    NOTCH_COUNT: 16,

    aboutEQ: function(a,b,tol)
    {
        return (Math.abs(a - b) < a * tol);
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

    deleteNotch : function(bank, a)
    {
        if (a != undefined)
            bank[a] = undefined;
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

        return self.findNotchBetween(bank, motor, ratio1, ratio2);
    },

    findDoubleNotch : function(bank, motor, ratio)
    {
        const self = this;

        const index1 = self.findNotchBetween(bank, motor, ratio * 0.95, ratio * 0.999);
        const index2 = self.findNotchBetween(bank, motor, ratio * 1.001, ratio * 1.05);

        if (index1 != undefined && index2 != undefined && index2 == index1 + 1) {
            const dist1 = (ratio - bank[index1].gear_ratio) / ratio;
            const dist2 = (bank[index2].gear_ratio - ratio) / ratio;

            if (bank[index1].notch_q == bank[index2].notch_q) {
                return index1;
            }
        }
        
        return undefined;
    },

    findHarmonic : function(bank, motor, ratio, harm)
    {
        const self = this;

        let index = self.findDoubleNotch(bank, motor, ratio);
        if (index != undefined) {
            const notch = {
                harmonic: harm,
                count: 2,
                notch_q: bank[index].notch_q,
                separation: (bank[index].gear_ratio - bank[index + 1].gear_ratio) / ratio,
                min_hz: bank[index].min_hz,
                max_hz: bank[index].max_hz,
                min_rpm: bank[index].min_hz / harm * 60,
                max_rpm: bank[index].max_hz / harm * 60,
            };
            self.deleteNotch(bank, index);
            self.deleteNotch(bank, index+1);

            return notch;
        }

        index = self.findSingleNotch(bank, motor, ratio);
        if (index != undefined) {
            const notch = {
                harmonic: harm,
                count: 1,
                notch_q: bank[index].notch_q,
                separation: 0,
                min_hz: bank[index].min_hz,
                max_hz: bank[index].max_hz,
                min_rpm: bank[index].min_hz / harm * 60,
                max_rpm: bank[index].max_hz / harm * 60,
                };
            self.deleteNotch(bank, index);

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

    findAdvancedConfig : function(bank)
    {
        const self = this;

        const notches = self.cloneBank(bank);

        const config = {
            mainMotor: [],
            mainRotor: [],
            tailRotor: [],
        };

        config.mainMotor[1] = this.findHarmonic(notches, self.mainMotor, 1,  1);

        config.mainRotor[1] = this.findHarmonic(notches, self.mainMotor, self.mainGearRatio * 1,  1);
        config.mainRotor[2] = this.findHarmonic(notches, self.mainMotor, self.mainGearRatio * 2,  2);
        config.mainRotor[3] = this.findHarmonic(notches, self.mainMotor, self.mainGearRatio * 3,  3);
        config.mainRotor[4] = this.findHarmonic(notches, self.mainMotor, self.mainGearRatio * 4,  4);

        config.tailRotor[1] = this.findHarmonic(notches, self.tailMotor, self.tailGearRatio * 1,  1);
        config.tailRotor[2] = this.findHarmonic(notches, self.tailMotor, self.tailGearRatio * 2,  2);

        console.log('Main Motor harmonics: ', config.mainMotor);
        console.log('Main Rotor harmonics: ', config.mainRotor);
        console.log('Tail Rotor harmonics: ', config.tailRotor);


    },

    initialize : function (mainMotor, mainGearRatio, tailMotor, tailGearRatio)
    {
        const self = this;

        self.mainMotor = mainMotor;
        self.tailMotor = tailMotor;

        self.mainGearRatio = mainGearRatio;
        self.tailGearRatio = tailGearRatio;

        console.log(`main motor: ${mainMotor}`);
        console.log(`main motor ratio: ${mainGearRatio}`);
        console.log(`tail motor: ${tailMotor}`);
        console.log(`tail gear ratio: ${tailGearRatio}`);
    },

};
