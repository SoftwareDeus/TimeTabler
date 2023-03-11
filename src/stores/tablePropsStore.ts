import dayjs from 'dayjs';
import type { Shift, ShiftTimes } from './shiftConfigStore';
import type { ShiftWorker, WorkDay } from './shiftWorkerStore';
import { createIndexedDBStore } from './stores';
import { v4 as uuidv4 } from 'uuid';
import { get } from 'svelte/store';

/***
 * TODO:
 * [x] Timetabler store erstellen
 * [x] Tableprops nur über Tiemtabler erstellen
 * [] Ein nutzer soll unendlich timetablers erstellen können
 * [] Nur über ID Zugreifen... Eig sollte jede instanz  eine sein... hust. Glaub ich querspeicher mein arsch weg haha
 */

export type TableCreateConfig = {
	monthDate: Date;
	earlyStart: string;
	earlyEnd: string;
	lateStart: string;
	lateEnd: string;
};

export type ShiftDay = {
	day: number;
	early: ShiftWorker | null;
	late: ShiftWorker | null;
	shiftTimes: ShiftTimes;
};

export type TimeTabler = {
	id: string;
	name: string;
	createdAt: Date;
	TablePropIds: string[];
}

export type TableProp = {
	index: number;
	id: string;
	date: Date;
	days: ShiftDay[];
	dirty: boolean;
	shiftTimes: ShiftTimes;
	holidays: Holiday[];
};

export type Holiday = {
	name: string;
	date: Date,
}

export const timeTablerStore = createIndexedDBStore<TimeTabler[]>({
	key: "timeTabler",
	initialValue: []
})


export const tablePropsStore = createIndexedDBStore<TableProp[]>({
	key: 'tableProps',
	initialValue: []
});

export function createTimeTabler(name: string): string{
	const timeTabler : TimeTabler = {
			id: uuidv4(),
			TablePropIds: [],
			name: name,
			createdAt: new Date(),
	}

	timeTablerStore.update(timeTablers => [...timeTablers, timeTabler]);

	return timeTabler.id;
}

export function createTableProp(timeTablerId: string): string {
	const timeTabler = get(timeTablerStore).find(timeTabler => timeTabler.id === timeTablerId)
	
	if (!timeTabler)
		return ""; 

	const tableProp = get(tablePropsStore).filter(prop => timeTabler.TablePropIds.find(propId => propId === prop.id)).sort((a, b) => a.index - b.index).pop();
	
	const tablePropId = initNewTableProp(timeTabler.TablePropIds.length + 1, tableProp);
	
	if(!timeTabler)
		return "";

	timeTabler?.TablePropIds.push(tablePropId);
	updateTimeTabler(timeTabler);

	return tablePropId;
}

export function updateTimeTabler(timeTabler: TimeTabler) {
	timeTablerStore.update(timeTablers => {
		return [...timeTablers.filter(_timeTabler => _timeTabler.id !== timeTabler.id), timeTabler];		
	})
}

function initNewTableProp(index: number, tableProps: TableProp | undefined): string {
	if(tableProps)
	{
		const tableProp: TableProp = {
			index,
			id: uuidv4(),
			date: new Date(tableProps.date),
			days: [],
			dirty: true,
			shiftTimes: tableProps.shiftTimes,
			holidays: []
		};
		tableProp.date.setMonth(new Date(tableProp.date).getMonth() + 1)
		tablePropsStore.update(tableProps => [...tableProps, {...tableProp}])
		return tableProp.id;
	}
	else {
		const tableProp: TableProp = {
			index,
			id: uuidv4(),
			date: new Date(),
			days: [],
			dirty: true,
			shiftTimes: {
				early: { startTime: new Date(), endTime: new Date() },
				late: { startTime: new Date(), endTime: new Date() }
			},
			holidays: []
		};
		
		tablePropsStore.update(tableProps => [...tableProps, {...tableProp}])
		return tableProp.id;
	}

}

