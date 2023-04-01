<script lang="ts">
	import { getRowData } from "../../utils";

	import Row from "./Row.svelte";
	import { createEventDispatcher } from "svelte";
	import { scale } from "svelte/transition";

	export let value: string[];
	export let board: GameBoard;
	export let guesses: number;
	export function shake(row: number) {
		rows[row].shake();
	}
	export function bounce(row: number) {
		rows[row].bounce();
	}
	export function hideCtx(e?: MouseEvent) {
		if (!e || !e.defaultPrevented) showCtx = false;
	}
	const dispatch = createEventDispatcher();

	let rows: Row[] = [];
	let showCtx = false;
	let pAns = 0;
	let pSols = 0;
	let x = 0;
	let y = 0;
	let word = "";

	function context(cx: number, cy: number, num: number, val: string) {
		if (guesses >= num) {
			x = cx;
			y = cy;
			showCtx = true;
			word = guesses > num ? val : "";

			const match = getRowData(num, board);
			// pAns = words.words.filter((w) => match(w)).length;
			// pSols = pAns + words.valid.filter((w) => match(w)).length;
		}
	}
</script>

<div class="board">
	{#each value as _, i}
		<Row
			num={i}
			{guesses}
			bind:this={rows[i]}
			bind:value={value[i]}
			state={board.state[i]}
			on:ctx={(e) => context(e.detail.x, e.detail.y, i, value[i])}
		/>
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid-template-rows: repeat(var(--rows), 1fr);
		gap: 5.5px;
		max-height: 420px;
		flex-grow: 1;
		aspect-ratio: var(--cols) / var(--rows);
		padding: 10px;
		position: relative;
	}
</style>
