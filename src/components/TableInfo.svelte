<script lang="ts">
	import { tablePropsStore } from '../stores/tablePropsStore';
	import type { ShiftDay } from '../stores/tablePropsStore';
	import { workerStore } from '../stores/shiftWorkerStore';
	import type { ShiftWorker } from '../stores/shiftWorkerStore';
	import dayjs from 'dayjs';
	import ShiftTable from './ShiftTable.svelte';
	import Table from './Table.svelte';
	import type { WorkerStat } from '../types/types';
	type InfoDisplayData = {
		tage: number;
		maxStunden: number;
		mitarbeiterSoll: number;
		mitarbeiterIst: number;
		verbuchteSchichten: number;
	};
	let _newDays: ShiftDay[] = [];

	let workerStats: WorkerStat[] = [];

	function validateTable() {
		const newDays: ShiftDay[] = [];
		const _workerStats: WorkerStat[] = workers.map((worker) => {
			return {
				id: worker.id,
				max: worker.jobInfo.maxAvailableHours,
				hours: 0,
				boss: worker.jobInfo.isBoss,
				firstName: worker.firstName,
				lastName: worker.lastName,
				oversteps: 0
			};
		});
		days.forEach((day) => {
			const earlyHours = dayjs(day.shiftTimes.early.endTime).diff(
				dayjs(day.shiftTimes.early.startTime),
				'hour'
			);
			const lateHours = dayjs(day.shiftTimes.late.endTime).diff(
				dayjs(day.shiftTimes.late.startTime),
				'hour'
			);

			const newDay = { ...day };

			const earlyWorker = _workerStats.find(
				(workerStat) => workerStat.id === day.early?.id
			);

			if (earlyWorker) {
				earlyWorker.hours += earlyHours;
				if (earlyWorker.hours > earlyWorker.max) {
					const boss = _workerStats
						.filter((stat) => stat.boss)
						.sort((a, b) => b.hours - a.hours)
						.at(-1);
					newDay.early = workers.find((worker) => worker.id === boss?.id)!;
					boss!.hours += earlyHours;
					earlyWorker.hours -= earlyHours;
					earlyWorker.oversteps++;
				}
			}

			const lateWorker = _workerStats.find(
				(workerStat) => workerStat.id === day.late?.id
			);
			if (lateWorker) {
				lateWorker.hours += lateHours;
				if (lateWorker.hours > lateWorker.max) {
					const boss = _workerStats
						.filter((stat) => stat.boss)
						.sort((a, b) => b.hours - a.hours)
						.at(-1);

					newDay.late = workers.find((worker) => worker.id === boss!.id)!;
					lateWorker.hours -= lateHours;
					boss!.hours += lateHours;
					lateWorker.oversteps++;
				}
			}
			newDays.push(newDay);
		});

		_newDays = newDays;
		workerStats = _workerStats;
	}
	$: shuffleShiftTable(_newDays, workerStats);
	export let workers: ShiftWorker[];
	export let days: ShiftDay[];
	export let tablePropId: string;

	$: tableProp = $tablePropsStore.find((prop) => prop.id === tablePropId)!;
	$: infoDisplayData = getDisplayData(workers, days);

	function shuffleShifts(
		_days: ShiftDay[],
		stat: WorkerStat,
		shuffledShifts: ShiftDay[]
	) {
		// Filter out already shuffled shifts
		let workerShifts = _days.filter((day) => {
			return (
				(day.early?.id === stat.id || day.late?.id === stat.id) &&
				!shuffledShifts.includes(day)
			);
		});

		let bosses = workerStats.filter((s) => s.boss);
		let randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
		let bossShifts = _days.filter(
			(d) => d.early?.id === randomBoss.id || d.late?.id === randomBoss.id
		);

		let wShiftsIndex = Math.floor(Math.random() * workerShifts.length);
		let bShiftsIndex = Math.floor(Math.random() * bossShifts.length);

		let randomWorkerShift = workerShifts[wShiftsIndex];
		let randomBossShift = bossShifts[bShiftsIndex];

		if (!randomWorkerShift) return;

		// while (
		// 	randomWorkerShift.early?.id === randomBoss.id ||
		// 	randomWorkerShift.late?.id === randomBoss.id
		// ) {
		// 	wShiftsIndex = Math.floor(Math.random() * workerShifts.length);
		// 	randomWorkerShift = workerShifts[wShiftsIndex];
		// }

		if (randomWorkerShift.early?.id === stat.id) {
			if (randomBossShift.early?.id === randomBoss.id) {
				let tempShift = { ...randomWorkerShift };
				randomWorkerShift.early = randomBossShift.early;
				randomBossShift.early = tempShift.early;
			}
			if (randomBossShift.late?.id === randomBoss.id) {
				let tempShift = { ...randomWorkerShift };
				randomWorkerShift.early = randomBossShift.late;
				randomBossShift.late = tempShift.early;
			}
		}

		if (randomWorkerShift.late?.id === stat.id) {
			if (randomBossShift.early?.id === randomBoss.id) {
				let tempShift = { ...randomWorkerShift };
				randomWorkerShift.late = randomBossShift.early;
				randomBossShift.early = tempShift.late;
			}
			if (randomBossShift.late?.id === randomBoss.id) {
				let tempShift = { ...randomWorkerShift };
				randomWorkerShift.late = randomBossShift.late;
				randomBossShift.late = tempShift.late;
			}
		}

		shuffledShifts.push(randomWorkerShift);
	}

	function shuffleShiftTable(_days: ShiftDay[], stats: WorkerStat[]) {
		let shuffledShifts: ShiftDay[] = [];

		let oversteppingStats = stats.filter((s) => s.oversteps > 0);
		for (const stat of oversteppingStats) {
			for (let i = 0; i < stat.oversteps; i++) {
				shuffleShifts(_days, stat, shuffledShifts);
			}
			stat.oversteps = 0;
		}

		_newDays = _days;
		workerStats = stats;
	}

	function getDisplayData(
		workers: ShiftWorker[],
		days: ShiftDay[]
	): InfoDisplayData {
		const tage = days.length;
		const maxStunden = tage * 8 * 2;

		let mitarbeiterSoll = 0;
		workers.forEach((worker) => {
			mitarbeiterSoll += worker.jobInfo.maxAvailableHours;
		});

		let mitarbeiterIst = 0;
		let verbuchteSchichten = 0;
		workers.forEach((worker) => {
			worker.workDays.forEach((day) => {
				if (day.tablePropId !== tablePropId) return;
				mitarbeiterIst += day.hours;
				verbuchteSchichten++;
			});
		});

		return {
			tage,
			maxStunden,
			mitarbeiterSoll,
			mitarbeiterIst,
			verbuchteSchichten
		};
	}
