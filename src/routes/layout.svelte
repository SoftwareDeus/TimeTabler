<nav class="header">
	<a href="/home">home</a>
	<a href="/config">config</a>
	<a href="/calendar">calendar</a>
</nav>
<div class="main">
	<slot />
</div>

<style>
	.main {
		margin-left: 15em;
		margin-right: 15em;
	}
	.header {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}
</style>
