import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { SettingsService } from './settings.service';
import { isArray } from 'util';

@Injectable({
  providedIn: 'root'
})
export class DatetimeService {

static shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  constructor(
    private setting: SettingsService
  ) { }
  vesselOffset = this.setting.localTimeZoneOffset; // Default to the local timezone

  // Only use for dates that have duration, dates that contain day, month and year should not be used by this.
  MatlabDurationToMinutes(serial, roundMinutes = true) {
    if (serial !== 'N/a') {
      serial = +serial;
    }
    let dur: moment.Duration;
    if (roundMinutes) {
      dur = moment.duration(serial + 0.5, 'minutes');
    } else {
      dur = moment.duration(serial, 'minutes');
    }
    let format: string;
    if (typeof serial !== 'number' || serial === NaN) {
      format = 'N/a';
    } else if (serial < 60) {
      format = dur.minutes() + ' minutes';
    } else {
      format = (dur.hours() + dur.minutes() / 60).toFixed(1) + ' hours';
    }
    return format;
  }

  MinutesToHours(Minutes: number) {
    const hours = (Minutes / 60).toFixed(1);
    return hours;
  }

  MatlabDateToUnixEpoch(serial: number) {
    const time_info = moment.utc((serial - 719529) * 864e5);
    return time_info;
  }

  MatlabDateToUnixEpochViaDate(serial: number): Date {
    // Creates a Date object. Input is assumed ms since 1970 UTC
    const time_info = new Date((serial - 719529) * 864e5);
    return time_info;
  }

  MatlabDateToJSDateYMD(serial: number): string {
    const datevar = this.MatlabDateToUnixEpoch(serial).format('YYYY-MM-DD');
    return datevar;
  }

  JSDateYMDToObjectDate(YMDDate: string) {
    const YMDarray = YMDDate.split('-');
    const ObjectDate = { year: YMDarray[0], month: YMDarray[1], day: YMDarray[2] };
    return ObjectDate;
  }

  applyTimeOffsetToMoment(_moment: moment.Moment) {
    _moment.utcOffset(60 * this.setting.getTimeOffset(this.vesselOffset));
  }

  MatlabDateToJSTime(serial: number): string {
    const serialMoment = this.MatlabDateToUnixEpoch(serial);
    if (serialMoment.isValid()) {
      this.applyTimeOffsetToMoment(serialMoment);
      const time_info = serialMoment.format('HH:mm:ss');
      return time_info;
    } else {
      return 'N/a';
    }
  }

  MatlabDateToObject(serial: number) {
    return this.convertMomentToObject(this.MatlabDateToUnixEpoch(serial));
  }

  MatlabDateToCustomJSTime(serial: string | number, format: string) {
    if (typeof(serial) === 'string') {
      serial = +serial;
    }
    if (!isNaN(serial)) {
      let time_info: string;
      const serialMoment = this.MatlabDateToUnixEpoch(serial);
      this.applyTimeOffsetToMoment(serialMoment);
      if (serialMoment.isValid()) {
        time_info = serialMoment.format(format);
      } else {
        time_info = 'N/a';
      }
      return time_info;
    } else {
      return 'N/a';
    }
  }

