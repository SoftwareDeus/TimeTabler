<script lang="ts">
	import { stateStore } from './../stores/stateStore';
	import WorkDayList from './WorkDayList.svelte';
	import {
		addWorker,
		deleteWorker,
		updateWorker,
		workerStore
	} from '../stores/shiftWorkerStore';
	import type { WorkDay, ShiftWorker } from '../stores/shiftWorkerStore';
	import { v4 as uuidv4 } from 'uuid';
	import type { Shift, ShiftTimes } from '../stores/shiftConfigStore';
	import {
		setShiftFromWorkday,
		tablePropsStore
	} from '../stores/tablePropsStore';
	import { milisecToHours } from '../stores/helpers';

	export let _tablePropId: string;
	$: tablePropId = _tablePropId;
	let newWorker: ShiftWorker = {
		colorHex: '#000040',
		createdAt: new Date(),
		id: 'NOID',
		firstName: '',
		lastName: '',
		jobInfo: {
			maxAvailableHours: 0,
			isBoss: false
		},
		workDays: []
	};
	function getNewWorkDay(_tablePropId: string): WorkDay {
		const tableProp = $tablePropsStore.find((prop) => prop.id === _tablePropId);
		const tempDate = new Date(tableProp?.date ?? '');
		return {
			tablePropId,
			id: 'NOID',
			hours: 8,
			day: {
				index: 1,
				shift: {
					startTime: new Date(new Date(tempDate).setHours(8, 0)),
					endTime: new Date(new Date(tempDate).setHours(16, 30))
				}
			}
		};
	}
	$: newWorkDay = getNewWorkDay(tablePropId);

	$: workers = $workerStore!;
	let selectedWorkerId = $stateStore.workerId;

	stateStore.subscribe((state) => {
		selectedWorkerId = state.workerId;
		workers = $workerStore!;
	});
	$: selectedWorker = $workerStore.find(
		(worker) => worker.id === selectedWorkerId
	);
	$: shiftErrorText = '';

	workerStore.subscribe((value) => (workers = value));

	function handleRadioChange(type: string) {
		const tableProps = $tablePropsStore.find(
			(_prop) => _prop.id === tablePropId
		)!;

		if (type === 'early') {
			newWorkDay.day.shift = {
				startTime: new Date(tableProps.shiftTimes.early.startTime),
				endTime: new Date(tableProps.shiftTimes.early.endTime)
			};
		} else if (type === 'late') {
			newWorkDay.day.shift = {
				startTime: new Date(tableProps.shiftTimes.late.startTime),
				endTime: new Date(tableProps.shiftTimes.late.endTime)
			};
		}

		newWorkDay = newWorkDay;
	}

	function handleStartTimeInput(event: Event) {
		const target = event.target as HTMLInputElement;

		const tmpValues = String(target.value).match(/^(\d+):(\d+)$/);

		const hours = Number(tmpValues![1]);
		const minutes = Number(tmpValues![2]);

		const newDate = new Date();

		newDate.setHours(hours, minutes);
		newWorkDay.day.shift.startTime = new Date(newDate);
		newWorkDay.hours =
			Math.round(
				milisecToHours(
					new Date(newWorkDay.day.shift.endTime).valueOf() -
						new Date(newWorkDay.day.shift.startTime).valueOf()
				) * 10
			) / 10;

		if (newWorkDay.hours <= 0)
			setShiftErrorText('FIX FIX FIX der sollte den nächsten Tag nehmen');
	}

	function handleEndTimeInput(event: Event) {
		const target = event.target as HTMLInputElement;

		const tmpValues = String(target.value).match(/^(\d+):(\d+)$/);

		const hours = Number(tmpValues![1]);
		const minutes = Number(tmpValues![2]);

		const newDate = new Date();

		newDate.setHours(hours, minutes);
		newWorkDay.day.shift.endTime = new Date(newDate);
		newWorkDay.hours =
			Math.round(
				milisecToHours(
					new Date(newWorkDay.day.shift.endTime).valueOf() -
						new Date(newWorkDay.day.shift.startTime).valueOf()
				) * 10
			) / 10;

		if (newWorkDay.hours <= 0)
			setShiftErrorText('FIX FIX FIX der sollte den nächsten Tag nehmen');
	}

	function handleSubmitCreateShift() {
		setShiftErrorText('');

		const tempWorkDay: WorkDay = {
			...newWorkDay,
			tablePropId,
			id: uuidv4()
		};

		if (
			selectedWorker?.workDays.find(
				(_workDay) =>
					_workDay.day.index === tempWorkDay.day.index &&
					_workDay.tablePropId === tablePropId
			)
		) {
			setShiftErrorText('Mitarbeiter hat an diesem Tag schon eine schicht');
			return;
		}

		selectedWorker?.workDays.push(tempWorkDay);

		newWorkDay = {
			tablePropId,
			id: 'NOID',
			hours: 8,
			day: {
				index: 1,
				shift: {
					startTime: new Date(new Date().setHours(8, 0)),
					endTime: new Date(new Date().setHours(16, 30))
				}
			}
		};

		setShiftFromWorkday(tablePropId, selectedWorker!, tempWorkDay);
		updateWorker(selectedWorker!);
		resetState('true');
	}

	function resetState(trigger: string) {
		$stateStore = $stateStore;
	}

	function setShiftErrorText(text: string) {
		shiftErrorText = text;

		setTimeout(() => {
			shiftErrorText = '';
		}, 5000);
	}

	function getWorkerStats(worker: ShiftWorker): string {
		let shifts = 0;
		let hours = 0;
		worker.workDays
			.filter((workDay) => workDay.tablePropId === tablePropId)
			.forEach((workDay) => {
				hours += workDay.hours;
				shifts++;
			});

		return `${shifts}. Sch...  :  ${hours}h`;
	}

	function handleSubmitEditWorker() {
		const firstNameInput = document.querySelector(
			'input[name="editFirstName"]'
		) as HTMLInputElement;
		const lastNameInput = document.querySelector(
			'input[name="editLastName"]'
		) as HTMLInputElement;
		const maxHoursInput = document.querySelector(
			'input[name="editMaxHours"]'
		) as HTMLInputElement;
		const priorityInput = document.querySelector(
			'input[name="editBoss"]'
		) as HTMLInputElement;
		console.log(priorityInput.value);
		const firstName = firstNameInput.value;
		const lastName = lastNameInput.value;
		const maxAvailableHours = parseInt(maxHoursInput.value, 10);
		const isBoss = priorityInput.value === 'true';

		// Update the selectedWorker with the new data
		selectedWorker = {
			...selectedWorker!,
			firstName,
			lastName,
			jobInfo: { maxAvailableHours, isBoss }
		};

		updateWorker(selectedWorker);
		selectedWorker = selectedWorker;
	}

	function handleSubmitCreateWorker() {
		console.log(newWorker);
		const tempWorker: ShiftWorker = {
			colorHex: newWorker.colorHex,
			createdAt: new Date(),
			id: uuidv4(),
			firstName: newWorker.firstName,
			lastName: newWorker.lastName,
			jobInfo: {
				maxAvailableHours: newWorker.jobInfo.maxAvailableHours,
				isBoss: newWorker.jobInfo.isBoss
			},
			workDays: []
		};

		addWorker(tempWorker);

		newWorker = {
			colorHex: '#000040',

			createdAt: new Date(),

			id: 'NOID',
			firstName: '',
			lastName: '',
			jobInfo: {
				maxAvailableHours: 0,
				isBoss: false
			},
			workDays: []
		};

		workers = $workerStore;
	}

	function handleHoursInput(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): any {
		newWorkDay.day.shift.endTime.setHours(
			newWorkDay.day.shift.startTime.getHours() +
				parseInt(event.currentTarget.value)
		);
		newWorkDay = newWorkDay;
	}
