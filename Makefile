.SILENT:

test:
	docker build test -t test
	docker run --rm -t \
		-v $$PWD:/app -w /app/test \
		test \
		sh -c 'npm i && npm test'
.PHONY: test
