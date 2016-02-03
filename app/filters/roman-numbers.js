angular
    .module('eve-overseer')
    .filter('roman_number', function() {
        return function(num) {
            num = parseInt(num, 10);
            if (!num) {
                return null;
            }
            var digits = String(+num).split(''),
                key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
                    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
                    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
                ],
                roman = '',
                i = 3;
            while (i--)
                roman = (key[+digits.pop() + (i * 10)] || '') + roman;
            return Array(+digits.join('') + 1).join('M') + roman;
        };
    });
