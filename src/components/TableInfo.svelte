<script lang="ts">
	import type { ShiftDay } from '../stores/tablePropsStore';
	import type { ShiftWorker } from '../stores/shiftWorkerStore';

	type InfoDisplayData = {
		tage: number;
		maxStunden: number;
		mitarbeiterSoll: number;
		mitarbeiterIst: number;
		verbuchteSchichten: number;
	};

	export let workers: ShiftWorker[];
	export let days: ShiftDay[];
	$: infoDisplayData = getDisplayData(workers, days);

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
	</div>
</div>

<style>
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
