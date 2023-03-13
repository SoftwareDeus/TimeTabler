<script lang="ts">
	import {
		getTablePropsFromTimeTabler,
		initTablePropData,
		tablePropsStore,
		createTableProp,
		type TableProp
	} from '../../../../../stores/tablePropsStore';
	import CreateTable from '../../../../../components/CreateTable.svelte';
	import ShiftTable from '../../../../../components/ShiftTable.svelte';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import type { TableCreateConfig } from '../../../../../stores/tablePropsStore';
	import { stateStore } from '../../../../../stores/stateStore';

	let timeTablerId: string = $page.params.timeTablerId;

	$: tablePropId = $page.params.tablePropId;
	$: setTimeTablerId(timeTablerId);

	function setTimeTablerId(timeTablerId: string) {
		$stateStore.timeTablerId = timeTablerId;
	}

	function getNewTableProp(_tablePropId: string) {
		return $tablePropsStore.find((prop) => prop.id === tablePropId)!;
	}

	$: tableProp = getNewTableProp(tablePropId);
	$: initTableProp(tableProp);
	$: showCreate = true;

	$: beforeTablePropId = getBeforeTablePropId(tableProp);

	function getBeforeTablePropId(_tableProp: TableProp): string {
		const beforeTableProp = getTablePropsFromTimeTabler(timeTablerId).find(
			(prop) => prop.index === _tableProp.index - 1
		);

		return beforeTableProp?.id ?? '';
	}

	$: afterTablePropId = getAfterTablePropId(tableProp);

	function getAfterTablePropId(_tableProp: TableProp): string {
		const afterTableProp = getTablePropsFromTimeTabler(timeTablerId).find(
			(prop) => prop.index === _tableProp.index + 1
		);

		return afterTableProp?.id ?? '';
	}

	function initTableProp(_tableProp: TableProp) {
		if (!tableProp) return;
		let lastTableProps = getTablePropsFromTimeTabler(timeTablerId)
			.filter((prop) => prop.id !== tablePropId)
			.sort((propA, propB) => propB.index - propA.index);
		if (
			lastTableProps.length === 0 ||
			(lastTableProps.length > 0 && lastTableProps[0].index > _tableProp.index)
		) {
			if (tableProp.days.length === 0) showCreate = true;
			else showCreate = false;
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
			tableProp = initTablePropData(_tableProp, createTableConfig);
			showCreate = false;
		}
	}

	tablePropsStore.subscribe((_props) => {
		tableProp = _props.find((prop) => prop.id === tablePropId)!;
	});
</script>

{#if showCreate && tableProp}
	<div class="itemContainer">
		<CreateTable
			on:create={(e) => {
				initTableProp(tableProp);
				tableProp = initTablePropData(tableProp, e.detail);
				tableProp = tableProp;
				showCreate = false;
			}}
		/>
	</div>
{:else}
	<div class="itemContainer2">
		{#if beforeTablePropId !== ''}
			<a href={`${beforeTablePropId}`}
				><span>Letzer <br />Schichtplan</span>
			</a>
		{:else}
			<a href={`${tablePropId}`}>
				<span>Letzer <br />Schichtplan</span>
			</a>
		{/if}
		<ShiftTable {tablePropId} />
		{#if afterTablePropId !== ''}
			<a href={`${afterTablePropId}`}>Nächster <br /> Schichtplan</a>
		{:else}
			<a
				href={`${tablePropId}`}
				on:click={() => {
					tablePropId = createTableProp(timeTablerId);
					tableProp = getNewTableProp(timeTablerId);
				}}>Nächster <br /> Schichtplan</a
			>
		{/if}
	</div>
	<!-- else content here -->
{/if}

<style>
	a {
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-decoration: none;
	}

	a:hover {
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
		background-color: ghostwhite;
		flex-wrap: wrap;
		padding-bottom: 1em;
	}
</style>
