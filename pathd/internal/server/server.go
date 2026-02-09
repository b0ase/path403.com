// Package server implements the HTTP server for $pathd
package server

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/b0ase/pathd/internal/config"
	"github.com/b0ase/pathd/internal/ledger"
	"github.com/b0ase/pathd/internal/pricing"
	"github.com/b0ase/pathd/internal/wallet"
)

// Server is the $pathd HTTP server
type Server struct {
	config *config.Config
	wallet *wallet.Wallet
	ledger *ledger.Ledger
	mux    *http.ServeMux
	paymentTimeout time.Duration
	tokenTTL       time.Duration
	tokenSecret    []byte
}

// PaymentRequired402 is the response for unpaid requests
type PaymentRequired402 struct {
	Path        string  `json:"path"`
	Price       int64   `json:"price"`
	Currency    string  `json:"currency"`
	Curve       string  `json:"curve"`
	Supply      int64   `json:"supply"`
	PayTo       string  `json:"pay_to"`
	Nonce       string  `json:"nonce"`
	Expires     int64   `json:"expires"`
	IssuerShare float64 `json:"issuer_share"`
	ServerShare float64 `json:"server_share"`
}

// New creates a new $pathd server
func New(cfg *config.Config) (*Server, error) {
	// Initialize wallet
	w, err := wallet.New(
		cfg.Wallet.Chain,
		cfg.Wallet.KeySource,
		cfg.Wallet.KeyFile,
		cfg.Wallet.ReceiveAddress,
		cfg.Wallet.VerifyMode,
		cfg.Wallet.RPC.URL,
		cfg.Wallet.RPC.User,
		cfg.Wallet.RPC.Password,
		cfg.Wallet.MinConfirmations,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize wallet: %w", err)
	}

	// Initialize ledger
	l, err := ledger.New(cfg.Serving.Ledger)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize ledger: %w", err)
	}

	paymentTimeout, err := time.ParseDuration(cfg.Limits.PaymentTimeout)
	if err != nil {
		return nil, fmt.Errorf("invalid payment_timeout: %w", err)
	}
	tokenTTL, err := time.ParseDuration(cfg.Serving.TokenTTL)
	if err != nil {
		return nil, fmt.Errorf("invalid token_ttl: %w", err)
	}

	tokenSecret := []byte(cfg.Serving.TokenSecret)
	if len(tokenSecret) == 0 {
		secret := make([]byte, 32)
		if _, err := randRead(secret); err != nil {
			return nil, fmt.Errorf("failed to generate token secret: %w", err)
		}
		tokenSecret = secret
		log.Printf("[pathd] Warning: token_secret not set, generated ephemeral secret")
	}

	s := &Server{
		config: cfg,
		wallet: w,
		ledger: l,
		mux:    http.NewServeMux(),
		paymentTimeout: paymentTimeout,
		tokenTTL:       tokenTTL,
		tokenSecret:    tokenSecret,
	}

	// Register routes
	s.mux.HandleFunc("/", s.handlePath)
	s.mux.HandleFunc("/_pathd/stats", s.handleStats)
	s.mux.HandleFunc("/_pathd/health", s.handleHealth)

	return s, nil
}

// Start begins listening for requests
func (s *Server) Start() error {
	log.Printf("[pathd] Starting on %s", s.config.Node.Listen)
	log.Printf("[pathd] Node name: %s", s.config.Node.Name)
	log.Printf("[pathd] Serving %d paths", len(s.config.Paths))

	return http.ListenAndServe(s.config.Node.Listen, s.mux)
}

// handlePath handles requests to $PATH addresses
func (s *Server) handlePath(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	// Normalize path to $PATH format
	if !strings.HasPrefix(path, "/$") {
		path = "/$" + strings.TrimPrefix(path, "/")
	}

	log.Printf("[pathd] Request: %s %s", r.Method, path)

	// Find the path config
	pathCfg := s.config.GetPath(path)
	if pathCfg == nil {
		http.Error(w, "Path not found", http.StatusNotFound)
		return
	}

	// Check for payment proof
	txID := r.Header.Get("X-Path-Payment")
	if txID == "" {
		// No payment - return 402
		s.return402(w, path, pathCfg)
		return
	}

	nonce := r.Header.Get("X-Path-Nonce")
	if nonce == "" {
		s.return402(w, path, pathCfg)
		return
	}

	inv, err := s.ledger.GetInvoice(nonce)
	if err != nil {
		s.return402(w, path, pathCfg)
		return
	}
	if inv == nil || inv.Path != path || time.Now().Unix() > inv.Expires {
		s.return402(w, path, pathCfg)
		return
	}

	// Verify payment
	payment := wallet.Payment{
		TxID:      strings.TrimPrefix(txID, "txid="),
		Nonce:     nonce,
		Signature: r.Header.Get("X-Path-Signature"),
	}

	if err := s.wallet.VerifyPayment(payment, inv.Amount); err != nil {
		s.return402(w, path, pathCfg)
		return
	}

	// Payment verified - serve content
	_ = s.ledger.DeleteInvoice(nonce)
	s.serveContent(w, r, path, pathCfg, payment, inv.Amount)
}

