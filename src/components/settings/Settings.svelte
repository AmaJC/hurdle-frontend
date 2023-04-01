<script lang="ts">
	import { onMount } from "svelte";
	import { settings, backendURL } from "../../stores";
	import Setting from "./Setting.svelte";
	import Switch from "./Switch.svelte";
	import Button from "./Button.svelte";

	let root: HTMLElement;
	onMount(() => {
		root = document.documentElement;
	});
	$: {
		if (root) {
			$settings.dark ? root.classList.remove("light") : root.classList.add("light");
			localStorage.setItem("settings", JSON.stringify($settings));
		}
	}
</script>

<!-- To add more features to Tuffle, you can add more settings below! -->
<!-- <svelte:body class:light={!$settings.dark} /> -->
<div class="outer">
	<div class="settings-top">
		<h3>settings</h3>
		<Setting>
			<span slot="title">Dark Mode</span>
			<span slot="value"><Switch bind:value={$settings.dark} /></span>
		</Setting>
		<Setting>
			<span slot="title">Backend URL</span>
			<span slot="value"><Button text="Change" click={() => backendURL.set("localstorage")} /></span>
		</Setting>
	</div>
</div>

<style>
	.outer {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	:global(.settings-top > div) {
		border-bottom: 1px solid var(--border-primary);
	}
	.settings-top h3 {
		padding: 16px 0;
	}
</style>
