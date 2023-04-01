<script lang="ts">
	export let click = () => {};
	export let text = "Button";
	export let disabled = false;
</script>

<div on:click={click} {disabled}>{text}</div>

<style lang="scss">
	div[disabled="true"] {
		opacity: 0.5;
		cursor: unset;
	}
	div {
		border-radius: 10px;
		background: var(--icon-color);
		position: relative;
		cursor: pointer;
		transition: background-color 0.3s ease;
		padding: 0.5em;
	}
</style>
