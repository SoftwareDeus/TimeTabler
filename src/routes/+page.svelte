<script>
	import { timeTablerStore, createTimeTabler } from '../stores/tablePropsStore';
	import dayjs from 'dayjs';

	let newTimeTablerName = '';
	$: timeTablers = $timeTablerStore;
	timeTablerStore.subscribe((value) => {
		timeTablers = value;
	});
</script>

<div style="width: 100%">
	<h2>TimeTabler</h2>
</div>
TEEEEEEEEEEEEEEEEEEEEEEEST TEEEEEEEEEEEEEEEEEEEEEEEST TEEEEEEEEEEEEEEEEEEEEEEEST
TEEEEEEEEEEEEEEEEEEEEEEEST TEEEEEEEEEEEEEEEEEEEEEEEST

<div class="itemContainer">
	<ul>
		{#each timeTablers as timeTabler}
			<li class="link">
				<a class="link" href={`timeTabler/${timeTabler.id}`}
					>{timeTabler.name} - {dayjs(timeTabler.createdAt).format(
						'DD/MM/YYYY HH:mm'
					)}</a
				>
			</li>
		{/each}
	</ul>
	<form
		style="display: flex; flex-direction:column; justify-content:center; gap:1em"
		on:submit={() => createTimeTabler(newTimeTablerName)}
	>
		<label>
			Name:
			<input required bind:value={newTimeTablerName} />
		</label>
		<button type="submit"> Neuen Erstellen </button>
	</form>
</div>

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
