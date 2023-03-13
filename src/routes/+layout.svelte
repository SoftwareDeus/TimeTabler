<script>
	import { stateStore } from '../stores/stateStore';

	$: currentTimeTablerId = $stateStore.timeTablerId;

	stateStore.subscribe((state) => {
		currentTimeTablerId = state.timeTablerId;
	});
</script>

<nav class="header">
	<a href="/" on:click={() => ($stateStore.timeTablerId = '')}
		><span>Startseite</span></a
	>
	{#if currentTimeTablerId !== ''}
		<a href={`/timeTabler/${currentTimeTablerId}`}><span>Schichtpläne</span></a>
	{/if}
</nav>
<div class="main">
	<slot />
</div>

<style>
	a {
		height: 100%;
		align-items: center;
		display: flex;
		padding-left: 2em;
		padding-right: 2em;
		transition: all 250ms ease;
		text-decoration: none;
		color: darkslategray;
		font-weight: 600;
		border-radius: 1em;
	}
	a:hover {
		background-color: rgba(204, 204, 204, 0.445);
	}
	.header {
		display: flex;
		width: 100%;
		justify-content: space-around;
		background: rgba(245, 245, 245, 0.322);
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		margin-bottom: 0.5em;
		height: 3em;
		padding: 0.5em;
	}
</style>