export function setShiftFromWorkday(tablePropId: string, worker: ShiftWorker, workday: WorkDay){
		const tableProp = get(tablePropsStore).find(_prop => _prop.id === tablePropId)!

		const day = tableProp.days.find(day => day.day === workday.day.index);

		if(!day)
			return;

		if(dayjs(day?.shiftTimes.early.startTime).format("HH:mm") === dayjs(workday.day.shift.startTime).format("HH:mm"))
		{
			day.early = worker;
		}

		if(dayjs(day?.shiftTimes.late.startTime).format("HH:mm") === dayjs(workday.day.shift.startTime).format("HH:mm"))
		{
			day.late = worker;
		}

		setTableProps(tableProp);
}

export function setTablePropsDate(tableProps: TableProp, date: Date){
	tableProps.date = date;
	const newDate = new Date(tableProps.date);
	newDate.setDate(1);

	
	tableProps.shiftTimes.early.startTime = new Date(newDate);
	tableProps.shiftTimes.early.endTime = new Date(newDate);
	tableProps.shiftTimes.late.endTime = new Date(newDate);
	tableProps.shiftTimes.late.startTime = new Date(newDate);
	tableProps.shiftTimes.early.endTime.setDate(1)
	tableProps.shiftTimes.late.endTime.setDate(1)
	tableProps.shiftTimes.early.startTime.setDate(1)
	tableProps.shiftTimes.late.startTime.setDate(1)
	
	setTableProps(tableProps);
}

export function setTableProps(tableProp: TableProp) {
	tablePropsStore?.update(tableProps => {
		const prop = tableProps.find(_prop => _prop.id === tableProp.id);
		if(prop)
			return [...tableProps.filter(_prop => !(_prop.id === tableProp.id)), tableProp]
			
		return tableProps;
	});
}

function isTimeString(timeString: string): boolean {
	return timeString.split(':').length === 2;
}
export function updateShiftTimesFromTimes(
	earlyStart: string,
	earlyEnd: string,
	lateStart: string,
	lateEnd: string,
	tablePropId: string
) {
	tablePropsStore.update((tableProps) => {
		const tableProp : TableProp | undefined = tableProps.find(_prop => _prop.id === tablePropId)
		
		if(!tableProp){
			return tableProps;
		}
		const earlyStartDate = new Date(tableProp.date);
		const earlyEndDate = new Date(tableProp.date);
		const lateStartDate = new Date(tableProp.date);
		const lateEndDate = new Date(tableProp.date);

		earlyStartDate.setDate(1);
		earlyEndDate.setDate(1);
		lateStartDate.setDate(1);
		lateEndDate.setDate(1);

		if (isTimeString(earlyStart)) {
			const [hours, minutes] = earlyStart
				.split(':')
				.map((timeStringSplit) => parseInt(timeStringSplit));
			earlyStartDate.setHours(hours, minutes);
		}
		if (isTimeString(earlyEnd)) {
			const [hours, minutes] = earlyEnd
				.split(':')
				.map((timeStringSplit) => parseInt(timeStringSplit));
			earlyEndDate.setHours(hours, minutes);
		}

		if (isTimeString(lateStart)) {
			const [hours, minutes] = lateStart
				.split(':')
				.map((timeStringSplit) => parseInt(timeStringSplit));
			lateStartDate.setHours(hours, minutes);
		}

		if (isTimeString(lateEnd)) {
			const [hours, minutes] = lateEnd
				.split(':')
				.map((timeStringSplit) => parseInt(timeStringSplit));
			lateEndDate.setHours(hours, minutes);

			if (hours < 8) lateEndDate.setDate(lateEndDate.getDate() + 1);
		}

		tableProp.shiftTimes = {
			early: {
				startTime: earlyStartDate,
				endTime: earlyEndDate
			},
			late: {
				startTime: lateStartDate,
				endTime: lateEndDate
			}
		};
		return [...tableProps.filter(_prop => !(_prop.id === tableProp.id)), tableProp]
	});
}
export function getEarlyDate(tableProps: TableProp, day: number): Shift {
	const startTime = new Date(tableProps.shiftTimes.early.startTime);
	const endTime = new Date(tableProps.shiftTimes.early.endTime);
	startTime.setDate(day);
	endTime.setDate(day);
	return { startTime, endTime };
}

export function getTablePropsFromTimeTabler(timeTablerId: string): TableProp[] {
	const _tableProps = get(tablePropsStore);
	const timeTablerPropIds = get(timeTablerStore).find(
		(timeTabler) => timeTabler.id === timeTablerId
	)?.TablePropIds;
	return _tableProps
		.filter((prop) => timeTablerPropIds?.find((_id) => _id === prop.id))
		.sort((propA, propB) => propA.index - propB.index);
		
	}

