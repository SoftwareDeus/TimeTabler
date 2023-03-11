<script lang="ts">
	import {
		getTablePropsFromTimeTabler,
		initTablePropData,
		tablePropsStore,
		type TableCreateConfig,
		type TableProp
	} from '../../../../../stores/tablePropsStore';
	import CreateTable from '../../../../../components/CreateTable.svelte';
	import ShiftTable from '../../../../../components/ShiftTable.svelte';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';

	let tablePropId: string = $page.params.tablePropId;
	let timeTablerId: string = $page.params.timeTablerId;

	let tableProp: TableProp = $tablePropsStore.find(
		(prop) => prop.id === tablePropId
	)!;
	let showCreate: boolean = true;
	if (tableProp) {
		let lastTableProps = getTablePropsFromTimeTabler(timeTablerId)
			.filter((prop) => prop.id !== tablePropId)
			.sort((propA, propB) => propB.index - propA.index);
		if (
			lastTableProps.length === 0 ||
			(lastTableProps.length > 0 && lastTableProps[0].index > tableProp.index)
		) {
			showCreate = true;
		} else {
			const lastTableProp = lastTableProps[0];
			const createTableConfig: TableCreateConfig = {
				monthDate: new Date(lastTableProp.date),
				earlyStart: dayjs(lastTableProp.shiftTimes.early.startTime).format(
					'HH:mm'
				),
				earlyEnd: dayjs(lastTableProp.shiftTimes.early.endTime).format('HH:mm'),
				lateStart: dayjs(lastTableProp.shiftTimes.late.startTime).format(
					'HH:mm'
				),
				lateEnd: dayjs(lastTableProp.shiftTimes.late.endTime).format('HH:mm')
			};
			createTableConfig.monthDate.setMonth(
				createTableConfig.monthDate.getMonth() + 1
			);
			tableProp = initTablePropData(tableProp, createTableConfig);
			showCreate = false;
		}
	}
	tablePropsStore.subscribe((_props) => {
		tableProp = _props.find((prop) => prop.id === tablePropId)!;
	});
</script>

{#if showCreate}
	<div class="itemContainer">
		<CreateTable
			on:create={(e) => {
				tableProp = initTablePropData(tableProp, e.detail);
				showCreate = false;
			}}
		/>
	</div>
{/if}
{#if !showCreate}
	<div class="itemContainer2">
		<button>Letzer <br /> Schichtplan</button>
		<ShiftTable {tablePropId} />
		<button>Nächster <br /> Schichtplan</button>
	</div>
{/if}

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

	.itemContainer {
		min-width: 800px;
		padding-top: 1em;
		display: flex;
		text-align: center;
		gap: 1em;
		justify-content: center;
		background-color: ghostwhite;
		flex-wrap: wrap;
		padding-bottom: 1em;
		flex-direction: column;
		align-content: center;
	}

	.itemContainer2 {
		min-width: 800px;
		padding-top: 1em;
		display: flex;
		text-align: center;
		gap: 1em;
		justify-content: center;
		background-color: lightsalmon;
		flex-wrap: wrap;
		padding-bottom: 1em;
	}
</style>
