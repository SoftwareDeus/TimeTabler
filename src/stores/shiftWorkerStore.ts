import { createIndexedDBStore } from './stores';
import type { Shift } from './shiftConfigStore';

export type ShiftWorker = {
	id: string;
	firstName: string;
	lastName: string;
	jobInfo: JobInfo;
	workDays: WorkDay[];
	createdAt: Date;
	colorHex: string;
};

export type JobInfo = {
	maxAvailableHours: number;
	isBoss: boolean;
};

export type WorkDay = {
	id: string;
	tablePropId: string;
	hours: number;
	day: {
		index: number;
		shift: Shift;
	};
};

export const workerStore = createIndexedDBStore<ShiftWorker[]>({
	key: 'Workers',
	initialValue: []
});

export function addWorker(worker: ShiftWorker) {
	workerStore.update((currentWorkers) => {
		return [...currentWorkers, worker];
	});
}

export function deleteWorker(worker: ShiftWorker) {
	workerStore.update((currentWorkers) => {
		return [...currentWorkers.filter((_worker) => !(_worker === worker))];
	});
}

export function updateWorker(worker: ShiftWorker) {
	workerStore.update((currentWorkers) => {
		let tempCurrents = currentWorkers.filter(
			(_worker) => !(_worker.id === worker.id)
		);
		tempCurrents.push(worker);
		tempCurrents = tempCurrents.sort(
			(a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()
		);
		return tempCurrents;
	});
}

export function updateWorkerShift(worker: ShiftWorker, shift: WorkDay) {
	updateWorker({
		...worker,
		workDays: worker.workDays.filter((_shift) => _shift.id !== shift.id)
	});
}
