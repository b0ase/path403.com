// $pathd - A tiny daemon that lets private networks price access to files
//
// Part of the $PATH protocol stack:
// - $PATH protocol (the idea)
// - $402 spec (the HTTP response format)
// - $pathd (the daemon) ← YOU ARE HERE
// - path402-mcp-server (the agent tool)
// - b0ase.com/exchange (the hosted marketplace)
package main

import (
	"crypto/sha256"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/b0ase/pathd/internal/config"
	"github.com/b0ase/pathd/internal/server"
)

var (
	version    = "0.1.0"
	configFile = flag.String("config", "pathd.yaml", "Path to config file")
	showVersion = flag.Bool("version", false, "Show version")
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "publish" {
		if err := runPublish(os.Args[2:]); err != nil {
			log.Fatalf("Publish failed: %v", err)
		}
		return
	}

	flag.Parse()

	if *showVersion {
		fmt.Printf("pathd %s\n", version)
		os.Exit(0)
	}

	// Banner
	fmt.Println(`
    ██████╗  █████╗ ████████╗██╗  ██╗██████╗
    ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔══██╗
    ██████╔╝███████║   ██║   ███████║██║  ██║
    ██╔═══╝ ██╔══██║   ██║   ██╔══██║██║  ██║
    ██║     ██║  ██║   ██║   ██║  ██║██████╔╝
    ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝
    A tiny daemon for pricing access to files.
    `)
	fmt.Printf("    Version: %s\n\n", version)

	// Load config
	cfg, err := config.Load(*configFile)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	log.Printf("[pathd] Loaded config from %s", *configFile)

	// Create server
	srv, err := server.New(cfg)
	if err != nil {
		log.Fatalf("Failed to create server: %v", err)
	}

	// Handle shutdown gracefully
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("[pathd] Shutting down...")
		srv.Close()
		os.Exit(0)
	}()

	// Start server
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

type registryFile struct {
	Version string          `json:"version"`
	Entries []registryEntry `json:"entries"`
}

type publishPayload struct {
	Type    string        `json:"type"`
	Version string        `json:"version"`
	Entry   registryEntry `json:"entry"`
}

type registryEntry struct {
	Path        string            `json:"path"`
	Description string            `json:"description,omitempty"`
	Content     registryContent   `json:"content"`
	Pricing     registryPricing   `json:"pricing"`
	Issuer      registryIssuer    `json:"issuer"`
	Permissions registryPerms     `json:"permissions"`
	PublishedAt int64             `json:"published_at"`
	Node        string            `json:"node"`
}

type registryContent struct {
	Type     string `json:"type"`
	Location string `json:"location,omitempty"`
	SHA256   string `json:"sha256"`
	Size     int64  `json:"size"`
}

type registryPricing struct {
	BasePrice   int64   `json:"base_price"`
	Curve       string  `json:"curve"`
	MaxSupply   *int64  `json:"max_supply,omitempty"`
	Currency    string  `json:"currency"`
	IssuerShare float64 `json:"issuer_share"`
	ServerShare float64 `json:"server_share"`
}

type registryIssuer struct {
	Name           string `json:"name"`
	PayoutAddress  string `json:"payout_address"`
	PublishAddress string `json:"publish_address"`
}

type registryPerms struct {
	Resell bool `json:"resell"`
	Rehost bool `json:"rehost"`
}

