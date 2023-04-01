<script lang="ts">
	import { modeData } from "../../../utils";

	import Stat from "./Stat.svelte";
	export let data: Stats;

	let stats: [string, string | number][];
	$: {
		stats = [
			["Played", data.played],
			["Win %", Math.round(((data.played - data.guesses.fail) / data.played) * 100) || 0],
		];
		if (data.guesses.fail > 0) {
			stats.push(["Lost", data.guesses.fail]);
		}
		if ("streak" in data) {
			stats.push(["Current Streak", data.streak]);
			stats.push(["Max Streak", data.maxStreak]);
		}
	}
</script>

<h3>Statistics</h3>
<div>
	{#each stats as stat}
		<Stat name={stat[0]} stat={stat[1]} />
	{/each}
</div>

<style>
	div {
		display: flex;
		justify-content: center;
		gap: 8px;
	}
</style>
