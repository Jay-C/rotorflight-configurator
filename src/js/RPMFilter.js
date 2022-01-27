'use strict';

const RPMFilter = {

    BANK_COUNT: 16,

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
        return( a.motor_index === b.motor_index &&
                a.gear_ratio  === b.gear_ratio &&
                a.notch_q     === b.notch_q &&
                a.min_hz      === b.min_hz &&
                a.max_hz      === b.max_hz );
    },

    isNullNotch : function (a)
    {
        return( a.motor_index === 0 &&
                a.gear_ratio  === 0 &&
                a.notch_q     === 0 &&
                a.min_hz      === 0 &&
                a.max_hz      === 0 );
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

        for (let i=0; i<self.BANK_COUNT; i++)
            if (!self.compareNotch(a[i],b[i]))
                return false;

        return true;
    },

    findNotchAtRatio : function(bank, motor, ratio)
    {
        const self = this;

        for (let i=0; i<bank.length; i++) {
            if (bank[i].motor_index == motor && bank[i].gear_ratio == ratio)
                return i;
        }

        return null;
    },

    findSingleNotch : function(bank, motor, ratio, notch_q)
    {
        const self = this;

        const ratio1 = Math.floor(ratio);
        const ratio2 = Math.ceil(ratio);

        const index0 = self.findNotchAtRatio(bank, motor, ratio1 - 1);
        const index1 = self.findNotchAtRatio(bank, motor, ratio1);
        const index2 = self.findNotchAtRatio(bank, motor, ratio2);
        const index3 = self.findNotchAtRatio(bank, motor, ratio2 + 1);

        let index = null;

        if (index1 !== null)
            index = index1;
        else if (index2 !== null)
            index = index2;
        else if (index0 !== null)
            index = index0;
        else if (index3 !== null)
            index = index3;

        if (index !== null) {
            if (bank[index].notch_q == notch_q) {
                return index;
            }
        }

        return null;
    },

    findDoubleNotch : function(bank, motor, ratio, notch_q)
    {

    },

    initialize : function ()
    {
        const self = this;

    },

};
