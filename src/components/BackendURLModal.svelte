<script lang="ts">
	import Modal from './Modal.svelte';
	import { onDestroy } from 'svelte';
	import { backendURL } from "../stores";
  import { BACKEND_URL as defaultURL } from "../../config";
	import { get } from "svelte/store";

	let url = defaultURL;

	let isLocalStorage = false;
	// I don't know of a better way.
	onDestroy(backendURL.subscribe((value) => {
		isLocalStorage = value === "localstorage";
	}));
</script>

<Modal bind:visible={isLocalStorage} closable={false}>
	<form on:submit|preventDefault={() => backendURL.set(url)}>
		<h1>Backend URL</h1>
		<p>
			Enter the URL of the backend server. If you don't know what this is,
			refer to the documentation or leave it as-is.
		</p>
		<fieldset>
			<input
				bind:value={url}
				placeholder={defaultURL}
				on:input={() => {
					if (url.endsWith("/")) {
						url = url.slice(0, -1);
					}
				}}
			/>
			<button type="submit">Save</button>
		</fieldset>
	</form>
</Modal>

<style>
	p {
		margin: 1em 0;
	}

	input,
	button {
		border-radius: 4px;
		border: 1px solid var(--bg-secondary);
		padding: 0.5em;
	}

	fieldset {
		display: flex;
		flex-direction: row;
		gap: 0.5em;
	}

	fieldset > input {
		flex: 1;
	}
</style>
