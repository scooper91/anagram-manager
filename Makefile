.SILENT:

test:
	docker build test -t test
	docker run --rm -t \
		-v $$PWD:/app -w /app/test \
		test \
		sh -c 'npm i && npm test'
.PHONY: test

deploy:
	git config --local user.name $(GITHUB_ACTOR)
	git config --local user.email '$(GITHUB_ACTOR)@users.noreply.github.com'
	git checkout gh-pages || (git checkout --orphan gh-pages && git rm -rf .)
	git checkout master website
	git mv -f website/* .
	git commit -m 'Deploy changes up to $(GITHUB_SHA)'
	git push -q --repo "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" -u origin gh-pages > /dev/null 2>&1 || die 1 'Push failed'
.PHONY: deploy
