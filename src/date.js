class Time {
    static get CURRENT_DAY () {
        return new Date().getDay().toString();
    }

    static get CURRENT_DATE () {
        return new Date().getDate().toString();
    }

    static get CURRENT_YEAR () {
        return new Date().getFullYear().toString();
    }

    static get CURRENT_MONTH () {
        return new Date().getMonth().toString();
    }

    static get CURRENT_HOUR () {
        return new Date().getHours().toString();
    }

    static get CURRENT_MINUTE () {
        return new Date().getMinutes().toString();
    }

    static get CURRENT_SECOND () {
        return new Date().getSeconds().toString();
    }

    static get DATE () {
        return this.CURRENT_MONTH + "-" +
               this.CURRENT_DATE + "-" +
               this.CURRENT_YEAR;
    }

    static get now () {
        return Date.now();
    }
}

function get_param (name) {
    return new URL(window.location.href).searchParams.get(decodeURIComponent(name));
}

function param_exists (name) {
    return new URL(window.location.href).searchParams.has(decodeURIComponent(name));
}
