<script lang="ts">
	import { stateStore } from './../stores/stateStore';
	import {
		getTablePropById,
		setTableProps,
		tablePropsStore
	} from './../stores/tablePropsStore';
	import {
		getEarlyDate,
		getLateDate,
		type ShiftDay
	} from '../stores/tablePropsStore';
	import WorkersConfig from './WorkersConfig.svelte';
	import {
		updateWorker,
		workerStore,
		type ShiftWorker,
		type WorkDay
	} from '../stores/shiftWorkerStore';
	import TableInfo from './TableInfo.svelte';
	const EARLY_SHIFT = 'Früh';
	const LATE_SHIFT = 'Spät';
	import { v4 as uuidv4 } from 'uuid';
	import dayjs from 'dayjs';
	import {
		DaysEnum,
		DaysShortEnum,
		MonthsEnum,
		MonthsShortEnum
	} from '../types/enums';
	import { getTimeStringFromDate, milisecToHours } from '../stores/helpers';
	import tippy, { followCursor } from 'tippy.js';

	type Feiertag = {
		datum: string;
		hinweis: string;
	};

	type FeiertagDictionary = {
		[key: string]: Feiertag;
	};
	export let tablePropId: string;
	$: resetState(tablePropId);
	$: tableProp = $tablePropsStore.find((_prop) => _prop.id === tablePropId)!;
	$: editMode = false;
	$: workers = $workerStore!;
	$: earlyStart = tableProp
		? getTimeStringFromDate(tableProp.shiftTimes.early.startTime)
		: '08:00';
	$: earlyEnd = tableProp
		? getTimeStringFromDate(tableProp.shiftTimes.early.endTime)
		: '16:30';
	$: lateStart = tableProp
		? getTimeStringFromDate(tableProp.shiftTimes.late.startTime)
		: '16:30';
	$: lateEnd = tableProp
		? getTimeStringFromDate(tableProp.shiftTimes.late.endTime)
		: '01:00';
	$: days = tableProp?.days ?? [];
	function resetState(trigger: string) {
		$stateStore = $stateStore;
	}
	stateStore.subscribe((value) => (tableProp = tableProp));
	tablePropsStore.subscribe((tableProps) => {
		const _tableProp = tableProps.find((_prop) => {
			_prop.id === tablePropId;
		});

		if (!_tableProp) return;
		tableProp = _tableProp;
		fetch(
			`https://feiertage-api.de/api/?jahr=${new Date(
				tableProp.date
			).getFullYear()}&nur_land=NW`
		).then((response) =>
			response.json().then((data) => {
				tableProp.holidays = [];

				Object.entries(data as FeiertagDictionary).forEach((key) => {
					if (
						new Date((key[1] as Feiertag).datum).getMonth() ===
						new Date(tableProp.date).getMonth()
					)
						tableProp.holidays.push({
							name: key[0],
							date: new Date((key[1] as Feiertag).datum)
						});
				});
				tableProp.holidays.forEach((holiday) => {
					tippy(`#day-row-${new Date(holiday.date).getDate()}`, {
						content: holiday.name,
						followCursor: true,
						plugins: [followCursor]
					});
				});
			})
		);
	});

	workerStore.subscribe((value) => {
		workers = value;
	});

	function handleEarlySelect(
		e: Event & { currentTarget: EventTarget & HTMLSelectElement },
		day: ShiftDay
	): any {
		if (e.currentTarget.selectedOptions[0]) {
			const tempWorker: ShiftWorker | undefined = $workerStore?.find(
				(worker: ShiftWorker) =>
					worker.id === e.currentTarget.selectedOptions[0].value
			);
			if (tempWorker) {
				const early = getEarlyDate(tableProp, day.day);

				const hours = milisecToHours(
					early.endTime.valueOf() - early.startTime.valueOf()
				);
				0.5; //0.5 pause
				const tempWorkDay: WorkDay = {
					tablePropId,
					id: uuidv4(),
					day: {
						index: day.day,
						shift: { startTime: early.startTime, endTime: early.endTime }
					},
					hours
				};
				tempWorker.workDays.push(tempWorkDay);
				updateWorker(tempWorker);
				const newShiftDay = {
					...tableProp.days.find((_day) => _day.day === day.day)!,
					early: tempWorker
				};

				const newDays = [
					...tableProp.days.filter((_day) => !(_day.day === day.day))!,
					newShiftDay
				].sort((a, b) => a.day - b.day);

				tableProp.days = newDays;
				setTableProps(tableProp);
				tableProp = $tablePropsStore.find((_prop) => _prop.id === tablePropId)!;
			}
		}
	}

	function changeEditMode() {
		editMode = !editMode;
	}

	function handleLateSelect(
		e: Event & { currentTarget: EventTarget & HTMLSelectElement },
		day: ShiftDay
	): any {
		if (e.currentTarget.selectedOptions[0]) {
			const tempWorker: ShiftWorker | undefined = $workerStore?.find(
				(worker: ShiftWorker) =>
					worker.id === e.currentTarget.selectedOptions[0].value
			);
			if (tempWorker) {
				const late = getLateDate(tableProp, day.day);
				const hours =
					(late.endTime.valueOf() - late.startTime.valueOf()) / 1000 / 60 / 60 -
					0.5; //0.5 pause

				const tempWorkDay: WorkDay = {
					tablePropId,
					id: uuidv4(),
					day: {
						index: day.day,
						shift: {
							startTime: late.startTime,
							endTime: late.endTime
						}
					},
					hours
				};
				tempWorker.workDays.push(tempWorkDay);
				updateWorker(tempWorker);
				const newShiftDay = {
					...tableProp.days.find((_day) => _day.day === day.day)!,
					late: tempWorker
				};

				const newDays = [
					...tableProp.days.filter((_day) => !(_day.day === day.day))!,
					newShiftDay
				].sort((a, b) => a.day - b.day);

				tableProp.days = newDays;
				setTableProps(tableProp);
				tableProp = $tablePropsStore.find((_prop) => _prop.id === tablePropId)!;
			}
		}
	}

	function handleSaveEdit(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	): any {
		changeEditMode();
	}

	function handleEdit(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	): any {
		changeEditMode();
	}

	function getDayOfWeek(day: number) {
		const tempDate = new Date(tableProp.date);
		tempDate.setDate(day);
		return DaysEnum[tempDate.getDay()];
	}

	function getHolidayForDay(day: ShiftDay) {
		return tableProp.holidays.find(
			(_day) => new Date(_day.date).getDate() === day.day
		);
	}
