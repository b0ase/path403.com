# PATH402 Indexer

Lightweight BSV-20 token indexer for PATH402. Runs on Hetzner VPS.

## Quick Commands

```bash
# Deploy
./deploy.sh

# Check status
ssh hetzner 'systemctl status path402-indexer'

# View logs
ssh hetzner 'sudo journalctl -u path402-indexer -f'

# Restart
ssh hetzner 'sudo systemctl restart path402-indexer'
```

## Full Documentation

See [docs/INDEXER.md](../docs/INDEXER.md)