</script>

<div class="Container">
	<h2>Info</h2>
	<div>
		<div class="LabelValue">
			Tage: {infoDisplayData.tage}
		</div>
		<div class="LabelValue">
			Max Stunden: {infoDisplayData.maxStunden}
		</div>
		<div class="LabelValue">
			Mitarbeiter Soll: {infoDisplayData.mitarbeiterSoll}
		</div>
		<div class="LabelValue">
			Mitarbeiter Ist: {infoDisplayData.mitarbeiterIst}
		</div>
		<div class="LabelValue">
			Verbuchte Schichten: {infoDisplayData.verbuchteSchichten}
		</div>
		<div style="display:flex;gap:1em; flex-direction:column; padding-top: 1em">
			<button on:click={() => validateTable()}>Schichtplan Checken</button>
			<button style="background-color:rgba(200, 50, 25, 0.1)">GEN</button>
		</div>
	</div>
</div>
<div style="margin-top:1em; padding-top:1em" class="Container">
	<Table days={_newDays} stats={workerStats} />
</div>

<style>
	button {
		border: none;
		border-radius: 4px;
		background-color: rgba(135, 206, 235, 0.1);
		color: #333;
		padding: 6px 12px;
		font-size: 14px;
		font-weight: bold;
		letter-spacing: 1px;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	button:hover {
		background-color: rgba(135, 206, 235, 0.3);
		color: black;
	}

	.Container {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		padding: 1em;
		padding-top: 1em;
		padding-top: 0em;
		background-color: white;
		overflow: hidden;
		border-radius: 0.5em;
	}

	h2 {
		background-color: #f8f8f8;
		padding: 0.1em;
		border-radius: 0.1em;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
	}
</style>