</script>

<div class="componentContainer">
	<div class="tableContainer">
		<div class="headerMonthDisplay">
			<!-- {MonthsEnum[new Date(tableProp.date).getMonth()]} - {new Date(
				tableProp.date
			).getFullYear()} -->
		</div>
		<div class="Container">
			<table>
				<thead>
					<tr class="tableRow">
						<th class="tableCell">Tag</th>
						<th class="tableCell">
							{EARLY_SHIFT}
							<input type="time" disabled={!editMode} bind:value={earlyStart} />
							-
							<input type="time" disabled={!editMode} bind:value={earlyEnd} />
						</th>
						<th class="tableCell">
							{LATE_SHIFT}
							<input type="time" disabled={!editMode} bind:value={lateStart} />
							-
							<input type="time" disabled={!editMode} bind:value={lateEnd} />
						</th>
					</tr>
				</thead>
				<tbody>
					{#each days as day}
						<tr
							id={`day-row-${day.day}`}
							class:rowIsHoliday={getHolidayForDay(day)}
						>
							<td class="tableCell headerCell">
								<div>
									<div>
										<b
											>{day.day} - {MonthsShortEnum[
												new Date(tableProp.date).getMonth()
											]}.</b
										>
									</div>
									<div>{getDayOfWeek(day.day)}</div>
								</div>
								<div>
									<div class="fromToInfo">
										{dayjs(day.shiftTimes.early.startTime).format('HH:mm')} -
										{dayjs(day.shiftTimes.early.endTime).format('HH:mm')}
									</div>
									<div class="fromToInfo">
										{dayjs(day.shiftTimes.late.startTime).format('HH:mm')} -
										{dayjs(day.shiftTimes.late.endTime).format('HH:mm')}
									</div>
								</div>
							</td>
							<td>
								<select
									disabled={!editMode}
									on:change={(e) => handleEarlySelect(e, day)}
									style={day.early ? `background: ${day.early.colorHex}30` : ''}
									id={`table-select-early-${day.day}`}
								>
									<option>Unbesetzt</option>
									{#if $workerStore}
										{#each workers.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()) as worker}
											<option
												value={worker.id}
												selected={worker.id === day.early?.id}
											>
												{worker.firstName}
												{worker.lastName}
											</option>
										{/each}
									{/if}
								</select>
							</td>
							<td>
								<select
									disabled={!editMode}
									on:change={(e) => handleLateSelect(e, day)}
									style={day.late ? `background: ${day.late?.colorHex}30` : ''}
									id={`table-select-late-${day.day}`}
								>
									<option>Unbesetzt</option>
									{#if $workerStore}
										{#each workers.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()) as worker}
											<option
												value={worker.id}
												selected={worker.id === day.late?.id}
											>
												{worker.firstName}
												{worker.lastName}
											</option>
										{/each}
									{/if}
								</select>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="tableFooter">
		{#if editMode}
			<button on:click={handleSaveEdit}>Speichern</button>
		{:else if !editMode}
			<button on:click={handleEdit}>Bearbeiten</button>
		{/if}
	</div>
</div>
<div class="InfoContainer">
	<WorkersConfig _tablePropId={tablePropId} />
</div>
<div>
	<TableInfo {tablePropId} {days} workers={$workerStore ?? []} />
</div>

<style>
	.headerMonthDisplay {
		padding: 0.8em;
		padding-top: 0.4em;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		background-color: #b1b1b140;

		border-radius: 4px;
	}
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

	.tableFooter {
		background-color: whitesmoke;
		padding: 1em;
		display: flex;
		justify-content: flex-end;
	}
	.Container {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		border-top-right-radius: 1em;
		border-top-left-radius: 1em;
	}
	select {
		width: 100%;
		height: 100%;
		border: none;
		background: transparent;
		font-size: inherit;
		font-family: inherit;
		text-align: center;
		padding: 8px;
		border-radius: 0.5em;
	}

	.tableCell {
		padding: 8px;
	}
	.headerCell {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}
	select option {
		text-align: center;
	}
	.InfoContainer {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}
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

	select:hover {
		background-color: #f5f5f5;
	}
</style>
