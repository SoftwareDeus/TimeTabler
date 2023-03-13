export function getMonthsInRange(startDate: Date, endDate: Date): string[] {
	const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
	const end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
	const months = [];

	let current = start;
	while (current <= end) {
		months.push(
			`${current.toLocaleString('default', {
				month: 'long'
			})} ${current.getFullYear()}`
		);
		current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
	}

	return months;
}
import dayjs from 'dayjs';

export function getTimeStringFromDate(date: Date): string {
	return dayjs(date).format('HH:mm');
}

export function milisecToHours(ms: number): number {
	return ms / 1000 / 60 / 60;
}