  createTimesQuarterHour() {
    const quarterHours = ['00', '15', '30', '45'];
    const times = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 4; j++) {
            let time = i + ':' + quarterHours[j];
            if (i < 10) {
            time = '0' + time;
            }
            times.push(time);
        }
    }
    times.push('24:00');
    return times;
  }

  createHoursTimes() {
      const allHours = [];
      for (let i = 0; i < 24; i++) {
        let time = i + '';
        if (i < 10) {
          time = '0' + time;
        }
          allHours.push(time);
      }
      return allHours;
  }

  createFiveMinutesTimes() {
    const all5Minutes = [];
        for (let i = 0; i < 60; i += 5) {
          let time = i + '';
          if (i < 10) {
          time = '0' + time;
          }
        all5Minutes.push(time);
    }
    return all5Minutes;
  }

  unixEpochtoMatlabDate(epochDate: number) {
    return (epochDate / 864e2) + 719529;
  }

  MatlabDateToJSTimeDifference(serialEnd: number, serialBegin: number) {
    const serialEndMoment = this.MatlabDateToUnixEpoch(serialEnd).startOf('second');
    const serialBeginMoment = this.MatlabDateToUnixEpoch(serialBegin).startOf('second');
    const difference = serialEndMoment.diff(serialBeginMoment);
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
    const JSValueYesterday = moment().add(-1, 'days').utcOffset(0).format('YYYY-MM-DD');
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

  dateAddHours(dateObj: Date, hours: number) {
    dateObj.setTime(dateObj.getTime() + hours * 60 * 60 * 1000);
    return dateObj;
  }

  jsDateToMDHMString(date: Date) {
    const offsetHours = this.setting.getTimeOffset(this.vesselOffset);
    date = this.dateAddHours(date, offsetHours);
    let hours: number | string = date.getUTCHours();
    let mins: number | string  = date.getUTCMinutes();
    if (hours < 10) {hours = '0' + hours; }
    if (mins < 10) {mins = '0' + mins; }
    return DatetimeService.shortMonths[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + hours + ':' + mins;
  }

  jsDateToDMYString(date: Date) {
    return date.getUTCDate() + ' ' + DatetimeService.shortMonths[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
  }

  dateStringToEpoch(datestring: string) {
    const dateMoment = moment(datestring);
    return dateMoment.unix();
  }

  getMatlabDateLastMonth() {
    const matlabValueYesterday = moment().add(-1, 'months');
    matlabValueYesterday.utcOffset(0).set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDate(momentDateAsIso);
    return dateAsMatlab;
  }

  getJSDateLastMonthYMD() {
    const JSValueYesterday = moment().add(-1, 'months').utcOffset(0).set({
      date: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).format('YYYY-MM-DD');
    return JSValueYesterday;
  }

  MatlabDateToJSDate(serial: number) {
    const dateInt = this.MatlabDateToUnixEpoch(serial);
    return dateInt.format('DD-MM-YYYY');
  }

  MatlabDateToJSMonthDate(serial: number) {
    const dateInt = this.MatlabDateToUnixEpoch(serial);
    return dateInt.format('DD');
  }

  convertObjectToMoment(year: string | number, month: string |number, day: string | number) {
    return moment(year + '-' + month + '-' + day, 'YYYY-MM-DD');
  }

  stringTimeDifference(datestring: string, datestringEnd: string) {
    const dateMoment = moment(datestring, 'HH:mm');
    let dateMomentEnd;

    if (datestringEnd === '24:00') {
      dateMomentEnd = moment('00:00', 'HH:mm');
    } else {
      dateMomentEnd = moment(datestringEnd, 'HH:mm');
    }

    const timeDifference = moment(dateMomentEnd.diff(dateMoment)).utcOffset(0).format('HH:mm');
    return timeDifference;
  }

  objectTimeDifference(dateobj) {
    const dateMoment = moment(dateobj.from, 'HH:mm');
    let dateMomentEnd;

    if (dateobj.to === '24:00') {
      dateMomentEnd = moment('00:00', 'HH:mm');
    } else {
      dateMomentEnd = moment(dateobj.to, 'HH:mm');
    }

    dateobj.total = moment(dateMomentEnd.diff(dateMoment)).utcOffset(0).format('HH:mm');
    return dateobj;
  }

  arrayTotalTime(dateArray) {
    let dateMoment = moment('00:00', 'HH:mm');

    for (let j = 0; j < dateArray.length; j++) {
      const tempStore = moment(dateArray[j].total, 'HH:mm').toObject();
      dateMoment = dateMoment.add({hours: tempStore.hours, minutes: tempStore.minutes});
    }
    return dateMoment.format('HH:mm');
  }

  convertMomentToObject(date: moment.Moment, addMonth = true) {
    const obj = { year: date.year(), month: date.month(), day: date.date() };
    if (addMonth) {
      obj.month++;
    }
    return obj;
  }

  valueToDate(serial: number) {
    if (serial) {
      return moment(serial).format('DD-MM-YYYY');
    } else {
      return '-';
    }
  }

  objectToMatlabDate(dateObj: NgbDate) {
    // Moment.utc can handles year/month/day object, but requires months to start at 0
    const _dateObj = {
      year: dateObj.year,
      month: dateObj.month - 1,
      day: dateObj.day,
    };
    const unixTime =  moment.utc(_dateObj).unix();
    return this.unixEpochtoMatlabDate(unixTime);
  }

  hoursSinceMoment(dateString: string) {
    if (dateString) {
      const dur = moment().diff(moment.parseZone(dateString + '+00:00'));
      return moment.duration(dur).asHours();
    } else {
      return null;
    }
  }

  currentMatlabDate(): number {
    const curr = <number> moment().valueOf();
    return (curr / 864e5) + 719529;
  }

  daysSinceMatlabDate(serial: number) {
    return this.currentMatlabDate() - serial;
  }

  groupMatlabDates(matlab_dates: number[], groupBy: 'day' | 'month' | 'year' = 'month'): any[] {
    if (!isArray(matlab_dates) || matlab_dates.length === 0) {return []}
    const dates = matlab_dates.map(dnum => this.MatlabDateToObject(dnum));
    const minDate = this.MatlabDateToObject(matlab_dates.reduce((curr, prev) => Math.min(curr, prev)));
    const maxDate = this.MatlabDateToObject(matlab_dates.reduce((curr, prev) => Math.max(curr, prev)));
    switch (groupBy) {
      case 'month':
        const numMonths = 12 * (maxDate.year - minDate.year) + maxDate.month - minDate.month + 1;
        const groupedData = Array(numMonths);
        let year = minDate.year, month = minDate.month - 1;
        for (let _i = 0; _i < numMonths; _i++) {
          year += month >= 12 ? 1 : 0;
          month = month >= 12 ? 1 : month + 1;
          const matches = []
          const index = [];
          dates.forEach(((val, _i) => {
            if (val.year === year && val.month === month) {
              matches.push(val);
              index.push(_i);
            }
          }));
          groupedData[_i] = {
            date: {year: year, month: month},
            // dateString: month === 1 ? 'Jan ' + year % 100 : DatetimeService.shortMonths[month - 1],
            dateString: DatetimeService.shortMonths[month - 1] + ' ' + year % 100,
            matches: matches,
            count: matches.length,
            index: index,
            numDays: new Date(year, month, 0).getDate(),
          }
        }
        return groupedData;
      default:
        console.error('Groupby operator ' + groupBy + ' is not yet implemented!')
        return [];
    }
  }

  groupDataByMonth(data: {date: number[]}): {month: any}[] {
    // Assumes data to be of form {date: [], prop1: [], prop2: [], ...}
    const groups = this.groupMatlabDates(data.date || []);
    const props = Object.keys(data).filter(prop => isArray(data[prop]));
    return groups.map(group => {
      let datas = {month: group};
      props.forEach(prop => {
        datas[prop] = data[prop].filter((_: any, _i: number) => group.index.some((__i: number) => __i ===_i))
      })
      return datas;
    })
  }
}