export function getLateDate(tableProps: TableProp, day: number): Shift {
	const startTime = new Date(tableProps.shiftTimes.late.startTime);
	const endTime = new Date(tableProps.shiftTimes.late.endTime);
	startTime.setDate(day);
	if (startTime.getHours() > 10 && endTime.getHours() < 10)
		endTime.setDate(day + 1);
	else endTime.setDate(day);
	return { startTime, endTime };
}

export function getTablePropById(tablePropId: string): TableProp{
	let _tableProp = {} as TableProp;
	tablePropsStore.subscribe(tableProps => {
		const tableProp = tableProps.find(tableProp => tableProp.id === tablePropId)

		if(!tableProp)
			console.error("Keine Tabledaten gefunden ID: " + tablePropId)
		_tableProp = tableProp!;
	})

	return _tableProp!	
}
export function initTablePropData(tableProp: TableProp, tableCreateConfig: TableCreateConfig): TableProp {
	tableProp.date = tableCreateConfig.monthDate;
	tableProp.dirty = false;
	setTablePropsDate(tableProp, tableCreateConfig.monthDate);
	updateShiftTimesFromTimes(
		tableCreateConfig.earlyStart,
		tableCreateConfig.earlyEnd,
		tableCreateConfig.lateStart,
		tableCreateConfig.lateEnd,
		tableProp.id
	);
	updateShiftDays(tableProp.id);
	return get(tablePropsStore).find((prop) => prop.id === tableProp.id) ?? tableProp;
}
export function updateShiftDays(tablePropId: string) {
	tablePropsStore.update((tableProps) => {
		const tableProp : TableProp | undefined = tableProps.find(_prop => _prop.id === tablePropId)
		if(!tableProp)
				return tableProps;
				
		const earlyStart = `${tableProp.shiftTimes.early.startTime.getHours()}:${tableProp.shiftTimes.early.startTime.getMinutes()}`;
		const earlyEnd = `${tableProp.shiftTimes.early.endTime.getHours()}:${tableProp.shiftTimes.early.endTime.getMinutes()}`;
		const lateStart = `${tableProp.shiftTimes.late.startTime.getHours()}:${tableProp.shiftTimes.late.startTime.getMinutes()}`;
		const lateEnd = `${tableProp.shiftTimes.late.endTime.getHours()}:${tableProp.shiftTimes.late.endTime.getMinutes()}`;
		const shiftDays = getDays(
			tableProp,
			earlyStart,
			earlyEnd,
			lateStart,
			lateEnd
		);
		tableProp.days = shiftDays;
		return tableProps;
	});
}

function getDays(
	tableProps: TableProp,
	earlyStart: string,
	earlyEnd: string,
	lateStart: string,
	lateEnd: string
): ShiftDay[] {
	const daysInMonth = new Date(
		new Date(tableProps.date).getFullYear(),
		new Date(tableProps.date).getMonth() + 1,
		0
	).getDate();
	if (earlyStart && earlyEnd && lateStart && lateEnd) {
		return Array.from({ length: daysInMonth }, (_, i) => i + 1).map((item) => {
			return {
				day: item,
				early: null,
				late: null,
				shiftTimes: {
					early: getEarlyDate(tableProps,  item),
					late: getLateDate(tableProps, item)
				}
			};
		});
	} else {
		const earlyStartDate = new Date(tableProps.date);
		const lateStartDate = new Date(tableProps.date);
		const earlyEndDate = new Date(tableProps.date);
		const lateEndDate = new Date(tableProps.date);
		earlyStartDate.setHours(8);
		earlyEndDate.setHours(16, 30);
		lateStartDate.setHours(16, 30);
		lateEndDate.setDate(lateEndDate.getDate() + 1);
		lateEndDate.setHours(1);
		return Array.from({ length: daysInMonth }, (_, i) => i + 1).map((item) => {
			return {
				day: item,
				early: null,
				late: null,
				shiftTimes: {
					early: {
						startTime: earlyStartDate,
						endTime: earlyEndDate
					},
					late: {
						startTime: lateStartDate,
						endTime: lateEndDate
					}
				}
			};
		});
	}
}
