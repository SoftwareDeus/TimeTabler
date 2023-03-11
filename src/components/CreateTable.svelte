<script lang="ts">
	import type { TableCreateConfig } from './../stores/tablePropsStore';
	import MonthYearPicker from './MonthYearPicker.svelte';
	import { createEventDispatcher } from 'svelte';
	let monthDate: Date = new Date();
	const dispatch = createEventDispatcher();

	let earlyStart = '08:00';
	let earlyEnd = '16:30';
	let lateStart = '16:30';
	let lateEnd = '01:00';

	function handleSubmit() {
		const tableCreateConfig: TableCreateConfig = {
			monthDate,
			earlyStart,
			earlyEnd,
			lateStart,
			lateEnd
		};
		dispatch('create', tableCreateConfig);
	}
</script>

<h1>Monat auswählen</h1>
<MonthYearPicker
	on:change={(e) => {
		monthDate = e.detail;
	}}
/>
<div style="display:flex; gap: 1em;">
	<div
		style="display:flex; flex-direction:column; justify-content:space-between; height:100%"
	>
		<label>
			Früh Start:
			<input bind:value={earlyStart} type="time" />
		</label>
		<label>
			Früh Ende:
			<input bind:value={earlyEnd} type="time" />
		</label>
	</div>
	<div
		style="display:flex; flex-direction:column; justify-content:space-between; height:100%"
	>
		<label>
			Spät Start:
			<input bind:value={lateStart} type="time" />
		</label>
		<label>
			Spät Ende:
			<input bind:value={lateEnd} type="time" />
		</label>
	</div>
</div>
<button on:click={handleSubmit}>Weiter</button>
