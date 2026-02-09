// Package wallet provides minimal BSV wallet functionality for $pathd
package wallet

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"strings"
)

// Wallet represents a minimal BSV wallet
type Wallet struct {
	PrivateKey     []byte
	ReceiveAddress string
	Chain          string
	VerifyMode     string
	RPCURL         string
	RPCUser        string
	RPCPassword    string
	MinConfirmations int
}

// Payment represents a payment to verify
type Payment struct {
	TxID      string
	Amount    int64
	Nonce     string
	Signature string
}

// New creates a new wallet from config
func New(chain, keySource, keyFile, receiveAddress string, verifyMode string, rpcURL string, rpcUser string, rpcPassword string, minConfirmations int) (*Wallet, error) {
	w := &Wallet{
		ReceiveAddress: receiveAddress,
		Chain:          chain,
		VerifyMode:     verifyMode,
		RPCURL:         rpcURL,
		RPCUser:        rpcUser,
		RPCPassword:    rpcPassword,
		MinConfirmations: minConfirmations,
	}

	switch keySource {
	case "file":
		key, err := loadKeyFromFile(keyFile)
		if err != nil {
			return nil, fmt.Errorf("failed to load key: %w", err)
		}
		w.PrivateKey = key

	case "generate":
		key := make([]byte, 32)
		if _, err := rand.Read(key); err != nil {
			return nil, fmt.Errorf("failed to generate key: %w", err)
		}
		w.PrivateKey = key

	case "env":
		keyHex := os.Getenv("PATHD_PRIVATE_KEY")
		if keyHex == "" {
			return nil, fmt.Errorf("PATHD_PRIVATE_KEY environment variable not set")
		}
		key, err := hex.DecodeString(keyHex)
		if err != nil {
			return nil, fmt.Errorf("invalid key in PATHD_PRIVATE_KEY: %w", err)
		}
		w.PrivateKey = key

	default:
		return nil, fmt.Errorf("unknown key source: %s", keySource)
	}

	return w, nil
}

// loadKeyFromFile reads a private key from a file
func loadKeyFromFile(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// Trim whitespace and decode hex
	keyHex := strings.TrimSpace(string(data))
	return hex.DecodeString(keyHex)
}

// GenerateInvoice creates a payment request for a specific path and amount
func (w *Wallet) GenerateInvoice(path string, amount int64) (*Invoice, error) {
	// Generate a random nonce
	nonceBytes := make([]byte, 16)
	if _, err := rand.Read(nonceBytes); err != nil {
		return nil, err
	}
	nonce := hex.EncodeToString(nonceBytes)

	return &Invoice{
		Path:    path,
		Amount:  amount,
		Address: w.ReceiveAddress,
		Nonce:   nonce,
		Chain:   w.Chain,
	}, nil
}

// Invoice represents a payment request
type Invoice struct {
	Path    string `json:"path"`
	Amount  int64  `json:"amount"`
	Address string `json:"pay_to"`
	Nonce   string `json:"nonce"`
	Chain   string `json:"chain"`
	Expires int64  `json:"expires,omitempty"`
}

// VerifyPayment checks if a payment is valid
// In v0, this is a stub - real implementation would check on-chain
func (w *Wallet) VerifyPayment(payment Payment, expectedAmount int64) error {
	switch w.VerifyMode {
	case "stub":
		return w.verifyStub(payment)
	case "rpc":
		return w.verifyRPC(payment, expectedAmount)
	default:
		return fmt.Errorf("unknown verify mode: %s", w.VerifyMode)
	}
}

func (w *Wallet) verifyStub(payment Payment) error {
	// Accept any payment with a valid-looking txid (dev only)

	if payment.TxID == "" {
		return fmt.Errorf("missing transaction ID")
	}

	if len(payment.TxID) != 64 {
		return fmt.Errorf("invalid transaction ID format")
	}

	return nil
}

type rpcRequest struct {
	JSONRPC string        `json:"jsonrpc"`
	ID      string        `json:"id"`
	Method  string        `json:"method"`
	Params  []interface{} `json:"params"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type rpcResponse struct {
	Result json.RawMessage `json:"result"`
	Error  *rpcError       `json:"error"`
	ID     string          `json:"id"`
}

type rpcTxResult struct {
	TxID          string `json:"txid"`
	Confirmations int    `json:"confirmations"`
	Vout          []struct {
		Value        float64 `json:"value"`
		ScriptPubKey struct {
			Addresses []string `json:"addresses"`
		} `json:"scriptPubKey"`
	} `json:"vout"`
}

func (w *Wallet) verifyRPC(payment Payment, expectedAmount int64) error {
	if w.RPCURL == "" {
		return fmt.Errorf("rpc url not configured")
	}
	if payment.TxID == "" {
		return fmt.Errorf("missing transaction ID")
	}

	tx, err := w.getRawTransaction(payment.TxID)
	if err != nil {
		return err
	}

	if tx.Confirmations < w.MinConfirmations {
		return fmt.Errorf("insufficient confirmations: %d", tx.Confirmations)
	}

	var paidSats int64
	for _, out := range tx.Vout {
		if containsAddress(out.ScriptPubKey.Addresses, w.ReceiveAddress) {
			paidSats += bsvToSats(out.Value)
		}
	}

	if paidSats < expectedAmount {
		return fmt.Errorf("payment amount too low: %d < %d", paidSats, expectedAmount)
	}

	return nil
}

func (w *Wallet) getRawTransaction(txid string) (*rpcTxResult, error) {
	reqBody := rpcRequest{
		JSONRPC: "1.0",
		ID:      "pathd",
		Method:  "getrawtransaction",
		Params:  []interface{}{txid, 1},
	}
	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", w.RPCURL, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if w.RPCUser != "" || w.RPCPassword != "" {
		req.SetBasicAuth(w.RPCUser, w.RPCPassword)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var rpcResp rpcResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, err
	}
	if rpcResp.Error != nil {
		return nil, fmt.Errorf("rpc error %d: %s", rpcResp.Error.Code, rpcResp.Error.Message)
	}

	var tx rpcTxResult
	if err := json.Unmarshal(rpcResp.Result, &tx); err != nil {
		return nil, err
	}
	return &tx, nil
}

func containsAddress(addrs []string, target string) bool {
	for _, a := range addrs {
		if a == target {
			return true
		}
	}
	return false
}

func bsvToSats(bsv float64) int64 {
	return int64(math.Round(bsv * 1e8))
}

// GetBalance returns the wallet balance
// In v0, this is a stub
func (w *Wallet) GetBalance() (int64, error) {
	// TODO: Query BSV node/API for balance
	return 0, nil
}

// SendPayment sends SATs to an address
// In v0, this is a stub
func (w *Wallet) SendPayment(toAddress string, amount int64) (string, error) {
	// TODO: Implement actual BSV transaction creation and broadcast
	return "", fmt.Errorf("send not implemented in v0")
}
