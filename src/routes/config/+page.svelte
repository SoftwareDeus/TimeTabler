<!-- <script>
	import MonthsConfig from '../../components/MonthsConfig.svelte';
	import WorkerConfig from '../../components/WorkerConfig.svelte';
	import MyTable from '../../components/MyTable.svelte';

	$: index = 1;
</script>

<div class="itemContainer">
	{#if index < 3}
		<button on:click={() => index++}>Weiter</button>
	{/if}
	{#if index > 1}
		<button on:click={() => index--}>Zurück</button>
	{/if}
	{#if index === 1}
		<div class="item boxshadow backgroundBlue">
			<WorkerConfig />
		</div>
	{/if}
	{#if index === 2}
		<div class="item boxshadow backgroundBlue"><MonthsConfig /></div>
	{/if}
	{#if index === 3}
		<div class="item boxshadow backgroundBlack"><MyTable /></div>
	{/if}
</div>

<style>
	.backgroundBlue {
		background-color: rgba(135, 206, 250, 0.095);
	}

	.backgroundBlack {
		background-color: rgba(35, 53, 65, 0.095);
	}
	.itemContainer {
		display: flex;
		flex-direction: column;
		text-align: center;
		gap: 1em;
	}

	.item {
		padding: 1em;
		margin: 1em;
		border-style: solid;
		border-width: 1px;
		border-color: lightgray;
	}

	.boxshadow {
		box-shadow: 0px 0px 88px rgba(0, 0, 0, 0.06);
	}
</style> -->
