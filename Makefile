.PHONY: smoke-staging smoke-prod smoke-x402-real

smoke-staging:
	./scripts/smoke-staging.sh

smoke-prod:
	./scripts/smoke-prod.sh

smoke-x402-real:
	./scripts/smoke-x402-real.sh
