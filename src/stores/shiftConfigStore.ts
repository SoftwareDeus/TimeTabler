import { createIndexedDBStore } from './stores';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import type { ShiftWorker } from './shiftWorkerStore';

export interface ShiftSettings {
	early: ShiftWorker | null;
	late: ShiftWorker | null;
}

export type Shift = {
	startTime: Date,
	endTime: Date
}
export interface ShiftTimes {
	early: Shift;
	late: Shift;
}
export type Day = {
	id: string;
	date: Dayjs;
	index: number;
	shiftConfiguration: {
		early: ShiftWorker | null;
		late: ShiftWorker | null;
	};
	shiftTimes: ShiftTimes;
};
export interface Month {
	id: string;
	date: Dayjs;
	name: string;
	days: Day[];
	shiftTimes: ShiftTimes;
}

export interface ShiftConfig {
	fromDate: Dayjs;
	toDate: Dayjs;
	months: Month[];
	shiftTimes?: ShiftTimes;
}

const shiftConfigStoreKey = 'shiftConfig';

function isSameOrBefore(fromDate: Dayjs, toDate: Dayjs) {
	return fromDate.isBefore(toDate) || fromDate.isSame(toDate);
}

export const shiftConfigStore = createIndexedDBStore<ShiftConfig>({
	key: shiftConfigStoreKey,
	initialValue: {
		fromDate: dayjs(),
		toDate: dayjs(),
		months: []
	}
});

export function updateShiftConfigMonths() {
	if (shiftConfigStore) {
		shiftConfigStore.update((config) => {
			const newMonths = getMonths(
				dayjs(config.fromDate.toString()),
				dayjs(config.toDate.toString()),
				config.shiftTimes
			);
			const newConfig = { ...config, months: newMonths };
			return newConfig;
		});
	} else {
		console.error('shiftConfig has not been found');
	}
}

export function getMonths(
	fromDate: Dayjs,
	toDate: Dayjs,
	shiftTimes?: ShiftTimes
): Month[] {
	const months = [];
	let currentMonth = fromDate.startOf('month');
	const emptyShiftTimes: ShiftTimes = {
		early: {
			startTime: dayjs().toDate(),
			endTime: dayjs().toDate()
		},
		late: {
			startTime: dayjs().toDate(),
			endTime: dayjs().toDate()
		}
	};
	while (isSameOrBefore(currentMonth, toDate)) {
		const name = currentMonth.format('MMMM YYYY');
		const days = getDaysInMonth(
			currentMonth,
			shiftTimes?.early.startTime ?? dayjs().toDate(),
			shiftTimes?.early.endTime ?? dayjs().toDate(),
			shiftTimes?.late.startTime ?? dayjs().toDate(),
			shiftTimes?.late.endTime ?? dayjs().toDate()
		);
		const id = uuidv4();
		months.push({
			id,
			date: currentMonth,
			name,
			days,
			shiftTimes: shiftTimes ?? emptyShiftTimes
		});
		currentMonth = currentMonth.add(1, 'month');
	}
	return months;
}

function getDaysInMonth(
	month: Dayjs,
	earlyShiftTimesStart: Date,
	earlyShiftTimesEnd: Date,
	lateShiftTimesStart: Date,
	lateShiftTimesEnd: Date
): Day[] {
	const days = [] as Day[];
	const startOfMonth = month.startOf('month');
	const endOfMonth = month.endOf('month');
	let currentDate = startOfMonth;
	let index = 0;
	while (isSameOrBefore(currentDate, endOfMonth)) {
		const id = uuidv4();
		days.push({
			id,
			date: currentDate,
			index,
			shiftConfiguration: { early: null, late: null },
			shiftTimes: {
				early: {
					startTime: earlyShiftTimesStart ?? null,
					endTime: earlyShiftTimesEnd ?? null
				},
				late: {
					startTime: lateShiftTimesStart ?? null,
					endTime: lateShiftTimesEnd ?? null
				}
			}
		});
		currentDate = currentDate.add(1, 'day');
		index++;
	}
	return days;
}
