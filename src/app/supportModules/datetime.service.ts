import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DatetimeService {

static shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  constructor(
    private setting: SettingsService
  ) { }
  vesselOffsetHours = this.setting.localTimeZoneOffset; // Default to the local timezone, offset in hours

  // Only use for dates that have duration, dates that contain day, month and year should not be used by this.
  matlabDurationToMinutes(serial: string | number, roundMinutes = true) {
    if (serial == null) return 'N/a';
    if (serial == 'N/a') return 'N/a';
    serial = +serial;
    let dur: moment.Duration;
    if (roundMinutes) {
      dur = moment.duration(<number> serial + 0.5, 'minutes');
    } else {
      dur = moment.duration(serial, 'minutes');
    }
    if (isNaN(serial)) {
      return 'N/a';
    } else if (serial < 60) {
      return dur.minutes() + ' minutes';
    }
    return (dur.hours() + dur.minutes() / 60).toFixed(1) + ' hours';
  }

  minutesToHours(Minutes: number) {
    return (Minutes / 60).toFixed(1);
  }

  matlabDatenumToMoment(serial: number): moment.Moment {
    return moment.tz((serial - 719529) * 864e5, 'Etc/UTC');
  }

  matlabDatenumToDate(serial: number): Date {
    // Creates a Date object. Input is assumed ms since 1970 UTC
    return new Date((serial - 719529) * 864e5);
  }

  matlabDatenumToYmdString(serial: number): string {
    return this.matlabDatenumToMoment(serial).format('YYYY-MM-DD');
  }

  ymdStringToYMD(YMDDate: string): {year: number, month: number, day: number} {
    if (typeof YMDDate !== 'string') return null;
    const YMDarray = YMDDate.split('-');
    if (YMDarray.length != 3) return null;
    return {
      year: +YMDarray[0],
      month: +YMDarray[1],
      day: +YMDarray[2]
    };
  }

  applyTimeOffsetToMoment(_moment: moment.Moment) {
    // moment.utcOffset expects minutes, our application expects hours
    _moment.utcOffset(60 * +this.setting.getTimeOffset(this.vesselOffsetHours, _moment));
  }

  matlabDatenumToTimeString(serial: number): string {
    if (!serial) { return 'N/a'; }
    const serialMoment = this.matlabDatenumToMoment(serial);
    if (serialMoment.isValid()) {
      let time_info: string;
      if (this.setting.Timezone === 'timezone') {
        time_info = moment.tz(serialMoment, this.setting.fixedTimeZoneLoc).format('HH:mm:ss z');
      } else {
        this.applyTimeOffsetToMoment(serialMoment);
        time_info = serialMoment.format('HH:mm:ss');
      }
      return time_info;
    } else {
      return 'N/a';
    }
  }

  matlabDatenumToYMD(serial: number) {
    return this.momentToYMD(this.matlabDatenumToMoment(serial), true);
  }

  matlabDatenumToFormattedTimeString(serial: string | number, format: string) {
    // ToDo: merge this with matlabDatenumToTimeString
    if (typeof(serial) === 'string') {
      serial = +serial;
    }
    if (!isNaN(serial)) {
      let time_info: string;
      const serialMoment = this.matlabDatenumToMoment(serial);
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

  matlabDatenumToDmyString(serial: number) {
    const dateInt = this.matlabDatenumToMoment(serial);
    return dateInt.format('DD-MM-YYYY');
  }

  matlabDatenumToDayString(serial: number) {
    const dateInt = this.matlabDatenumToMoment(serial);
    return dateInt.format('DD');
  }

  createTimesQuarterHour(): TimesQuarterHour[] {
    const quarterHours = ['00', '15', '30', '45'];
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        let time = i + ':' + quarterHours[j];
        if (i < 10) time = '0' + time;
        times.push(time);
      }
    }
    times.push('24:00');
    return times;
  }

  createTimesHours() {
    const allHours = [];
    for (let i = 0; i < 25; i++) {
      let time = i + '';
      if (i < 10) time = '0' + time;
      allHours.push(time);
    }
    return allHours;
  }

  createTimeFiveMinutes() {
    const all5Minutes = [];
    for (let i = 0; i < 60; i += 5) {
      let time = i + '';
      if (i < 10) time = '0' + time;
      all5Minutes.push(time);
    }
    return all5Minutes;
  }

  unixEpochtoMatlabDatenum(epochDate: number) {
    return (epochDate / 864e2) + 719529;
  }

  getMatlabDatenumDifferenceString(serialEnd: number, serialBegin: number) {
    const serialEndMoment = this.matlabDatenumToMoment(serialEnd).startOf('second');
    const serialBeginMoment = this.matlabDatenumToMoment(serialBegin).startOf('second');
    const difference = serialEndMoment.diff(serialBeginMoment);
    return moment(difference).subtract(1, 'hours').format('HH:mm:ss');
  }

  formatMatlabDuration(duration: number) {
    if (typeof(duration) == 'number' && duration >= 0) {
      const totalSeconds = Math.round(duration * 24 * 60 * 60);
      const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const mns = Math.floor((totalSeconds / 60) % 60).toString().padStart(2, '0');
      const sec = Math.floor((totalSeconds) % 60).toString().padStart(2, '0');
      return `${hrs}:${mns}:${sec}`;
    } else {
      return 'N/a';
    }
  }

  formatMinuteDuration(diff_minutes: number) {
    if (typeof(diff_minutes) == 'number' && diff_minutes >= 0) {
      return moment(0).utc().add(diff_minutes, 'minutes').format('HH:mm:ss');
    } else {
      return 'N/a';
    }
  }

  getMatlabDateYesterday() {
    const matlabValueYesterday = moment().add(-1, 'days');
    matlabValueYesterday.utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDatenum(momentDateAsIso);
    return dateAsMatlab;
  }

  getYmdStringYesterday() {
    const JSValueYesterday = moment().add(-1, 'days').utcOffset(0).format('YYYY-MM-DD');
    return JSValueYesterday;
  }

  dateHasSailed(date: NgbDateStruct, dateData: any): boolean {
    // Todo: this is not a general function => should not be in this service
    for (let i = 0; i < dateData.length; i++) {
      const day: number = dateData[i].day;
      const month: number = dateData[i].month;
      const year: number = dateData[i].year;
      if (day == date.day && month == date.month && year == date.year) {
        return true;
      }
    }
  }

  dateAddHours(dateObj: Date, hours: number) {
    dateObj.setTime(dateObj.getTime() + hours * 60 * 60 * 1000);
    return dateObj;
  }

  dateToDayTimeString(date: Date) {
    const offsetHours = this.setting.getTimeOffset(this.vesselOffsetHours);
    date = this.dateAddHours(date, offsetHours);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const mins  = date.getUTCMinutes().toString().padStart(2, '0');
    const month = DatetimeService.shortMonths[date.getUTCMonth()];
    const utc_date = date.getUTCDate()
    return `${month} ${utc_date}, ${hours}:${mins}`;
  }

  dateToDateString(date: Date) {
    const month = DatetimeService.shortMonths[date.getUTCMonth()];
    return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
  }

  dateStringToUnixEpoch(datestring: string) {
    const dateMoment = moment(datestring);
    return dateMoment.unix();
  }

  getMatlabDatenumLastMonth() {
    const matlabValueYesterday = moment().add(-1, 'months');
    matlabValueYesterday.utcOffset(0).set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDatenum(momentDateAsIso);
    return dateAsMatlab;
  }

  getMatlabDatenumMonthsAgo(diffMonths: number) {
    const matlabValueYesterday = moment().add(diffMonths, 'months');
    matlabValueYesterday.utcOffset(0).set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
    matlabValueYesterday.format();
    const momentDateAsIso = moment(matlabValueYesterday).unix();
    const dateAsMatlab = this.unixEpochtoMatlabDatenum(momentDateAsIso);
    return dateAsMatlab;
  }

  getYmdStringLastMonth() {
    const JSValueYesterday = moment().add(-1, 'months').utcOffset(0).set({
      date: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).format('YYYY-MM-DD');
    return JSValueYesterday;
  }

  now() {
    return moment();
  }

  moment(year: string | number, month: string |number, day: string | number) {
    return moment({year: year as number, month: month as number, date: day as number});
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

  objectTimeDifference(dateobj: {from: string, to: string, total: string}) {
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

  arrayTotalTime(dateArray: {from: string, to: string, total: string}[]) {
    let dateMoment = moment('00:00', 'HH:mm');
    for (let j = 0; j < dateArray.length; j++) {
      const tempStore = moment(dateArray[j].total, 'HH:mm').toObject();
      dateMoment = dateMoment.add({hours: tempStore.hours, minutes: tempStore.minutes});
    }
    return dateMoment.format('HH:mm');
  }

  momentToYMD(date: moment.Moment, addMonth = true) {
    const obj = { year: date.year(), month: date.month(), day: date.date() };
    if (addMonth) {
      // moment months start at 0, YMD at 1
      obj.month++;
    }
    return obj;
  }

  unixEpochToDmyString(serial: number) {
    if (serial) {
      return moment(serial).format('DD-MM-YYYY');
    } else {
      return '-';
    }
  }

  ngbDateToMatlabDatenum(dateObj: NgbDate | {year: number, month: number, day: number}) {
    // Moment.utc can handles year/month/day object, but requires months to start at 0
    if (typeof(dateObj) != 'object') return null;
    const _dateObj = {
      year: dateObj.year,
      month: dateObj.month - 1,
      day: dateObj.day,
    };
    const unixTime =  moment.utc(_dateObj).unix();
    return this.unixEpochtoMatlabDatenum(unixTime);
  }

  hoursSinceTimeString(dateString: string) {
    if (dateString) {
      const dur = moment().diff(moment.parseZone(dateString + '+00:00'));
      return moment.duration(dur).asHours();
    } else {
      return null;
    }
  }

  getCurrentMatlabDatenum(): number {
    const curr = <number> moment().valueOf();
    return (curr / 864e5) + 719529;
  }

  getDaysSinceMatlabDatenum(serial: number) {
    return this.getCurrentMatlabDatenum() - serial;
  }

  roundToMinutes(dnums: number[], num_minutes: number): number[] {
    const DT = 60 * 24 / num_minutes;
    const minT = Math.floor(dnums[0]);
    return dnums.map(dnum => {
      // We add 1 seconds so we do not suffer from rounding errors
      return (Math.round((dnum - minT) * DT) + 0.01) / DT + minT;
    })
  }

  groupMatlabDatenums(matlab_dates: number[], groupBy: 'day' | 'month' | 'year' = 'month'): any[] {
    if (!Array.isArray(matlab_dates) || matlab_dates.length === 0) {return []; }
    const dates = matlab_dates.map(dnum => this.matlabDatenumToYMD(dnum));
    const minDate = this.matlabDatenumToYMD(matlab_dates.reduce((curr, prev) => Math.min(curr, prev)));
    const maxDate = this.matlabDatenumToYMD(matlab_dates.reduce((curr, prev) => Math.max(curr, prev)));
    switch (groupBy) {
      case 'month':
        const numMonths = 12 * (maxDate.year - minDate.year) + maxDate.month - minDate.month + 1;
        const groupedData = Array(numMonths);
        let year = minDate.year, month = minDate.month - 1;
        for (let _i = 0; _i < numMonths; _i++) {
          year += month >= 12 ? 1 : 0;
          month = month >= 12 ? 1 : month + 1;
          const matches = [];
          const index = [];
          dates.forEach(((val, __i) => {
            if (val.year === year && val.month === month) {
              matches.push(val);
              index.push(__i);
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
          };
        }
        return groupedData;
      default:
        console.error('Groupby operator ' + groupBy + ' is not yet implemented!');
        return [];
    }
  }

  groupMatlabDatenumsByMonth(data: {date: number[]}): {month: any}[] {
    // Assumes data to be of form {date: [], prop1: [], prop2: [], ...}
    const groups = this.groupMatlabDatenums(data.date || []);
    const props = Object.keys(data).filter(prop => Array.isArray(data[prop]));
    return groups.map(group => {
      const datas = {month: group};
      props.forEach(prop => {
        datas[prop] = data[prop].filter((_: any, _i: number) => group.index.some((__i: number) => __i === _i));
      });
      return datas;
    });
  }


  isoStringToMoment(timeString: string): moment.Moment {
    return moment(timeString);
  }

  isoStringToDmyString(timeString: string): string {
    return this.isoStringToMoment(timeString).format('DD MMM YYYY');
  }
}

export type TimesQuarterHour = 
  '00:00' | '00:15' | '00:30' | '00:45' | 
  '01:00' | '01:15' | '01:30' | '01:45' | 
  '02:00' | '02:15' | '02:30' | '02:45' | 
  '03:00' | '03:15' | '03:30' | '03:45' | 
  '04:00' | '04:15' | '04:30' | '04:45' | 
  '05:00' | '05:15' | '05:30' | '05:45' | 
  '06:00' | '06:15' | '06:30' | '06:45' | 
  '07:00' | '07:15' | '07:30' | '07:45' | 
  '08:00' | '08:15' | '08:30' | '08:45' | 
  '09:00' | '09:15' | '09:30' | '09:45' | 
  '10:00' | '10:15' | '10:30' | '10:45' | 
  '11.00' | '11:15' | '11:30' | '11:45' | 
  '12:00' | '12:15' | '12:30' | '12:45' | 
  '13:00' | '13:15' | '13:30' | '13:45' | 
  '14:00' | '14:15' | '14:30' | '14:45' | 
  '15:00' | '15:15' | '15:30' | '15:45' | 
  '16:00' | '16:15' | '16:30' | '16:45' | 
  '17:00' | '17:15' | '17:30' | '17:45' | 
  '18:00' | '18:15' | '18:30' | '18:45' | 
  '19:00' | '19:15' | '19:30' | '19:45' | 
  '20:00' | '20:15' | '20:30' | '20:45' | 
  '21:00' | '21:15' | '21:30' | '21:45' | 
  '22:00' | '22:15' | '22:30' | '22:45' | 
  '23:00' | '23:15' | '23:30' | '23:45' | 
  '24:00';