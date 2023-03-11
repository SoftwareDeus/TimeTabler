<script lang="ts">
	import { page } from '$app/stores';
	import {
		getTablePropsFromTimeTabler,
		timeTablerStore,
		type TableProp
	} from '../../../stores/tablePropsStore';
	/***
	 * TODO:
	 * []: Über Timetabler (WIP xd) arbeiten. Ein Timetabler kann mehrere Timetables haben. Also hier sollte schon auf TimeTabler ebene gearbeitet werden
	 * []: Warum geht den der drecks reset nicht???? like wofür hab ich das denn xd eig sollte alles über tablepropid getaked werden können. Ongoood
	 */

	import {
		createTableProp,
		tablePropsStore
	} from '../../../stores/tablePropsStore';
	import { MonthsEnum } from '../../../types/enums';
	let timeTablerId: string = $page.params.timeTablerId;

	let tableProps = getTablePropsFromTimeTabler(timeTablerId);

	tablePropsStore.subscribe((_props) => {
		tableProps = getTablePropsFromTimeTabler(timeTablerId);
	});

	if (tableProps.length === 0) {
		const newTablePropId = createTableProp(timeTablerId);
		tableProps = getTablePropsFromTimeTabler(timeTablerId);
	}
</script>

{#if timeTablerId}
	<div style="width: 100%">
		<h2>Schichtpläne</h2>
	</div>

	<div class="itemContainer">
		<ul>
			{#each tableProps as tableProp}
				<li class="link">
					<a class="link" href={`${timeTablerId}/table/${tableProp.id}`}
						>{MonthsEnum[new Date(tableProp.date).getMonth()]}
						{new Date(tableProp.date).getFullYear()}</a
					>
				</li>
			{/each}
		</ul>
		<form
			style="display: flex; flex-direction:column; justify-content:center; gap:1em"
			on:submit={() => {
				createTableProp(timeTablerId);
				tableProps = getTablePropsFromTimeTabler(timeTablerId);
			}}
		>
			<button type="submit"> Neuen Erstellen </button>
		</form>
	</div>
{:else}
	<h1>Kein TimeTabler gefunden</h1>
{/if}

<style>
	.link:hover {
		color: red;
	}

	.link {
		text-decoration: none;
		font-weight: 700;
		color: black;
	}
	h2 {
		background-color: #f8f8f8;
		padding: 0.1em;
		border-radius: 0.1em;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		text-align: center;
	}
	.itemContainer {
		min-width: 800px;
		padding-top: 1em;
		display: flex;
		text-align: center;
		gap: 1em;
		justify-content: center;
		background-color: whitesmoke;
		flex-wrap: wrap;
		padding-bottom: 1em;
	}
</style>
