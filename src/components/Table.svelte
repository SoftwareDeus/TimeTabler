<script lang="ts">
	import type { ShiftDay } from '../stores/tablePropsStore';
	import type { WorkerStat } from '../types/types';
	import * as XLSX from 'xlsx';

	export let days: ShiftDay[];
	export let stats: WorkerStat[];

	const handleExportCSV = () => {
		const csvContent = generateCSV(days, stats);
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', 'table.csv');
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const generateCSV = (days: ShiftDay[], stats: WorkerStat[]) => {
		const header = ['Tag', 'Frueh', 'Spaet'];
		const rows: string[][] = [];
		rows.push(header);
		days.forEach((day) => {
			const row: string[] = [];
			row.push(day.day.toString());
			row.push(day.early?.firstName + ' ' + day.early?.lastName || '');
			row.push(day.late?.firstName + ' ' + day.late?.lastName || '');
			rows.push(row);
		});
		// stats.forEach((stat) => {
		// 	const row: string[] = [];
		// 	row.push('');
		// 	row.push('');
		// 	row.push('');
		// 	row.push(stat.firstName[0] + '. ' + stat.lastName);
		// 	row.push(stat.hours.toString());
		// 	row.push(stat.max.toString());
		// 	row.push(stat.boss ? 'Boss' : 'Mitarbeiter');
		// 	rows.push(row);
		// });
		const ws = XLSX.utils.aoa_to_sheet(rows);
		const csvContent = XLSX.utils.sheet_to_csv(ws);
		return csvContent;
	};
</script>

{#if days && days.length > 0}
	<table id="datatable">
		<thead>
			<tr>
				<th class="headerCell">Tag</th>
				<th class="headerCell">Früh</th>
				<th class="headerCell">Spät</th>
			</tr>
		</thead>
		<tbody>
			{#each days as day}
				<tr>
					<td class="tableCell">{day.day}</td>
					<td
						style={day.early ? `background: ${day.early.colorHex}30` : ''}
						class="tableCell">{day.early?.firstName} {day.early?.lastName}</td
					>
					<td
						style={day.late ? `background: ${day.late.colorHex}30` : ''}
						class="tableCell">{day.late?.firstName} {day.late?.lastName}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
	<div style="padding-top:1em">
		<button on:click={handleExportCSV}>Export as CSV</button>

		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Stunden</th>
					<th>Er. St.</th>
					<th>Chef</th>
				</tr>
			</thead>
			<tbody>
				{#if stats}
					{#each stats as stat}
						<tr>
							<td class="tableCell">{stat.firstName[0]}. {stat.lastName}</td>
							<td class="tableCell">{stat.hours}</td>
							<td class="tableCell">{stat.max}</td>
							<td class="tableCell">{stat.boss ? 'Boss' : 'Mitarbeiter'}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.tableContainer {
		overflow-x: auto;
		height: 750px;
	}
	.componentContainer {
		width: 100%;
		max-width: 650px;
		padding: 1em;
		background: white;
		border-radius: 0.5em;
	}

	.fromToInfo {
		font-size: 14px;
	}

	table {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		background-color: white;
		border-collapse: collapse;
		width: 100%;
		font-family: Arial, sans-serif;
	}

	thead {
		background-color: #f8f8f8;
		color: #333;
		font-weight: bold;
	}
	th {
		position: sticky;
	}
	.rowIsHoliday {
		background: rgba(200, 35, 20, 0.2);
	}
	th,
	td {
		text-align: center;
		border-bottom: 1px solid #ddd;
	}

	.tableCell {
		padding: 8px;
	}
</style>