// return402 sends a 402 Payment Required response
func (s *Server) return402(w http.ResponseWriter, path string, pathCfg *config.PathConfig) {
	supply, _ := s.ledger.GetSupply(path)

	curve, _ := pricing.ParseCurve(pathCfg.Pricing.Curve)
	calc := pricing.NewCalculator(pathCfg.Pricing.BasePrice, curve, supply)
	price := calc.CurrentPrice()

	invoice, _ := s.wallet.GenerateInvoice(path, price)
	expires := time.Now().Add(s.paymentTimeout).Unix()
	_ = s.ledger.PruneExpiredInvoices(time.Now().Unix())
	_ = s.ledger.PutInvoice(ledger.Invoice{
		Path:    path,
		Amount: price,
		Nonce:   invoice.Nonce,
		Expires: expires,
	})

	resp := PaymentRequired402{
		Path:        path,
		Price:       price,
		Currency:    s.config.Pricing.Currency,
		Curve:       pathCfg.Pricing.Curve,
		Supply:      supply,
		PayTo:       invoice.Address,
		Nonce:       invoice.Nonce,
		Expires:     expires,
		IssuerShare: s.config.Pricing.IssuerShare,
		ServerShare: s.config.Pricing.ServerShare,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Path-Protocol", "1.0")
	w.WriteHeader(http.StatusPaymentRequired)
	json.NewEncoder(w).Encode(resp)
}

// serveContent delivers the content after payment verification
func (s *Server) serveContent(w http.ResponseWriter, r *http.Request, path string, pathCfg *config.PathConfig, payment wallet.Payment, pricePaid int64) {
	// Calculate revenue split
	split := pricing.CalculateSplit(pricePaid, s.config.Pricing.IssuerShare, s.config.Pricing.ServerShare)

	// Record the serve event
	event := ledger.ServeEvent{
		Path:        path,
		ServedBy:    s.config.Node.Name,
		ServedTo:    r.RemoteAddr,
		PricePaid:   pricePaid,
		IssuerShare: split.IssuerShare,
		ServerShare: split.ServerShare,
		TxID:        payment.TxID,
	}

	if err := s.ledger.RecordServe(event); err != nil {
		log.Printf("[pathd] Failed to record serve: %v", err)
	}

	// Read and serve content
	var content []byte
	var err error

	switch pathCfg.Content.Type {
	case "file":
		content, err = os.ReadFile(pathCfg.Content.Location)
	case "inline":
		content = []byte(pathCfg.Content.Inline)
	default:
		http.Error(w, "Unknown content type", http.StatusInternalServerError)
		return
	}

	if err != nil {
		log.Printf("[pathd] Failed to read content: %v", err)
		http.Error(w, "Failed to read content", http.StatusInternalServerError)
		return
	}

	if pathCfg.Content.SHA256 != "" {
		sum := sha256.Sum256(content)
		actual := fmt.Sprintf("%x", sum[:])
		expected := strings.ToLower(strings.TrimSpace(pathCfg.Content.SHA256))
		if actual != expected {
			log.Printf("[pathd] Content hash mismatch for %s", path)
			http.Error(w, "Content integrity check failed", http.StatusInternalServerError)
			return
		}
	}

	// Detect content type
	contentType := http.DetectContentType(content)
	if strings.HasSuffix(pathCfg.Content.Location, ".md") {
		contentType = "text/markdown"
	} else if strings.HasSuffix(pathCfg.Content.Location, ".json") {
		contentType = "application/json"
	}

	token, err := s.buildServeToken(path, payment.TxID, pricePaid)
	if err == nil && token != "" {
		w.Header().Set("X-Path-Token", token)
	}
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("X-Path-Protocol", "1.0")
	w.Header().Set("X-Path-Served-By", s.config.Node.Name)
	w.Header().Set("X-Path-Price-Paid", fmt.Sprintf("%d", pricePaid))

	w.WriteHeader(http.StatusOK)
	w.Write(content)

	log.Printf("[pathd] Served %s to %s (paid %d SAT)", path, r.RemoteAddr, pricePaid)
}

// handleStats returns daemon statistics
func (s *Server) handleStats(w http.ResponseWriter, r *http.Request) {
	stats, err := s.ledger.GetStats()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	stats["node_name"] = s.config.Node.Name
	stats["paths_configured"] = len(s.config.Paths)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// handleHealth returns health check
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"node":   s.config.Node.Name,
		"time":   time.Now().UTC(),
	})
}

// Close shuts down the server
func (s *Server) Close() error {
	return s.ledger.Close()
}

func (s *Server) buildServeToken(path string, txid string, pricePaid int64) (string, error) {
	header := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}
	now := time.Now()
	payload := map[string]interface{}{
		"iss":       s.config.Node.Name,
		"path":      path,
		"txid":      txid,
		"price_sat": pricePaid,
		"iat":       now.Unix(),
		"exp":       now.Add(s.tokenTTL).Unix(),
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	enc := base64.RawURLEncoding
	headerB64 := enc.EncodeToString(headerJSON)
	payloadB64 := enc.EncodeToString(payloadJSON)
	signingInput := headerB64 + "." + payloadB64

	mac := hmac.New(sha256.New, s.tokenSecret)
	_, _ = mac.Write([]byte(signingInput))
	sig := mac.Sum(nil)
	sigB64 := enc.EncodeToString(sig)

	return signingInput + "." + sigB64, nil
}

// randRead is a wrapper to keep crypto/rand out of the import list when unused elsewhere.
func randRead(b []byte) (int, error) {
	return rand.Read(b)
}
