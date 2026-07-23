# tokenmaxxingman — reproducible dev environment.
#
# `nix develop` drops you into a shell with the exact toolchain CI uses:
# Node 26 (the "current" leg of the CI matrix), pnpm (pinned via
# package.json's packageManager field), and just. From there every project
# task works: `pnpm install`, `pnpm test`, `just ci`, `just web-dev`, etc.
#
# The shell also installs a git pre-commit/pre-push hook set (see `checks`
# below): Nix hygiene for this file, plus a `check-author` pre-push guard that
# enforces the repo's KangaZero-only commit identity rule (CLAUDE.md: the work
# email must never appear in history).
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    # Restrict to the Nix systems we actually build on. (nix-systems/default
    # has no inputs, so no `follows` override is applicable here.)
    systems.url = "github:nix-systems/default";

    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      systems,
      ...
    }@inputs:
    let
      forEachSystem =
        f: nixpkgs.lib.genAttrs (import systems) (system: f system nixpkgs.legacyPackages.${system});
    in
    {
      checks = forEachSystem (
        system: pkgs: {
          pre-commit-check = inputs.git-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              # Nix hygiene — keeps flake.nix formatted and lint-clean.
              nixfmt.enable = true;
              statix.enable = true;
              deadnix.enable = true;

              # Pre-push identity guard. CLAUDE.md is emphatic: every commit
              # must be authored AND committed by KangaZero
              # <samuelyongw@gmail.com>. This rejects a push the moment any
              # incoming commit's author or committer email is anything else,
              # so the work email can never reach the remote history.
              check-author = {
                enable = true;
                name = "check git author";
                # writeShellScriptBin places the binary at $out/bin/<name>;
                # the entry must therefore suffix /bin/check-author.
                entry = "${pkgs.writeShellScriptBin "check-author" ''
                  expected="samuelyongw@gmail.com"
                  zero="0000000000000000000000000000000000000000"
                  while IFS=' ' read -r _local_ref local_sha _remote_ref remote_sha; do
                    # Skip branch deletions.
                    [ "$local_sha" = "$zero" ] && continue

                    # Isolate only the new incoming commits.
                    if [ "$remote_sha" = "$zero" ]; then
                      commits=$(git rev-list "$local_sha" --not --remotes 2>/dev/null)
                    else
                      commits=$(git rev-list "$remote_sha..$local_sha" 2>/dev/null)
                    fi

                    [ -z "$commits" ] && continue

                    while IFS= read -r commit; do
                      IFS='|' read -r author_email committer_email <<< "$(git log -1 --format="%ae|%ce" "$commit" 2>/dev/null)"

                      if [ "$author_email" != "$expected" ]; then
                        echo "Push rejected: $commit not authored by KangaZero <$expected> (got: $author_email)"
                        exit 1
                      fi
                      if [ "$committer_email" != "$expected" ]; then
                        echo "Push rejected: $commit not committed by KangaZero <$expected> (got: $committer_email)"
                        exit 1
                      fi
                    done <<< "$commits"
                  done
                ''}/bin/check-author";
                language = "system";
                pass_filenames = false;
                always_run = true;
                stages = [ "pre-push" ];
              };
            };
          };
        }
      );

      devShells = forEachSystem (
        system: pkgs: {
          default = pkgs.mkShell {
            # Install the git hooks defined above, then print a short banner
            # pointing at the task runner and the Claude-skill linker.
            shellHook = self.checks.${system}.pre-commit-check.shellHook + ''
              echo "tokenmaxxingman dev shell — node $(node --version), pnpm $(pnpm --version)"
              echo "run 'just' to list tasks · 'just install-skills' to link Claude skills"
            '';

            packages = [
              # Node 26 (current) — matches the CI matrix's upper leg. pnpm is
              # pinned via package.json's packageManager field, so corepack
              # resolves the exact version; the nix pkgs.pnpm is only the
              # bootstrap. TypeScript comes from node_modules, not nix.
              pkgs.nodejs_26
              pkgs.pnpm
              pkgs.just
            ]
            ++ self.checks.${system}.pre-commit-check.enabledPackages;
          };
        }
      );
    };
}
