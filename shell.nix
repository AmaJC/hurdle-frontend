{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
    buildInputs = with pkgs; [
        yarn
        esbuild
        nodejs-16_x
        nodePackages.typescript
        nodePackages.typescript-language-server

		(pkgs.writeShellScriptBin "svelteserver" ''exec svelte-server "$@"'')
    ];

	shellHook = ''
		PATH="$PWD/node_modules/.bin:$PATH"
	'';
}
