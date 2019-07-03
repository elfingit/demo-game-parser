const monthes = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December'
];

const short_monthes = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
];

function get_month_number(name) {
    let month = monthes.indexOf(name);
    return month ? month + 1 : 0;
}

function get_month_number_by_short_name(name) {
    let tmpName = name.toLowerCase();
    tmpName = tmpName.charAt(0).toUpperCase() + tmpName.slice(1);

    let month = short_monthes.indexOf(tmpName);
    return month ? month + 1 : 0;
}

module.exports = { get_month_number, get_month_number_by_short_name }