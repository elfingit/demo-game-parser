const monthes = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December'
];

function get_month_number(name) {
    let month = monthes.indexOf(name);
    return month ? month + 1 : 0;
}

module.exports = { get_month_number }