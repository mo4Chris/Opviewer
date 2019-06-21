import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DatetimeService {

  constructor() { }

  // Only use for dates that have duration, dates that contain day, month and year should not be used by this.
  MatlabDurationToMinutes(serial) {
    const dur = moment.duration(serial, 'minutes');
    let format = '';
    //console.log(serial);
    if (typeof serial !== 'number' || serial == NaN) {
      format = 'N/a';
    } else if (serial < 60) {
      format = dur.minutes() + ' minutes';
    } else {
      format = (dur.hours() + dur.minutes() / 60).toFixed(1) + ' hours';
    }
    return format;
  }

  MinutesToHours(date) {
    const hours = (date / 60).toFixed(1);
    return hours;
  }

  MatlabDateToUnixEpoch(serial) {
    const time_info = moment((serial - 719529) * 864e5);
    return time_info;
  }

  MatlabDateToJSDateYMD(serial) {
    const datevar = moment((serial - 719529) * 864e5).format('YYYY-MM-DD');
    return datevar;
  }
  JSDateYMDToObjectDate(YMDDate) {
    YMDDate = YMDDate.split('-');
    const ObjectDate = { year: YMDDate[0], month: YMDDate[1], day: YMDDate[2] };
    return ObjectDate;
  }

  MatlabDateToJSTime(serial) {
    const time_info = moment((serial - 719529) * 864e5).format('HH:mm:ss');
    return time_info;
  }

  MatlabDateToCustomJSTime(serial, format) {
    if (serial !== '_NaN_' && serial !== undefined) {
      let time_info;
      if ( moment((serial - 719529) * 864e5).isValid()) {
        time_info = moment((serial - 719529) * 864e5).format(format);
      } else {
        time_info = 'N/a';
      }
      return time_info;
    } else {
      return 'N/a';
    }
  }

  unixEpochtoMatlabDate(epochDate) {
    const matlabTime = ((epochDate / 864e2) + 719529);
    return matlabTime;
  }

  MatlabDateToJSTimeDifference(serialEnd, serialBegin) {
    serialEnd = moment((serialEnd - 719529) * 864e5).startOf('second');
    serialBegin = moment((serialBegin - 719529) * 864e5).startOf('second');
    const difference = serialEnd.diff(serialBegin);

    return moment(difference).subtract(1, 'hours').format('HH:mm:ss');
  }

  getMatlabDateYesterday() {
    const matlabValueYesterday = moment().add(-1, 'days');
    matlabValueYesterday.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();

    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);
    return dateAsMatlab;
  }

  getJSDateYesterdayYMD() {
    const JSValueYesterday = moment().add(-1, 'days').utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD');
    return JSValueYesterday;
  }

  dateHasSailed(date: NgbDateStruct, dateData: any): boolean {
    for (let i = 0; i < dateData.length; i++) {
      const day: number = dateData[i].day;
      const month: number = dateData[i].month;
      const year: number = dateData[i].year;
      // tslint:disable-next-line:triple-equals
      if (day == date.day && month == date.month && year == date.year) {
        return true;
      }
    }
  }

  MatlabDateToJSDate(serial) {
    const dateInt = this.MatlabDateToUnixEpoch(serial);
    return dateInt.format('DD-MM-YYYY');
  }

  MatlabDateToJSMonthDate(serial) {
    const dateInt = this.MatlabDateToUnixEpoch(serial);
    return dateInt.format('DD');
  }

  convertObjectToMoment(year, month, day) {
    return moment(year + '-' + month + '-' + day, 'YYYY-MM-DD');
  }

  convertMomentToObject(date, addMonth = true) {
    const obj = { year: date.year(), month: date.month(), day: date.date() };
    if (addMonth) {
      obj.month++;
    }
    return obj;
  }

  valueToDate(serial) {
    if (serial) {
      return moment(serial).format('DD-MM-YYYY');
    } else {
      return '-';
    }
  }

  hoursSinceMoment(dateString) {
    if (dateString) {
      const dur = moment().diff(moment.parseZone(dateString + '+00:00'));
      return moment.duration(dur).asHours();
    } else {
      return null;
    }
  }
}
