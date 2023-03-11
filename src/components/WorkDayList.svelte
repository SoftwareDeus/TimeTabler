<script lang="ts">
	import { updateWorker, updateWorkerShift } from '../stores/shiftWorkerStore';
	import type { WorkDay, ShiftWorker } from '../stores/shiftWorkerStore';
	import dayjs from 'dayjs';
	import { MonthsEnum } from '../types/enums';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let _selectedWorker: ShiftWorker | null = null;
	let _selectedShift: WorkDay;

	$: selectedWorker = _selectedWorker;
	$: selectedShift = _selectedShift;
	$: newEndTime = dayjs(selectedShift?.day.shift.endTime).format('HH:mm');
	$: newStartTime = dayjs(selectedShift?.day.shift.startTime).format('HH:mm');
	$: newShift = { ...selectedShift };

	function deleteShift(day: WorkDay) {
		if (selectedWorker) {
			selectedWorker.workDays = selectedWorker.workDays.filter(
				(_day) => !(_day === day)
			);
			updateWorker(selectedWorker);
			selectedWorker = selectedWorker;
			selectedShift = selectedWorker.workDays.find(
				(shift) => shift.id === newShift.id
			)!;
			dispatch('shiftsUpdated', selectedWorker);
		}
	}

	function handleSubmitEditShiftInfo() {
		if (!selectedWorker) return;

		updateWorkerShift(selectedWorker, newShift);
		selectedWorker = selectedWorker;
	}

	function handleEarlyLateRadio(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): any {
		if (!selectedWorker) return;
	}

	function handleEndTimeChange(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): any {
		const [hours, minutes] = event.currentTarget.value
			.split(':')
			.map((timeStringSplit) => parseInt(timeStringSplit));

		const newEndTime = new Date(newShift.day!.shift.endTime!);

		newEndTime.setHours(hours, minutes);

		newShift.day!.shift.endTime = newEndTime;
	}

	function handleStartTimeChange(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): any {
		const [hours, minutes] = event.currentTarget.value
			.split(':')
			.map((timeStringSplit) => parseInt(timeStringSplit));

		const newStartTime = new Date(newShift.day!.shift.startTime!);

		newStartTime.setHours(hours, minutes);

		newShift.day!.shift.startTime = newStartTime;
	}
</script>

<div class="DayListContainer">
	{#if selectedWorker}
		<h2>Schichten</h2>
		<div class="WorkerDayList" style="flex: 1;">
			{#each selectedWorker.workDays as workDay}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class:highlight={selectedShift === workDay} class="ShiftListItem">
					<div
						on:click={() => {
							selectedShift = workDay;
						}}
						class="ShiftListItemInfo"
					>
						<div class="ShiftListItemTime">
							{workDay.hours} Std - {workDay.day.index}.{MonthsEnum[
								new Date(workDay.day.shift.startTime).getMonth()
							]}
							<br />
							{dayjs(workDay.day.shift.startTime).format('HH:mm')} - {dayjs(
								workDay.day.shift.endTime
							).format('HH:mm')}
						</div>
					</div>
					<button on:click={() => deleteShift(workDay)}>X</button>
				</div>
			{/each}
		</div>
		<div class="WorkerDayEdit">
			<form
				on:submit|preventDefault={handleSubmitEditShiftInfo}
				style="display: flex; justify-content:space-between"
			>
				<div>
					<label class="CreateWorkerLabel">
						Start:
						<input
							style="float:right;"
							bind:value={newStartTime}
							type="time"
							on:change={handleStartTimeChange}
						/>
					</label>

					<label class="CreateWorkerLabel">
						Ende:
						<input
							style="float:right;"
							bind:value={newEndTime}
							type="time"
							on:change={handleEndTimeChange}
						/>
					</label>
				</div>
				<div>
					<label class="CreateWorkerLabel">
						Früh
						<input
							on:change={handleEarlyLateRadio}
							style="float:right;"
							name="isEarlyLate"
							type="radio"
							value="early"
						/>
					</label>
					<label class="CreateWorkerLabel">
						Spät
						<input
							on:change={handleEarlyLateRadio}
							style="float:right;"
							name="isEarlyLate"
							type="radio"
							value="late"
						/>
					</label>
				</div>
				<button type="submit">Bearbeite <br />Schicht</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.DayListContainer {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

		padding: 1em;
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
	.WorkerDayEdit {
		padding: 1em;
		padding-right: 0em;
		margin-right: 1em;
	}
	.highlight {
		background-color: whitesmoke;
	}
	.CreateWorkerLabel {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.ShiftListItem {
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 0.25em;
		border-radius: 0.5em;
	}
	.ShiftListItem:hover {
		background-color: whitesmoke;
		cursor: pointer;
		transition: 250ms;
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
</style>