</script>

<div class="Container">
	<div class="WorkerListCreateContainer">
		<div class="WorkersList">
			<h2>Arbeiter</h2>
			{#if workers}
				<div>
					{#each workers as worker}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							style={`background: ${worker.colorHex}30`}
							class="WorkersListItem"
							class:hightlightRow={worker === selectedWorker}
							on:click={(e) => {
								$stateStore.workerId = worker.id;
							}}
						>
							<div>
								{worker.firstName}
								{worker.lastName}
							</div>
							<div>{getWorkerStats(worker)}</div>
							{#if worker.jobInfo.isBoss}
								Boss
							{/if}
							<button on:click={() => deleteWorker(worker)}>X</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="CreateWorker">
			<form
				on:submit|preventDefault={handleSubmitCreateWorker}
				style="display: flex; gap: 0.5em; height:100%; flex-direction: column; justify-content:space-between"
			>
				<h2>Neuer Arbeiter</h2>
				<label class="CreateWorkerLabel">
					Farbe:
					<input
						type="color"
						id="head"
						name="head"
						bind:value={newWorker.colorHex}
					/>
				</label>
				<label class="CreateWorkerLabel">
					Vorname:
					<input
						style="float:right;"
						type="text"
						bind:value={newWorker.firstName}
						required
					/>
				</label>

				<label class="CreateWorkerLabel">
					Nachname:
					<input
						style="float:right;"
						type="text"
						bind:value={newWorker.lastName}
						required
					/>
				</label>
				<label class="CreateWorkerLabel">
					Max Stunden:
					<input
						style="float:right;"
						type="number"
						disabled={newWorker.jobInfo.isBoss}
						bind:value={newWorker.jobInfo.maxAvailableHours}
					/>
				</label>
				<label class="CreateWorkerLabel">
					Mitarbeiter Prio:
					<input
						style="float:right;"
						type="checkbox"
						bind:checked={newWorker.jobInfo.isBoss}
					/>
				</label>
				<button type="submit">Erstelle Arbeiter</button>
			</form>
		</div>
	</div>
	{#if selectedWorker}
		<div class="EditWorker">
			<h2>
				Bearbeite {selectedWorker.firstName}
				{selectedWorker.lastName}
			</h2>
			<div class="EditWorkerContainer">
				<form
					on:submit|preventDefault={handleSubmitEditWorker}
					style="flex: 2 1 0%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    "
				>
					<label class="CreateWorkerLabel">
						Vorname:
						<input
							name="editFirstName"
							style="float:right;"
							type="text"
							value={selectedWorker.firstName}
							required
						/>
					</label>

					<label class="CreateWorkerLabel">
						Nachname:
						<input
							name="editLastName"
							style="float:right;"
							type="text"
							value={selectedWorker.lastName}
							required
						/>
					</label>
					<label class="CreateWorkerLabel">
						Max Stunden:
						<input
							name="editMaxHours"
							style="float:right;"
							type="number"
							value={selectedWorker.jobInfo.maxAvailableHours}
						/>
					</label>
					<label class="CreateWorkerLabel">
						Mitarbeiter Prio:
						<input
							name="editBoss"
							style="float:right;"
							type="checkbox"
							value={selectedWorker.jobInfo.isBoss}
						/>
					</label>
					<button type="submit">Aktuallisiere Arbeiter</button>
				</form>

				<div style="flex:2" class="WorkerDayCreate">
					<form
						style="height: 100%; display:flex; justify-content:space-between; flex-direction:column"
						on:submit|preventDefault={handleSubmitCreateShift}
					>
						{#if shiftErrorText !== ''}
							<div class="ErrorDisplay">{shiftErrorText}</div>
						{/if}
						<div
							style="display: flex;
						justify-content: flex-end;"
						>
							Früh
							<input
								on:change={() => handleRadioChange('early')}
								style="float:right;"
								name="isEarlyLate"
								type="radio"
								value="early"
								checked
							/>
							Spät
							<input
								on:change={() => handleRadioChange('late')}
								style="float:right;"
								name="isEarlyLate"
								type="radio"
								value="late"
							/>
						</div>

						<label class="CreateWorkerLabel">
							Tag:
							<input
								type="number"
								min="1"
								bind:value={newWorkDay.day.index}
								required
							/>
						</label>
						<label class="CreateWorkerLabel">
							Start:
							<input
								type="time"
								value={new Date(
									newWorkDay.day.shift.startTime
								).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
								required
								on:change={handleStartTimeInput}
							/>
						</label>

						<label class="CreateWorkerLabel">
							Ende:
							<input
								type="time"
								value={new Date(
									newWorkDay.day.shift.endTime
								).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
								required
								on:change={handleEndTimeInput}
							/>
						</label>
						<label class="CreateWorkerLabel">
							Stunden:
							<input
								on:change={handleHoursInput}
								type="number"
								bind:value={newWorkDay.hours}
							/>
						</label>
						<button type="submit">Erstelle Schicht</button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
<WorkDayList
	{selectedWorkerId}
	{tablePropId}
	on:shiftsUpdated={() => (workers = $workerStore)}
/>

<style>
	.ErrorDisplay {
		padding: 0.1em;
		margin: 0.4em;
		margin-top: 0em;
		background: rgba(200, 100, 100, 0.3);
		border-radius: 0.1em;
		font-weight: 600;
		font-size: 14px;
		color: rgba(220, 80, 80);
	}
	h2 {
		background-color: #f8f8f8;
		padding: 0.1em;
		border-radius: 0.1em;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
	}
	.WorkerListCreateContainer {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}
	.Container {
		display: flex;
		flex-direction: column;
		gap: 1em;
		gap: 1em;
		min-width: 700px;
	}
	.EditWorker {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		padding: 1em;
		padding-top: 0em;
		background-color: white;
		overflow: hidden;
		border-radius: 0.5em;
	}
	.CreateWorker {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

		padding: 1em;
		padding-top: 0em;

		background-color: white;
		width: 40%;
		overflow: hidden;
		border-radius: 0.5em;
	}
	.WorkerDayCreate {
		display: flex;
		flex-direction: column;
	}
	.CreateWorkerLabel {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.hightlightRow {
		background-color: whitesmoke;
	}
	.WorkersList {
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		padding: 1em;
		padding-top: 0em;

		background-color: white;
		width: 40%;
		overflow: hidden;
		border-radius: 0.5em;
		list-style: none;
	}

	.WorkersListItem {
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 2px;
		align-items: center;
		border-radius: 0.5em;
		margin: 2px;
	}
	.WorkersListItem:hover {
		background-color: whitesmoke;
		cursor: pointer;
		transition: 250ms;
	}
	.EditWorkerContainer {
		display: flex;
		justify-content: space-between;
		gap: 1em;
		height: 150px;
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
