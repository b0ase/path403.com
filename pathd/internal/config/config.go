// Package config handles $pathd configuration loading and validation
package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config represents the complete $pathd configuration
type Config struct {
	Node    NodeConfig    `yaml:"node"`
	Wallet  WalletConfig  `yaml:"wallet"`
	Pricing PricingConfig `yaml:"pricing"`
	Paths   []PathConfig  `yaml:"paths"`
	Serving ServingConfig `yaml:"serving"`
	Limits  LimitsConfig  `yaml:"limits"`
	Logging LoggingConfig `yaml:"logging"`
}

// NodeConfig identifies this daemon instance
type NodeConfig struct {
	Name   string `yaml:"name"`
	Listen string `yaml:"listen"`
}

// WalletConfig handles BSV wallet settings
type WalletConfig struct {
	Chain            string `yaml:"chain"`
	KeySource        string `yaml:"key_source"`
	KeyFile          string `yaml:"key_file"`
	ReceiveAddress   string `yaml:"receive_address"`
	MinConfirmations int    `yaml:"min_confirmations"`
	VerifyMode       string `yaml:"verify_mode"` // rpc or stub
	RPC              RPCConfig `yaml:"rpc"`
}

// PricingConfig sets default pricing behavior
type PricingConfig struct {
	Currency     string  `yaml:"currency"`
	DefaultCurve string  `yaml:"default_curve"`
	IssuerShare  float64 `yaml:"issuer_share"`
	ServerShare  float64 `yaml:"server_share"`
}

// PathConfig defines a single $PATH served by this node
type PathConfig struct {
	Path        string            `yaml:"path"`
	Description string            `yaml:"description"`
	Content     ContentConfig     `yaml:"content"`
	Pricing     PathPricingConfig `yaml:"pricing"`
	Issuer      IssuerConfig      `yaml:"issuer"`
	Permissions PermissionsConfig `yaml:"permissions"`
}

// ContentConfig specifies where the content lives
type ContentConfig struct {
	Type     string `yaml:"type"`     // "file" or "inline"
	Location string `yaml:"location"` // file path
	SHA256   string `yaml:"sha256"`   // optional integrity hash
	Inline   string `yaml:"inline"`   // inline content if type=inline
}

// PathPricingConfig overrides default pricing for a specific path
type PathPricingConfig struct {
	BasePrice int64  `yaml:"base_price"`
	Curve     string `yaml:"curve"`
	MaxSupply *int64 `yaml:"max_supply"`
}

// IssuerConfig identifies the content creator
type IssuerConfig struct {
	Name          string `yaml:"name"`
	PayoutAddress string `yaml:"payout_address"`
}

// PermissionsConfig controls what buyers can do
type PermissionsConfig struct {
	Resell bool `yaml:"resell"`
	Rehost bool `yaml:"rehost"`
}

// ServingConfig controls the serving ledger
type ServingConfig struct {
	Ledger                  string `yaml:"ledger"`
	PayoutInterval          string `yaml:"payout_interval"`
	AllowThirdPartyServing  bool   `yaml:"allow_third_party_serving"`
	TokenSecret             string `yaml:"token_secret"`
	TokenTTL                string `yaml:"token_ttl"`
}

// LimitsConfig sets rate limits and constraints
type LimitsConfig struct {
	MaxRequestSize string `yaml:"max_request_size"`
	RateLimit      int    `yaml:"rate_limit"`
	PaymentTimeout string `yaml:"payment_timeout"`
}

// LoggingConfig controls logging behavior
type LoggingConfig struct {
	Level string `yaml:"level"`
	File  string `yaml:"file"`
}

// RPCConfig holds JSON-RPC connection settings for a local node
type RPCConfig struct {
	URL      string `yaml:"url"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// Load reads and parses a $pathd.yaml config file
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return &cfg, nil
}

// Validate checks the config for required fields and consistency
func (c *Config) Validate() error {
	if c.Node.Listen == "" {
		c.Node.Listen = "127.0.0.1:4020"
	}
	if c.Node.Name == "" {
		c.Node.Name = "pathd-node"
	}
	if c.Pricing.Currency == "" {
		c.Pricing.Currency = "SAT"
	}
	if c.Pricing.DefaultCurve == "" {
		c.Pricing.DefaultCurve = "sqrt_decay"
	}
	if c.Pricing.IssuerShare == 0 && c.Pricing.ServerShare == 0 {
		c.Pricing.IssuerShare = 0.2
		c.Pricing.ServerShare = 0.8
	}
	if c.Serving.Ledger == "" {
		c.Serving.Ledger = "./ledger.db"
	}
	if c.Wallet.VerifyMode == "" {
		c.Wallet.VerifyMode = "stub"
	}
	if c.Serving.TokenTTL == "" {
		c.Serving.TokenTTL = "24h"
	}
	if c.Limits.PaymentTimeout == "" {
		c.Limits.PaymentTimeout = "5m"
	}

	// Validate paths
	for i, p := range c.Paths {
		if p.Path == "" {
			return fmt.Errorf("path %d: missing path", i)
		}
		if p.Content.Type == "" {
			c.Paths[i].Content.Type = "file"
		}
		if p.Content.Type == "file" && p.Content.Location == "" {
			return fmt.Errorf("path %d (%s): missing content location", i, p.Path)
		}
		if p.Pricing.Curve == "" {
			c.Paths[i].Pricing.Curve = c.Pricing.DefaultCurve
		}
	}

	return nil
}

// GetPath returns the config for a specific $PATH, or nil if not found
func (c *Config) GetPath(path string) *PathConfig {
	for _, p := range c.Paths {
		if p.Path == path {
			return &p
		}
	}
	return nil
}
