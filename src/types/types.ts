import type { ShiftWorker } from '../stores/shiftWorkerStore';

export type AssignableDay = {
	earlyWorker: ShiftWorker | null;
	lateWorker: ShiftWorker | null;
	day: number;
	dayString: string;
};

export type ConfigurableMonth = {
	days: AssignableDay[];
	month: number;
	monthString: string;
	year: number;
};
