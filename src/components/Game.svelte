<script lang="ts">
	import { fade } from "svelte/transition";
	import Header from "./Header.svelte";
	import { Board } from "./board";
	import Keyboard from "./keyboard";
	import Modal from "./Modal.svelte";
	import { getContext, onMount, setContext } from "svelte";
	import Settings from "./settings";
	import {
		Seperator,
		Tutorial,
		Statistics,
		Distribution,
		Timer,
		Toaster,
	} from "./widgets";
	import {
		contractNum,
		DELAY_INCREMENT,
		PRAISE,
		getState,
		modeData,
		ROWS,
		COLS,
		newSeed,
		createNewGame,
		seededRandomInt,
		createLetterStates,
	} from "../utils";
	import {
		letterStates,
		settings,
		mode,
		server_response
	} from "../stores";
	import type { ServerResponse } from "../server_api";
	import {
		emptyResponse,
		boardStateFromServerResponse,
		letterStateFromServerResponse,
		getGame,
		newGame,
	} from "../server_api";

	export let stats: Stats;
	export let game: GameState;
	export let toaster: Toaster;

	setContext("toaster", toaster);
	const version = getContext<string>("version");

	$: $server_response, game.board = {
		words: $server_response["guessedWords"],
		state: boardStateFromServerResponse($server_response),
		guessCount: $server_response["guessCount"],
	};
	$: $server_response, $letterStates = letterStateFromServerResponse($server_response);

	// implement transition delay on keys
	const delay = DELAY_INCREMENT * ROWS + 800;

	let showTutorial = $settings.tutorial === 3;
	let showSettings = false;
	let showStats = false;
	let showRefresh = false;

	let board: Board;
	let timer: Timer;

	function submitWord() {
		// The server should handle the following errors:
		//    1. The guess did not have enough letters.
		//    2. The guess was not a valid word.
		if ($server_response["errorMessage"]) {
			toaster.pop($server_response["errorMessage"]);
			board.shake(game.guesses);
		} else {
			// If it's not an error, then the guess was valid. Increment game.guesses
			// so the Tuffle frontend will flip the colors of the guess.
			++game.guesses;
			if ($server_response["gameStatus"] == "win") {
				win();
			} else if ($server_response["gameStatus"] == "lose") {
				lose();
			}

		}
	}

	function win() {
		board.bounce(game.guesses - 1);
		game.active = false;
		setTimeout(
			() => toaster.pop(PRAISE[game.guesses - 1]),
			DELAY_INCREMENT * COLS + DELAY_INCREMENT
		);
		setTimeout(setShowStatsTrue, delay * 1.4);
		++stats.guesses[game.guesses];
		++stats.played;
		stats.lastGame = modeData.modes[$mode].seed;
		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
	}

	function lose() {
		// Display the tuffle if the player fails to guess it.
		toaster.pop("The tuffle was: " + $server_response["answer"], 2);
		game.active = false;
		setTimeout(setShowStatsTrue, delay);
		++stats.guesses.fail;
		++stats.played;
		stats.lastGame = modeData.modes[$mode].seed;
		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
	}

	function concede() {
		showSettings = false;
		setTimeout(setShowStatsTrue, DELAY_INCREMENT);
		lose();
	}

	function reload() {
		newGame()
			.then((sr) => $server_response = sr);
		game = createNewGame($mode);
		// $letterStates = createLetterStates();
		showStats = false;
		showRefresh = false;
		timer.reset($mode);
	}

	function setShowStatsTrue() {
		if (!game.active) showStats = true;
	}

	onMount(async () => {
		// Restore the previous game state.
		try {
			const currentGame = await getGame();
			$server_response = currentGame;
		} catch(err) {
			console.warn("Failed to restore previous game state:", err);
		}

		if (!game.active) {
			setTimeout(setShowStatsTrue, delay);
		}
	});
</script>

<main class:guesses={game.guesses !== 0} style="--rows: {ROWS}; --cols: {COLS}">
	<Header
		bind:showRefresh
		tutorial={$settings.tutorial === 2}
		on:closeTutPopUp|once={() => ($settings.tutorial = 1)}
		showStats={stats.played > 0 || (modeData.modes[$mode].historical && !game.active)}
		on:stats={() => (showStats = true)}
		on:tutorial={() => (showTutorial = true)}
		on:settings={() => (showSettings = true)}
		on:reload={reload}
	/>
	<Board
		bind:this={board}
		bind:value={$server_response["guessedWords"]}
		tutorial={$settings.tutorial === 1}
		on:closeTutPopUp|once={() => ($settings.tutorial = 0)}
		board={game.board}
		guesses={game.guesses}
		icon={modeData.modes[$mode].icon}
	/>
	<Keyboard
		on:keystroke={() => {
			if ($settings.tutorial) $settings.tutorial = 0;
			board.hideCtx();
		}}
		bind:value={game.board.words[game.guesses === ROWS ? 0 : game.guesses]}
		on:submitWord={submitWord}
		on:esc={() => {
			showTutorial = false;
			showStats = false;
			showSettings = false;
		}}
		disabled={!game.active || $settings.tutorial === 3}
	/>
</main>

<Modal
	bind:visible={showTutorial}
	on:close|once={() => $settings.tutorial === 3 && --$settings.tutorial}
	fullscreen={$settings.tutorial === 0}
>
	<Tutorial visible={showTutorial} />
</Modal>

<Modal bind:visible={showStats}>
	<Statistics data={stats} />
	<Distribution distribution={stats.guesses} {game} />
	<Timer
		bind:this={timer}
		on:reload={reload}
	/>
</Modal>

<Modal fullscreen={true} bind:visible={showSettings}>
	<Settings state={game} />
	{#if game.active}
		<div class="concede" on:click={concede}>give up</div>
	{/if}
</Modal>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		height: 100%;
		max-width: var(--game-width);
		margin: auto;
		position: relative;
	}
	.concede {
		margin-top: 15px;
		text-transform: uppercase;
		color: #fff;
		cursor: pointer;
		font-size: var(--fs-medium);
		font-weight: bold;
		padding: 15px;
		border-radius: 4px;
		text-align: center;
		background-color: var(--red);
		&:hover {
			opacity: 0.9;
		}
	}
</style>