func runPublish(args []string) error {
	fs := flag.NewFlagSet("publish", flag.ExitOnError)
	cfgPath := fs.String("config", "pathd.yaml", "Path to config file")
	path := fs.String("path", "", "Exact $PATH to publish (e.g. /$blog/$my-post)")
	outPath := fs.String("out", "pathd.registry.json", "Registry output file")
	inscribe := fs.Bool("inscribe", false, "Generate inscription payload and OP_RETURN script")
	payloadOut := fs.String("payload-out", "pathd.publish.json", "Inscription payload output file")
	opReturnOut := fs.String("opreturn-out", "pathd.publish.opreturn", "OP_RETURN hex output file")
	estimateFee := fs.Bool("estimate-fee", false, "Estimate fee for a basic publish transaction")
	feeRate := fs.Float64("fee-rate", 1.0, "Fee rate in sats/byte for estimation")
	if err := fs.Parse(args); err != nil {
		return err
	}
	if *path == "" {
		return fmt.Errorf("missing -path")
	}

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		return err
	}

	pathCfg := cfg.GetPath(*path)
	if pathCfg == nil {
		return fmt.Errorf("path not found in config: %s", *path)
	}

	contentBytes, size, err := readContent(pathCfg)
	if err != nil {
		return err
	}
	hash := sha256.Sum256(contentBytes)
	hashHex := fmt.Sprintf("%x", hash[:])

	entry := registryEntry{
		Path:        pathCfg.Path,
		Description: pathCfg.Description,
		Content: registryContent{
			Type:     pathCfg.Content.Type,
			Location: pathCfg.Content.Location,
			SHA256:   hashHex,
			Size:     size,
		},
		Pricing: registryPricing{
			BasePrice:   pathCfg.Pricing.BasePrice,
			Curve:       pathCfg.Pricing.Curve,
			MaxSupply:   pathCfg.Pricing.MaxSupply,
			Currency:    cfg.Pricing.Currency,
			IssuerShare: cfg.Pricing.IssuerShare,
			ServerShare: cfg.Pricing.ServerShare,
		},
		Issuer: registryIssuer{
			Name:           pathCfg.Issuer.Name,
			PayoutAddress:  pathCfg.Issuer.PayoutAddress,
			PublishAddress: cfg.Wallet.ReceiveAddress,
		},
		Permissions: registryPerms{
			Resell: pathCfg.Permissions.Resell,
			Rehost: pathCfg.Permissions.Rehost,
		},
		PublishedAt: time.Now().UTC().Unix(),
		Node:        cfg.Node.Name,
	}

	reg := registryFile{
		Version: "1.0",
	}

	if data, err := os.ReadFile(*outPath); err == nil {
		_ = json.Unmarshal(data, &reg)
	}

	updated := false
	for i := range reg.Entries {
		if reg.Entries[i].Path == entry.Path {
			reg.Entries[i] = entry
			updated = true
			break
		}
	}
	if !updated {
		reg.Entries = append(reg.Entries, entry)
	}

	if err := os.MkdirAll(filepath.Dir(*outPath), 0o755); err != nil && filepath.Dir(*outPath) != "." {
		return err
	}

	encoded, err := json.MarshalIndent(reg, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(*outPath, encoded, 0o644); err != nil {
		return err
	}

	if *inscribe || *estimateFee {
		payload := publishPayload{
			Type:    "pathd.registry",
			Version: "1.0",
			Entry:   entry,
		}
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		opReturnHex, err := buildOpReturnHex(payloadBytes)
		if err != nil {
			return err
		}

		if *inscribe {
			if err := os.WriteFile(*payloadOut, payloadBytes, 0o644); err != nil {
				return err
			}
			if err := os.WriteFile(*opReturnOut, []byte(opReturnHex), 0o644); err != nil {
				return err
			}
		}

		if *estimateFee {
			fee, size := estimatePublishFee(len(payloadBytes), *feeRate)
			fmt.Printf("Estimated tx size: %d bytes\n", size)
			fmt.Printf("Estimated fee (@ %.2f sat/byte): %d sat\n", *feeRate, fee)
		}
	}

	fmt.Printf("Published %s -> %s\n", entry.Path, *outPath)
	return nil
}

func readContent(pathCfg *config.PathConfig) ([]byte, int64, error) {
	switch pathCfg.Content.Type {
	case "file":
		data, err := os.ReadFile(pathCfg.Content.Location)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to read content file: %w", err)
		}
		return data, int64(len(data)), nil
	case "inline":
		data := []byte(pathCfg.Content.Inline)
		return data, int64(len(data)), nil
	default:
		return nil, 0, fmt.Errorf("unknown content type: %s", pathCfg.Content.Type)
	}
}

func buildOpReturnHex(data []byte) (string, error) {
	if len(data) == 0 {
		return "", fmt.Errorf("empty payload")
	}
	push, err := buildPushData(data)
	if err != nil {
		return "", err
	}
	// OP_RETURN (0x6a) + pushdata
	return "6a" + push, nil
}

func buildPushData(data []byte) (string, error) {
	l := len(data)
	switch {
	case l < 0x4c:
		return fmt.Sprintf("%02x%s", l, fmt.Sprintf("%x", data)), nil
	case l <= 0xff:
		return fmt.Sprintf("4c%02x%s", l, fmt.Sprintf("%x", data)), nil
	case l <= 0xffff:
		return fmt.Sprintf("4d%04x%s", l, fmt.Sprintf("%x", data)), nil
	case l <= 0xffffffff:
		return fmt.Sprintf("4e%08x%s", l, fmt.Sprintf("%x", data)), nil
	default:
		return "", fmt.Errorf("payload too large: %d bytes", l)
	}
}

func estimatePublishFee(payloadLen int, feeRate float64) (int64, int) {
	// Assumes P2PKH input + 1 change output + 1 OP_RETURN output
	// Base tx: 10 bytes, input: 148 bytes, P2PKH output: 34 bytes
	base := 10
	inputs := 1
	changeOutputs := 1
	inputSize := 148
	outputSize := 34

	opReturnSize := opReturnOutputSize(payloadLen)
	totalSize := base + inputs*inputSize + changeOutputs*outputSize + opReturnSize
	fee := int64(float64(totalSize) * feeRate)
	return fee, totalSize
}

func opReturnOutputSize(payloadLen int) int {
	// 8 bytes value + 1 byte script len + script
	scriptLen := 1 + pushDataLen(payloadLen) // OP_RETURN + pushdata
	return 8 + 1 + scriptLen
}

func pushDataLen(payloadLen int) int {
	switch {
	case payloadLen < 0x4c:
		return 1 + payloadLen
	case payloadLen <= 0xff:
		return 2 + payloadLen
	case payloadLen <= 0xffff:
		return 3 + payloadLen
	case payloadLen <= 0xffffffff:
		return 5 + payloadLen
	default:
		return 0
	}
}
