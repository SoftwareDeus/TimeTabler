<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const months = [
		{ value: '01', name: 'Januar' },
		{ value: '02', name: 'Februar' },
		{ value: '03', name: 'März' },
		{ value: '04', name: 'April' },
		{ value: '05', name: 'Mai' },
		{ value: '06', name: 'Juni' },
		{ value: '07', name: 'Juli' },
		{ value: '08', name: 'August' },
		{ value: '09', name: 'September' },
		{ value: '10', name: 'Oktober' },
		{ value: '11', name: 'November' },
		{ value: '12', name: 'Dezember' }
	];

	const now = new Date();
	let month = '01';
	let year = now.getFullYear().toString();

	function handleChange(): Date {
		if (month && year) {
			const date = new Date(`${year}-${month}-01`);
			dispatch('change', date);
		}
		return new Date();
	}
</script>

<div>
	<label>
		Monat:
		<select bind:value={month} on:change={handleChange}>
			{#each months as m}
				<option value={m.value} selected={m.value === month}>{m.name}</option>
			{/each}
		</select>
	</label>
	<label>
		Jahr:
		<input
			type="number"
			min="1900"
			max="2100"
			step="1"
			bind:value={year}
			on:input={handleChange}
		/>
	</label>
</div>
